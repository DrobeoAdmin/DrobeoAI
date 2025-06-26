import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ItemCard from "@/components/closet/item-card";
import AddItemModal from "@/components/closet/add-item-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useClothingItems } from "@/hooks/use-closet";
import { useSearch } from "wouter";

export default function Closet() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  
  const search = useSearch();
  const categoryFromUrl = new URLSearchParams(search).get("category");

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  
  const filters = {
    ...(selectedCategory && { categoryId: parseInt(selectedCategory) }),
    ...(categoryFromUrl && { categoryId: parseInt(categoryFromUrl) }),
    ...(selectedSeason && { season: selectedSeason }),
    ...(selectedColor && { color: selectedColor }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: items = [], isLoading: itemsLoading } = useClothingItems(filters);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedSeason("");
    setSelectedColor("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedCategory || selectedSeason || selectedColor || searchTerm || categoryFromUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Closet</h1>
              <p className="text-neutral mt-2">
                {itemsLoading ? "Loading..." : `${items.length} items in your wardrobe`}
              </p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your closet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory || categoryFromUrl || ""} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Season Filter */}
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Seasons</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>

              {/* Color Filter */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Color..."
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full md:w-32"
                />
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    size="icon"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-neutral">
                  {items.length} items match your filters
                </div>
                <Button
                  variant="link"
                  onClick={handleClearFilters}
                  className="text-accent p-0 h-auto"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Items Grid */}
        {itemsLoading ? (
          <div className="item-grid">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="item-grid">
            {items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item}
                onEdit={(item) => {
                  // TODO: Implement edit modal
                  console.log("Edit item:", item);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              {hasActiveFilters ? "No items match your filters" : "Your closet is empty"}
            </h3>
            <p className="text-neutral mb-6 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Try adjusting your search criteria or clearing filters to see more items."
                : "Start building your digital wardrobe by adding your first clothing item."
              }
            </p>
            {hasActiveFilters ? (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowAddModal(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="floating-btn fixed bottom-20 md:bottom-8 right-6 w-14 h-14 rounded-full shadow-lg z-40 bg-accent hover:bg-accent/90"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <MobileNav />
      
      <AddItemModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
