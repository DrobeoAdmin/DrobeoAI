import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const clothingItems = pgTable("clothing_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  brand: text("brand"),
  color: text("color").notNull(),
  season: text("season").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  isFavorite: boolean("is_favorite").default(false),
  timesWorn: integer("times_worn").default(0),
  lastWorn: timestamp("last_worn"),
  purchaseDate: timestamp("purchase_date"),
  price: integer("price"), // in cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  itemIds: integer("item_ids").array().notNull(),
  occasion: text("occasion").notNull(),
  weatherCondition: text("weather_condition"),
  rating: integer("rating").default(0),
  isFavorite: boolean("is_favorite").default(false),
  timesWorn: integer("times_worn").default(0),
  lastWorn: timestamp("last_worn"),
  aiGenerated: boolean("ai_generated").default(false),
  aiSuggestionData: jsonb("ai_suggestion_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const outfitCalendar = pgTable("outfit_calendar", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  outfitId: integer("outfit_id"),
  occasion: text("occasion"),
  weatherCondition: text("weather_condition"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  brand: text("brand"),
  color: text("color"),
  imageUrl: text("image_url"),
  price: integer("price"), // in cents
  storeUrl: text("store_url"),
  priority: integer("priority").default(1), // 1-5
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertClothingItemSchema = createInsertSchema(clothingItems).omit({
  id: true,
  createdAt: true,
  timesWorn: true,
  lastWorn: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
  timesWorn: true,
  lastWorn: true,
});

export const insertOutfitCalendarSchema = createInsertSchema(outfitCalendar).omit({
  id: true,
  createdAt: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type ClothingItem = typeof clothingItems.$inferSelect;
export type InsertClothingItem = z.infer<typeof insertClothingItemSchema>;

export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

export type OutfitCalendar = typeof outfitCalendar.$inferSelect;
export type InsertOutfitCalendar = z.infer<typeof insertOutfitCalendarSchema>;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

// Validation schemas
export const seasonSchema = z.enum(["spring", "summer", "fall", "winter", "all"]);
export const occasionSchema = z.enum(["work", "casual", "formal", "party", "workout", "date", "travel"]);
export const weatherSchema = z.enum(["sunny", "cloudy", "rainy", "snowy", "hot", "cold", "mild"]);
