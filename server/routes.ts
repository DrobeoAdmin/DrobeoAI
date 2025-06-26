import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertClothingItemSchema, 
  insertOutfitSchema, 
  insertOutfitCalendarSchema,
  insertWishlistItemSchema,
  insertPhoneVerificationSchema,
  occasionSchema,
  weatherSchema,
  seasonSchema
} from "@shared/schema";
import { analyzeClothingImage, generateOutfitSuggestions, getStyleAdvice } from "./services/openai";
import { SMSService } from "./services/sms";
import { getSession, hashPassword, verifyPassword, requireAuth, optionalAuth } from "./auth";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(getSession());
  
  // Helper function to get current user ID
  const getCurrentUserId = (req: any): number => {
    return req.session?.userId || 1; // Fallback to demo user for existing functionality
  };

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const signupData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(signupData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(signupData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(signupData.password);
      const newUser = await storage.createUser({
        ...signupData,
        password: hashedPassword,
        onboardingComplete: false,
        preferences: {}
      });

      // Create session
      req.session.userId = newUser.id;
      req.session.isAuthenticated = true;

      res.json({ 
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          name: newUser.name,
          onboardingComplete: newUser.onboardingComplete 
        } 
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid signup data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await verifyPassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.isAuthenticated = true;

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Phone authentication routes
  app.post("/api/auth/phone/request-code", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const code = SMSService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createPhoneVerification({
        phoneNumber,
        code,
        expiresAt
      });

      const sent = await SMSService.sendVerificationCode(phoneNumber, code);
      
      if (!sent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }

      res.json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Phone verification error:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/phone/verify", async (req, res) => {
    try {
      const { phoneNumber, code, name } = req.body;
      
      if (!phoneNumber || !code || !name) {
        return res.status(400).json({ message: "Phone number, code, and name are required" });
      }

      const verification = await storage.getPhoneVerification(phoneNumber, code);
      if (!verification) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      let user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        // Generate a username from phone number (remove +1 and take last 10 digits)
        const username = `user_${phoneNumber.replace(/[^\d]/g, '').slice(-10)}`;
        
        user = await storage.createUser({
          username,
          phoneNumber,
          phoneVerified: true,
          name,
          onboardingComplete: false
        });
      } else {
        user = await storage.updateUser(user.id, { phoneVerified: true });
      }

      await storage.markPhoneVerified(phoneNumber);

      req.session.userId = user.id;
      req.session.isAuthenticated = true;

      // Explicitly save the session to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        res.json({ 
          user: { 
            id: user.id, 
            phoneNumber: user.phoneNumber,
            name: user.name,
            phoneVerified: user.phoneVerified,
            onboardingComplete: user.onboardingComplete 
          } 
        });
      });
    } catch (error) {
      console.error("Phone verification error:", error);
      res.status(400).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/phone/login", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      
      if (!phoneNumber || !code) {
        return res.status(400).json({ message: "Phone number and code are required" });
      }

      const verification = await storage.getPhoneVerification(phoneNumber, code);
      if (!verification) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.markPhoneVerified(phoneNumber);

      req.session.userId = user.id;
      req.session.isAuthenticated = true;

      // Explicitly save the session to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        res.json({ 
          user: { 
            id: user.id, 
            phoneNumber: user.phoneNumber,
            name: user.name,
            phoneVerified: user.phoneVerified,
            onboardingComplete: user.onboardingComplete 
          } 
        });
      });
    } catch (error) {
      console.error("Phone login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      console.log("GET /api/auth/user - Session check:", {
        isAuthenticated: req.session.isAuthenticated,
        userId: req.session.userId,
        sessionId: req.sessionID,
        cookies: req.headers.cookie
      });

      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        onboardingComplete: user.onboardingComplete 
      });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/complete-onboarding", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { preferences } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        onboardingComplete: true,
        preferences: preferences || {}
      });

      res.json({ 
        user: { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          email: updatedUser.email,
          name: updatedUser.name,
          onboardingComplete: updatedUser.onboardingComplete 
        } 
      });
    } catch (error) {
      console.error("Onboarding completion error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Clothing Items
  app.get("/api/clothing-items", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);

      const { categoryId, season, color, search } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (season) filters.season = season as string;
      if (color) filters.color = color as string;
      if (search) filters.search = search as string;

      const items = await storage.getClothingItems(userId, filters);
      
      // Enrich with category information
      const categories = await storage.getCategories();
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));
      
      const enrichedItems = items.map(item => ({
        ...item,
        category: categoriesMap.get(item.categoryId)
      }));

      res.json(enrichedItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clothing items" });
    }
  });

  app.get("/api/clothing-items/recent", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const limit = parseInt(req.query.limit as string) || 4;
      const items = await storage.getRecentlyAddedItems(userId, limit);
      
      // Enrich with category information
      const categories = await storage.getCategories();
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));
      
      const enrichedItems = items.map(item => ({
        ...item,
        category: categoriesMap.get(item.categoryId)
      }));

      res.json(enrichedItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent items" });
    }
  });

  app.post("/api/clothing-items", upload.single('image'), async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let itemData = req.body;
      
      // If image is uploaded, analyze it with AI
      if (req.file) {
        const base64Image = req.file.buffer.toString('base64');
        try {
          const analysis = await analyzeClothingImage(base64Image);
          
          // Override form data with AI analysis if not provided
          if (!itemData.categoryId) {
            const categories = await storage.getCategories();
            const matchingCategory = categories.find(cat => 
              cat.name.toLowerCase() === analysis.category.toLowerCase()
            );
            if (matchingCategory) {
              itemData.categoryId = matchingCategory.id;
            }
          }
          
          if (!itemData.color) itemData.color = analysis.color;
          if (!itemData.season) itemData.season = analysis.season;
          if (!itemData.tags) itemData.tags = [analysis.style, analysis.pattern].filter(Boolean);
          
          // Store image as data URL (in production, upload to cloud storage)
          itemData.imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        } catch (aiError) {
          console.error("AI analysis failed:", aiError);
          // Continue without AI analysis
          itemData.imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        }
      }

      // Validate and create item
      const validationSchema = insertClothingItemSchema.extend({
        categoryId: z.number(),
        userId: z.number(),
      });

      const validatedData = validationSchema.parse({
        ...itemData,
        userId: user.id,
        categoryId: parseInt(itemData.categoryId),
        tags: Array.isArray(itemData.tags) ? itemData.tags : itemData.tags?.split(',').map((tag: string) => tag.trim()) || [],
      });

      const item = await storage.createClothingItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating clothing item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create clothing item" });
    }
  });

  app.put("/api/clothing-items/:id", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;

      // Verify ownership
      const item = await storage.getClothingItem(id);
      if (!item || item.userId !== user.id) {
        return res.status(404).json({ message: "Item not found" });
      }

      const updatedItem = await storage.updateClothingItem(id, updates);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update clothing item" });
    }
  });

  app.delete("/api/clothing-items/:id", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);

      // Verify ownership
      const item = await storage.getClothingItem(id);
      if (!item || item.userId !== user.id) {
        return res.status(404).json({ message: "Item not found" });
      }

      await storage.deleteClothingItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete clothing item" });
    }
  });

  // Outfits
  app.get("/api/outfits", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { occasion, weatherCondition, aiGenerated } = req.query;
      const filters: any = {};
      
      if (occasion) filters.occasion = occasion as string;
      if (weatherCondition) filters.weatherCondition = weatherCondition as string;
      if (aiGenerated !== undefined) filters.aiGenerated = aiGenerated === 'true';

      const outfits = await storage.getOutfits(user.id, filters);
      
      // Enrich with clothing items
      const enrichedOutfits = await Promise.all(
        outfits.map(async (outfit) => {
          const items = await Promise.all(
            outfit.itemIds.map(id => storage.getClothingItem(id))
          );
          return {
            ...outfit,
            items: items.filter(Boolean)
          };
        })
      );

      res.json(enrichedOutfits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outfits" });
    }
  });

  app.post("/api/outfits", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validationSchema = insertOutfitSchema.extend({
        userId: z.number(),
      });

      const validatedData = validationSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const outfit = await storage.createOutfit(validatedData);
      res.status(201).json(outfit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create outfit" });
    }
  });

  // AI Outfit Suggestions
  app.post("/api/outfits/generate", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { occasion, weatherCondition, style, colors } = req.body;

      // Validate inputs
      if (!occasionSchema.safeParse(occasion).success) {
        return res.status(400).json({ message: "Invalid occasion" });
      }
      if (!weatherSchema.safeParse(weatherCondition).success) {
        return res.status(400).json({ message: "Invalid weather condition" });
      }

      // Get user's clothing items
      const clothingItems = await storage.getClothingItems(user.id);
      const categories = await storage.getCategories();
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));

      // Enrich items with category names for AI
      const enrichedItems = clothingItems.map(item => ({
        ...item,
        category: categoriesMap.get(item.categoryId)?.name
      }));

      if (enrichedItems.length < 3) {
        return res.status(400).json({ 
          message: "You need at least 3 clothing items to generate outfit suggestions" 
        });
      }

      const suggestions = await generateOutfitSuggestions(enrichedItems, {
        occasion,
        weatherCondition,
        style,
        colors
      });

      // Create outfit records for the suggestions
      const createdOutfits = await Promise.all(
        suggestions.map(async (suggestion) => {
          const outfit = await storage.createOutfit({
            userId: user.id,
            name: suggestion.name,
            itemIds: suggestion.items,
            occasion: suggestion.occasion,
            weatherCondition: suggestion.weatherCondition,
            rating: suggestion.rating,
            aiGenerated: true,
            aiSuggestionData: {
              styleDescription: suggestion.styleDescription,
              reasoning: suggestion.reasoning
            }
          });

          // Enrich with actual clothing items
          const items = await Promise.all(
            outfit.itemIds.map(id => storage.getClothingItem(id))
          );

          return {
            ...outfit,
            items: items.filter(Boolean)
          };
        })
      );

      res.json(createdOutfits);
    } catch (error) {
      console.error("Error generating outfit suggestions:", error);
      res.status(500).json({ message: "Failed to generate outfit suggestions" });
    }
  });

  // Style Advice
  app.post("/api/style-advice", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "Question is required" });
      }

      // Get user context
      const stats = await storage.getUserStats(user.id);
      const recentItems = await storage.getRecentlyAddedItems(user.id, 5);
      
      const userContext = {
        stats,
        recentItems: recentItems.map(item => ({
          name: item.name,
          category: item.categoryId,
          color: item.color
        }))
      };

      const advice = await getStyleAdvice(question, userContext);
      res.json({ advice });
    } catch (error) {
      console.error("Error getting style advice:", error);
      res.status(500).json({ message: "Failed to get style advice" });
    }
  });

  // Calendar
  app.get("/api/calendar", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const entries = await storage.getOutfitCalendar(user.id, start, end);
      
      // Enrich with outfit details
      const enrichedEntries = await Promise.all(
        entries.map(async (entry) => {
          if (entry.outfitId) {
            const outfit = await storage.getOutfit(entry.outfitId);
            return { ...entry, outfit };
          }
          return entry;
        })
      );

      res.json(enrichedEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar entries" });
    }
  });

  app.post("/api/calendar", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validationSchema = insertOutfitCalendarSchema.extend({
        userId: z.number(),
        date: z.string().transform(str => new Date(str)),
      });

      const validatedData = validationSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const entry = await storage.createOutfitCalendarEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create calendar entry" });
    }
  });

  // Wishlist
  app.get("/api/wishlist", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const items = await storage.getWishlistItems(user.id);
      
      // Enrich with category information
      const categories = await storage.getCategories();
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));
      
      const enrichedItems = items.map(item => ({
        ...item,
        category: categoriesMap.get(item.categoryId)
      }));

      res.json(enrichedItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validationSchema = insertWishlistItemSchema.extend({
        userId: z.number(),
      });

      const validatedData = validationSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const item = await storage.createWishlistItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create wishlist item" });
    }
  });

  // User Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
