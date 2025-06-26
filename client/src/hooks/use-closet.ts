import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ClothingItem, Category } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: api.getCategories,
  });
}

export function useClothingItems(filters?: {
  categoryId?: number;
  season?: string;
  color?: string;
  search?: string;
}) {
  return useQuery<ClothingItem[]>({
    queryKey: ['/api/clothing-items', filters],
    queryFn: () => api.getClothingItems(filters),
  });
}

export function useRecentItems(limit?: number) {
  return useQuery<ClothingItem[]>({
    queryKey: ['/api/clothing-items/recent', limit],
    queryFn: () => api.getRecentItems(limit),
  });
}

export function useCreateClothingItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: FormData) => api.createClothingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clothing-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Item added to your closet!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClothingItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.updateClothingItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clothing-items'] });
      toast({
        title: "Success",
        description: "Item updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClothingItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.deleteClothingItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clothing-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Item deleted from your closet",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['/api/stats'],
    queryFn: api.getStats,
  });
}
