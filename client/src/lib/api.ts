import { apiRequest } from "./queryClient";

export const api = {
  // Categories
  getCategories: () => 
    fetch('/api/categories').then(res => res.json()),

  // Clothing Items
  getClothingItems: (filters?: {
    categoryId?: number;
    season?: string;
    color?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return fetch(`/api/clothing-items?${params}`).then(res => res.json());
  },

  getRecentItems: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return fetch(`/api/clothing-items/recent${params}`).then(res => res.json());
  },

  createClothingItem: (data: FormData) =>
    apiRequest('POST', '/api/clothing-items', data),

  updateClothingItem: (id: number, data: any) =>
    apiRequest('PUT', `/api/clothing-items/${id}`, data),

  deleteClothingItem: (id: number) =>
    apiRequest('DELETE', `/api/clothing-items/${id}`),

  // Outfits
  getOutfits: (filters?: {
    occasion?: string;
    weatherCondition?: string;
    aiGenerated?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return fetch(`/api/outfits?${params}`).then(res => res.json());
  },

  createOutfit: (data: any) =>
    apiRequest('POST', '/api/outfits', data),

  generateOutfits: (preferences: {
    occasion: string;
    weatherCondition: string;
    style?: string;
    colors?: string[];
  }) =>
    apiRequest('POST', '/api/outfits/generate', preferences),

  // Style Advice
  getStyleAdvice: (question: string) =>
    apiRequest('POST', '/api/style-advice', { question }),

  // Calendar
  getCalendar: (startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    return fetch(`/api/calendar?${params}`).then(res => res.json());
  },

  createCalendarEntry: (data: any) =>
    apiRequest('POST', '/api/calendar', data),

  // Wishlist
  getWishlist: () =>
    fetch('/api/wishlist').then(res => res.json()),

  createWishlistItem: (data: any) =>
    apiRequest('POST', '/api/wishlist', data),

  // Stats
  getStats: () =>
    fetch('/api/stats').then(res => res.json()),
};
