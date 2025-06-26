export interface ClothingItem {
  id: number;
  userId: number;
  name: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  brand?: string;
  color: string;
  season: string;
  imageUrl?: string;
  tags?: string[];
  isFavorite: boolean;
  timesWorn: number;
  lastWorn?: Date;
  purchaseDate?: Date;
  price?: number;
  notes?: string;
  createdAt: Date;
}

export interface Outfit {
  id: number;
  userId: number;
  name: string;
  itemIds: number[];
  items?: ClothingItem[];
  occasion: string;
  weatherCondition?: string;
  rating: number;
  isFavorite: boolean;
  timesWorn: number;
  lastWorn?: Date;
  aiGenerated: boolean;
  aiSuggestionData?: {
    styleDescription: string;
    reasoning: string;
  };
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface UserStats {
  totalItems: number;
  outfitsCreated: number;
  itemsWornPercentage: number;
  wishlistItems: number;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
  icon: string;
}

export interface OutfitCalendarEntry {
  id: number;
  userId: number;
  date: Date;
  outfitId?: number;
  outfit?: Outfit;
  occasion?: string;
  weatherCondition?: string;
  notes?: string;
  createdAt: Date;
}

export interface WishlistItem {
  id: number;
  userId: number;
  name: string;
  categoryId: number;
  category?: Category;
  brand?: string;
  color?: string;
  imageUrl?: string;
  price?: number;
  storeUrl?: string;
  priority: number;
  notes?: string;
  createdAt: Date;
}
