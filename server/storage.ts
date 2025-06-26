import { 
  users, 
  categories, 
  clothingItems, 
  outfits, 
  outfitCalendar, 
  wishlistItems,
  type User, 
  type InsertUser, 
  type Category, 
  type InsertCategory,
  type ClothingItem, 
  type InsertClothingItem,
  type Outfit, 
  type InsertOutfit,
  type OutfitCalendar, 
  type InsertOutfitCalendar,
  type WishlistItem, 
  type InsertWishlistItem
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Clothing Items
  getClothingItems(userId: number, filters?: {
    categoryId?: number;
    season?: string;
    color?: string;
    search?: string;
  }): Promise<ClothingItem[]>;
  getClothingItem(id: number): Promise<ClothingItem | undefined>;
  createClothingItem(item: InsertClothingItem): Promise<ClothingItem>;
  updateClothingItem(id: number, updates: Partial<ClothingItem>): Promise<ClothingItem>;
  deleteClothingItem(id: number): Promise<void>;
  getRecentlyAddedItems(userId: number, limit?: number): Promise<ClothingItem[]>;

  // Outfits
  getOutfits(userId: number, filters?: {
    occasion?: string;
    weatherCondition?: string;
    aiGenerated?: boolean;
  }): Promise<Outfit[]>;
  getOutfit(id: number): Promise<Outfit | undefined>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: number, updates: Partial<Outfit>): Promise<Outfit>;
  deleteOutfit(id: number): Promise<void>;

  // Outfit Calendar
  getOutfitCalendar(userId: number, startDate: Date, endDate: Date): Promise<OutfitCalendar[]>;
  createOutfitCalendarEntry(entry: InsertOutfitCalendar): Promise<OutfitCalendar>;
  updateOutfitCalendarEntry(id: number, updates: Partial<OutfitCalendar>): Promise<OutfitCalendar>;
  deleteOutfitCalendarEntry(id: number): Promise<void>;

  // Wishlist
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItem(id: number): Promise<WishlistItem | undefined>;
  createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  updateWishlistItem(id: number, updates: Partial<WishlistItem>): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<void>;

  // Stats
  getUserStats(userId: number): Promise<{
    totalItems: number;
    outfitsCreated: number;
    itemsWornPercentage: number;
    wishlistItems: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private clothingItems: Map<number, ClothingItem> = new Map();
  private outfits: Map<number, Outfit> = new Map();
  private outfitCalendar: Map<number, OutfitCalendar> = new Map();
  private wishlistItems: Map<number, WishlistItem> = new Map();
  
  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentClothingItemId = 1;
  private currentOutfitId = 1;
  private currentOutfitCalendarId = 1;
  private currentWishlistItemId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const defaultCategories = [
      { name: "Tops", icon: "fas fa-tshirt", color: "#ec4899" },
      { name: "Bottoms", icon: "fas fa-user-tie", color: "#3b82f6" },
      { name: "Dresses", icon: "fas fa-female", color: "#8b5cf6" },
      { name: "Shoes", icon: "fas fa-shoe-prints", color: "#10b981" },
      { name: "Accessories", icon: "fas fa-gem", color: "#f59e0b" },
      { name: "Outerwear", icon: "fas fa-jacket", color: "#6366f1" },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = { id: this.currentCategoryId++, ...cat };
      this.categories.set(category.id, category);
    });

    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "sarah_doe",
      password: "password123",
      email: "sarah@example.com",
      name: "Sarah Johnson",
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      ...insertCategory,
    };
    this.categories.set(category.id, category);
    return category;
  }

  // Clothing Items
  async getClothingItems(userId: number, filters?: {
    categoryId?: number;
    season?: string;
    color?: string;
    search?: string;
  }): Promise<ClothingItem[]> {
    let items = Array.from(this.clothingItems.values()).filter(item => item.userId === userId);

    if (filters) {
      if (filters.categoryId) {
        items = items.filter(item => item.categoryId === filters.categoryId);
      }
      if (filters.season) {
        items = items.filter(item => item.season === filters.season || item.season === "all");
      }
      if (filters.color) {
        items = items.filter(item => 
          item.color.toLowerCase().includes(filters.color!.toLowerCase())
        );
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        items = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.brand?.toLowerCase().includes(searchTerm) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
    }

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getClothingItem(id: number): Promise<ClothingItem | undefined> {
    return this.clothingItems.get(id);
  }

  async createClothingItem(insertItem: InsertClothingItem): Promise<ClothingItem> {
    const item: ClothingItem = {
      id: this.currentClothingItemId++,
      ...insertItem,
      timesWorn: 0,
      lastWorn: null,
      createdAt: new Date(),
    };
    this.clothingItems.set(item.id, item);
    return item;
  }

  async updateClothingItem(id: number, updates: Partial<ClothingItem>): Promise<ClothingItem> {
    const item = this.clothingItems.get(id);
    if (!item) throw new Error("Item not found");
    
    const updatedItem = { ...item, ...updates };
    this.clothingItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteClothingItem(id: number): Promise<void> {
    this.clothingItems.delete(id);
  }

  async getRecentlyAddedItems(userId: number, limit = 4): Promise<ClothingItem[]> {
    const items = Array.from(this.clothingItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return items;
  }

  // Outfits
  async getOutfits(userId: number, filters?: {
    occasion?: string;
    weatherCondition?: string;
    aiGenerated?: boolean;
  }): Promise<Outfit[]> {
    let outfits = Array.from(this.outfits.values()).filter(outfit => outfit.userId === userId);

    if (filters) {
      if (filters.occasion) {
        outfits = outfits.filter(outfit => outfit.occasion === filters.occasion);
      }
      if (filters.weatherCondition) {
        outfits = outfits.filter(outfit => outfit.weatherCondition === filters.weatherCondition);
      }
      if (filters.aiGenerated !== undefined) {
        outfits = outfits.filter(outfit => outfit.aiGenerated === filters.aiGenerated);
      }
    }

    return outfits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    return this.outfits.get(id);
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const outfit: Outfit = {
      id: this.currentOutfitId++,
      ...insertOutfit,
      timesWorn: 0,
      lastWorn: null,
      createdAt: new Date(),
    };
    this.outfits.set(outfit.id, outfit);
    return outfit;
  }

  async updateOutfit(id: number, updates: Partial<Outfit>): Promise<Outfit> {
    const outfit = this.outfits.get(id);
    if (!outfit) throw new Error("Outfit not found");
    
    const updatedOutfit = { ...outfit, ...updates };
    this.outfits.set(id, updatedOutfit);
    return updatedOutfit;
  }

  async deleteOutfit(id: number): Promise<void> {
    this.outfits.delete(id);
  }

  // Outfit Calendar
  async getOutfitCalendar(userId: number, startDate: Date, endDate: Date): Promise<OutfitCalendar[]> {
    return Array.from(this.outfitCalendar.values())
      .filter(entry => 
        entry.userId === userId &&
        entry.date >= startDate &&
        entry.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createOutfitCalendarEntry(insertEntry: InsertOutfitCalendar): Promise<OutfitCalendar> {
    const entry: OutfitCalendar = {
      id: this.currentOutfitCalendarId++,
      ...insertEntry,
      createdAt: new Date(),
    };
    this.outfitCalendar.set(entry.id, entry);
    return entry;
  }

  async updateOutfitCalendarEntry(id: number, updates: Partial<OutfitCalendar>): Promise<OutfitCalendar> {
    const entry = this.outfitCalendar.get(id);
    if (!entry) throw new Error("Calendar entry not found");
    
    const updatedEntry = { ...entry, ...updates };
    this.outfitCalendar.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteOutfitCalendarEntry(id: number): Promise<void> {
    this.outfitCalendar.delete(id);
  }

  // Wishlist
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.priority - a.priority || b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getWishlistItem(id: number): Promise<WishlistItem | undefined> {
    return this.wishlistItems.get(id);
  }

  async createWishlistItem(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    const item: WishlistItem = {
      id: this.currentWishlistItemId++,
      ...insertItem,
      createdAt: new Date(),
    };
    this.wishlistItems.set(item.id, item);
    return item;
  }

  async updateWishlistItem(id: number, updates: Partial<WishlistItem>): Promise<WishlistItem> {
    const item = this.wishlistItems.get(id);
    if (!item) throw new Error("Wishlist item not found");
    
    const updatedItem = { ...item, ...updates };
    this.wishlistItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteWishlistItem(id: number): Promise<void> {
    this.wishlistItems.delete(id);
  }

  // Stats
  async getUserStats(userId: number): Promise<{
    totalItems: number;
    outfitsCreated: number;
    itemsWornPercentage: number;
    wishlistItems: number;
  }> {
    const userItems = Array.from(this.clothingItems.values()).filter(item => item.userId === userId);
    const userOutfits = Array.from(this.outfits.values()).filter(outfit => outfit.userId === userId);
    const userWishlist = Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
    
    const itemsWorn = userItems.filter(item => item.timesWorn > 0).length;
    const itemsWornPercentage = userItems.length > 0 ? Math.round((itemsWorn / userItems.length) * 100) : 0;

    return {
      totalItems: userItems.length,
      outfitsCreated: userOutfits.length,
      itemsWornPercentage,
      wishlistItems: userWishlist.length,
    };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        avatar: insertUser.avatar || null,
        onboardingComplete: insertUser.onboardingComplete || false,
        preferences: insertUser.preferences || {}
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    const { db } = await import("./db");
    const result = await db.select().from(categories);
    
    // Initialize default categories if none exist
    if (result.length === 0) {
      const defaultCategories = [
        { name: "Tops", icon: "fas fa-tshirt", color: "#3B82F6" },
        { name: "Bottoms", icon: "fas fa-jeans", color: "#10B981" },
        { name: "Shoes", icon: "fas fa-shoe-prints", color: "#F59E0B" },
        { name: "Accessories", icon: "fas fa-hat-cowboy", color: "#EF4444" },
        { name: "Outerwear", icon: "fas fa-jacket", color: "#8B5CF6" },
        { name: "Formal", icon: "fas fa-tie", color: "#6B7280" },
        { name: "Athletic", icon: "fas fa-running", color: "#EC4899" },
        { name: "Underwear", icon: "fas fa-tshirt", color: "#14B8A6" },
      ];

      for (const cat of defaultCategories) {
        await db.insert(categories).values(cat);
      }

      return await db.select().from(categories);
    }

    return result;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const { db } = await import("./db");
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getClothingItems(userId: number, filters?: {
    categoryId?: number;
    season?: string;
    color?: string;
    search?: string;
  }): Promise<ClothingItem[]> {
    const { db } = await import("./db");
    const { eq, and, like } = await import("drizzle-orm");
    
    let query = db.select().from(clothingItems).where(eq(clothingItems.userId, userId));
    
    if (filters?.categoryId) {
      query = query.where(and(eq(clothingItems.userId, userId), eq(clothingItems.categoryId, filters.categoryId)));
    }
    if (filters?.season) {
      query = query.where(and(eq(clothingItems.userId, userId), eq(clothingItems.season, filters.season)));
    }
    if (filters?.color) {
      query = query.where(and(eq(clothingItems.userId, userId), eq(clothingItems.color, filters.color)));
    }
    if (filters?.search) {
      query = query.where(and(eq(clothingItems.userId, userId), like(clothingItems.name, `%${filters.search}%`)));
    }

    return await query;
  }

  async getClothingItem(id: number): Promise<ClothingItem | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [item] = await db.select().from(clothingItems).where(eq(clothingItems.id, id));
    return item || undefined;
  }

  async createClothingItem(insertItem: InsertClothingItem): Promise<ClothingItem> {
    const { db } = await import("./db");
    const [item] = await db
      .insert(clothingItems)
      .values({
        ...insertItem,
        brand: insertItem.brand || null,
        imageUrl: insertItem.imageUrl || null,
        tags: insertItem.tags || null,
        isFavorite: insertItem.isFavorite || false,
        timesWorn: insertItem.timesWorn || 0,
        lastWorn: insertItem.lastWorn || null,
        purchaseDate: insertItem.purchaseDate || null,
        price: insertItem.price || null,
        notes: insertItem.notes || null
      })
      .returning();
    return item;
  }

  async updateClothingItem(id: number, updates: Partial<ClothingItem>): Promise<ClothingItem> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [item] = await db
      .update(clothingItems)
      .set(updates)
      .where(eq(clothingItems.id, id))
      .returning();
    return item;
  }

  async deleteClothingItem(id: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.delete(clothingItems).where(eq(clothingItems.id, id));
  }

  async getRecentlyAddedItems(userId: number, limit = 4): Promise<ClothingItem[]> {
    const { db } = await import("./db");
    const { eq, desc } = await import("drizzle-orm");
    return await db
      .select()
      .from(clothingItems)
      .where(eq(clothingItems.userId, userId))
      .orderBy(desc(clothingItems.createdAt))
      .limit(limit);
  }

  // Implement other methods similarly...
  async getOutfits(userId: number, filters?: {
    occasion?: string;
    weatherCondition?: string;
    aiGenerated?: boolean;
  }): Promise<Outfit[]> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    
    let query = db.select().from(outfits).where(eq(outfits.userId, userId));
    
    if (filters?.occasion) {
      query = query.where(and(eq(outfits.userId, userId), eq(outfits.occasion, filters.occasion)));
    }
    if (filters?.weatherCondition) {
      query = query.where(and(eq(outfits.userId, userId), eq(outfits.weatherCondition, filters.weatherCondition)));
    }
    if (filters?.aiGenerated !== undefined) {
      query = query.where(and(eq(outfits.userId, userId), eq(outfits.aiGenerated, filters.aiGenerated)));
    }

    return await query;
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit || undefined;
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const { db } = await import("./db");
    const [outfit] = await db
      .insert(outfits)
      .values({
        ...insertOutfit,
        isFavorite: insertOutfit.isFavorite || false,
        timesWorn: insertOutfit.timesWorn || 0,
        lastWorn: insertOutfit.lastWorn || null,
        weatherCondition: insertOutfit.weatherCondition || null,
        rating: insertOutfit.rating || 0,
        aiGenerated: insertOutfit.aiGenerated || false,
        aiSuggestionData: insertOutfit.aiSuggestionData || null
      })
      .returning();
    return outfit;
  }

  async updateOutfit(id: number, updates: Partial<Outfit>): Promise<Outfit> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [outfit] = await db
      .update(outfits)
      .set(updates)
      .where(eq(outfits.id, id))
      .returning();
    return outfit;
  }

  async deleteOutfit(id: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.delete(outfits).where(eq(outfits.id, id));
  }

  async getOutfitCalendar(userId: number, startDate: Date, endDate: Date): Promise<OutfitCalendar[]> {
    const { db } = await import("./db");
    const { eq, and, gte, lte } = await import("drizzle-orm");
    return await db
      .select()
      .from(outfitCalendar)
      .where(
        and(
          eq(outfitCalendar.userId, userId),
          gte(outfitCalendar.date, startDate),
          lte(outfitCalendar.date, endDate)
        )
      );
  }

  async createOutfitCalendarEntry(insertEntry: InsertOutfitCalendar): Promise<OutfitCalendar> {
    const { db } = await import("./db");
    const [entry] = await db
      .insert(outfitCalendar)
      .values({
        ...insertEntry,
        outfitId: insertEntry.outfitId || null,
        occasion: insertEntry.occasion || null,
        weatherCondition: insertEntry.weatherCondition || null,
        notes: insertEntry.notes || null
      })
      .returning();
    return entry;
  }

  async updateOutfitCalendarEntry(id: number, updates: Partial<OutfitCalendar>): Promise<OutfitCalendar> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [entry] = await db
      .update(outfitCalendar)
      .set(updates)
      .where(eq(outfitCalendar.id, id))
      .returning();
    return entry;
  }

  async deleteOutfitCalendarEntry(id: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.delete(outfitCalendar).where(eq(outfitCalendar.id, id));
  }

  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    const { db } = await import("./db");
    const { eq, desc } = await import("drizzle-orm");
    return await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.priority));
  }

  async getWishlistItem(id: number): Promise<WishlistItem | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [item] = await db.select().from(wishlistItems).where(eq(wishlistItems.id, id));
    return item || undefined;
  }

  async createWishlistItem(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    const { db } = await import("./db");
    const [item] = await db
      .insert(wishlistItems)
      .values({
        ...insertItem,
        brand: insertItem.brand || null,
        color: insertItem.color || null,
        imageUrl: insertItem.imageUrl || null,
        price: insertItem.price || null,
        storeUrl: insertItem.storeUrl || null,
        priority: insertItem.priority || 1,
        notes: insertItem.notes || null
      })
      .returning();
    return item;
  }

  async updateWishlistItem(id: number, updates: Partial<WishlistItem>): Promise<WishlistItem> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [item] = await db
      .update(wishlistItems)
      .set(updates)
      .where(eq(wishlistItems.id, id))
      .returning();
    return item;
  }

  async deleteWishlistItem(id: number): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async getUserStats(userId: number): Promise<{
    totalItems: number;
    outfitsCreated: number;
    itemsWornPercentage: number;
    wishlistItems: number;
  }> {
    const { db } = await import("./db");
    const { eq, count, gt } = await import("drizzle-orm");
    
    const [itemsCount] = await db
      .select({ count: count() })
      .from(clothingItems)
      .where(eq(clothingItems.userId, userId));

    const [outfitsCount] = await db
      .select({ count: count() })
      .from(outfits)
      .where(eq(outfits.userId, userId));

    const [wornItems] = await db
      .select({ count: count() })
      .from(clothingItems)
      .where(and(eq(clothingItems.userId, userId), gt(clothingItems.timesWorn, 0)));

    const [wishlistCount] = await db
      .select({ count: count() })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId));

    const totalItems = itemsCount.count;
    const itemsWornPercentage = totalItems > 0 ? Math.round((wornItems.count / totalItems) * 100) : 0;

    return {
      totalItems,
      outfitsCreated: outfitsCount.count,
      itemsWornPercentage,
      wishlistItems: wishlistCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
