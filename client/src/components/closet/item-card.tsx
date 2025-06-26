import { useState } from "react";
import { Heart, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClothingItem } from "@/types";
import { useUpdateClothingItem, useDeleteClothingItem } from "@/hooks/use-closet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ItemCardProps {
  item: ClothingItem;
  onEdit?: (item: ClothingItem) => void;
}

export default function ItemCard({ item, onEdit }: ItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateItem = useUpdateClothingItem();
  const deleteItem = useDeleteClothingItem();

  const toggleFavorite = () => {
    updateItem.mutate({
      id: item.id,
      data: { isFavorite: !item.isFavorite }
    });
  };

  const handleDelete = () => {
    deleteItem.mutate(item.id);
    setShowDeleteDialog(false);
  };

  const getOccasionColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tops': 'bg-pink-100 text-pink-700',
      'Bottoms': 'bg-blue-100 text-blue-700',
      'Dresses': 'bg-purple-100 text-purple-700',
      'Shoes': 'bg-green-100 text-green-700',
      'Accessories': 'bg-yellow-100 text-yellow-700',
      'Outerwear': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getLastWornText = () => {
    if (!item.lastWorn) return "Never";
    
    const days = Math.floor((Date.now() - new Date(item.lastWorn).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <>
      <Card className="card-hover bg-white overflow-hidden shadow-sm border border-gray-100 cursor-pointer group">
        <div className="aspect-square relative">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">
                {item.category?.icon ? (
                  <i className={item.category.icon}></i>
                ) : (
                  '👔'
                )}
              </span>
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
            >
              <Heart 
                className={`h-4 w-4 ${
                  item.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                }`} 
              />
            </Button>
          </div>
          
          {item.timesWorn === 0 && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              NEW
            </div>
          )}
          
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h4 className="font-medium text-primary mb-1 truncate">{item.name}</h4>
          {item.brand && (
            <p className="text-sm text-neutral mb-2 truncate">{item.brand}</p>
          )}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getOccasionColor(item.category?.name || '')}`}
            >
              {item.category?.name || 'Other'}
            </Badge>
            <span className="text-xs text-neutral">
              Last worn: {getLastWornText()}
            </span>
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
