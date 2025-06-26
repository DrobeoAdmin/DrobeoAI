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
  createUser(user: InsertUser): Promise<User>;

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

export const storage = new MemStorage();
