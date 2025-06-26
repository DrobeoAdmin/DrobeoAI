import { Star, Edit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Outfit } from "@/types";

interface OutfitCardProps {
  outfit: Outfit;
  onTryOn?: () => void;
  onEdit?: () => void;
}

export default function OutfitCard({ outfit, onTryOn, onEdit }: OutfitCardProps) {
  const getOccasionColor = (occasion: string) => {
    const colors: Record<string, string> = {
      'work': 'bg-blue-100 text-blue-700',
      'casual': 'bg-green-100 text-green-700',
      'formal': 'bg-purple-100 text-purple-700',
      'party': 'bg-pink-100 text-pink-700',
      'workout': 'bg-orange-100 text-orange-700',
      'date': 'bg-red-100 text-red-700',
    };
    return colors[occasion.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getWeatherIcon = (weather?: string) => {
    if (!weather) return null;
    const icons: Record<string, string> = {
      'sunny': '☀️',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '❄️',
      'hot': '🔥',
      'cold': '🧊',
      'mild': '🌤️',
    };
    return icons[weather.toLowerCase()] || '🌤️';
  };

  return (
    <Card className="outfit-card rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-primary">{outfit.name}</h4>
            {outfit.aiGenerated && (
              <Sparkles className="h-4 w-4 text-accent" />
            )}
          </div>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm ml-1">{outfit.rating}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {outfit.items?.slice(0, 3).map((item, index) => (
            <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">
                    {item.category?.icon ? (
                      <i className={item.category.icon}></i>
                    ) : (
                      '👔'
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
          {outfit.items && outfit.items.length > 3 && (
            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-sm text-gray-500">+{outfit.items.length - 3}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getOccasionColor(outfit.occasion)}`}
          >
            {outfit.occasion}
          </Badge>
          {outfit.weatherCondition && (
            <Badge variant="outline" className="text-xs">
              {getWeatherIcon(outfit.weatherCondition)} {outfit.weatherCondition}
            </Badge>
          )}
          {outfit.aiGenerated && (
            <Badge variant="outline" className="text-xs">
              AI Generated
            </Badge>
          )}
        </div>

        {outfit.aiSuggestionData?.reasoning && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {outfit.aiSuggestionData.reasoning}
          </p>
        )}

        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-accent hover:bg-accent/90" 
            onClick={onTryOn}
          >
            Try On AR
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
