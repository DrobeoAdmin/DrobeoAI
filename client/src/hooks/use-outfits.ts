import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Outfit } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useOutfits(filters?: {
  occasion?: string;
  weatherCondition?: string;
  aiGenerated?: boolean;
}) {
  return useQuery<Outfit[]>({
    queryKey: ['/api/outfits', filters],
    queryFn: () => api.getOutfits(filters),
  });
}

export function useCreateOutfit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => api.createOutfit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/outfits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Outfit created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create outfit",
        variant: "destructive",
      });
    },
  });
}

export function useGenerateOutfits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (preferences: {
      occasion: string;
      weatherCondition: string;
      style?: string;
      colors?: string[];
    }) => api.generateOutfits(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/outfits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "AI outfit suggestions generated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate outfit suggestions",
        variant: "destructive",
      });
    },
  });
}

export function useStyleAdvice() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (question: string) => api.getStyleAdvice(question),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get style advice",
        variant: "destructive",
      });
    },
  });
}
