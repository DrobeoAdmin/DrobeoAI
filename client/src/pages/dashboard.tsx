import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import WelcomeSection from "@/components/dashboard/welcome-section";
import QuickStats from "@/components/dashboard/quick-stats";
import CategoryFilter from "@/components/dashboard/category-filter";
import ItemCard from "@/components/closet/item-card";
import OutfitCard from "@/components/outfits/outfit-card";
import CalendarGrid from "@/components/calendar/calendar-grid";
import AddItemModal from "@/components/closet/add-item-modal";
import WeatherContext from "@/components/outfits/weather-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useRecentItems, useUserStats } from "@/hooks/use-closet";
import { useOutfits, useGenerateOutfits } from "@/hooks/use-outfits";
import { Link } from "wouter";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: recentItems = [], isLoading: recentLoading } = useRecentItems(4);
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: outfits = [], isLoading: outfitsLoading } = useOutfits({ aiGenerated: true });
  const generateOutfits = useGenerateOutfits();

  // Mock weather data
  const weatherData = {
    condition: "sunny",
    temperature: 72,
    description: "Perfect for light layers",
    icon: "☀️"
  };

  const handleGenerateOutfit = () => {
    generateOutfits.mutate({
      occasion: "work",
      weatherCondition: "sunny",
      style: "professional"
    });
  };

  const handleCategoryClick = (categoryId: number) => {
    // Navigate to closet with category filter
    window.location.href = `/closet?category=${categoryId}`;
  };

  // Mock calendar entries
  const mockCalendarEntries = [
    {
      id: 1,
      userId: 1,
      date: new Date(2024, 11, 16), // Today
      occasion: "work",
      createdAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      date: new Date(2024, 11, 17),
      occasion: "party",
      createdAt: new Date()
    }
  ];

  if (statsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {stats && (
          <WelcomeSection
            stats={stats}
            onGenerateOutfit={handleGenerateOutfit}
            onAddItem={() => setShowAddModal(true)}
          />
        )}

        {stats && <QuickStats stats={stats} />}

        <CategoryFilter
          categories={categories}
          onCategoryClick={handleCategoryClick}
        />

        {/* Recently Added */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-primary">Recently Added</h3>
            <Link href="/closet">
              <Button variant="link" className="text-accent p-0">View All</Button>
            </Link>
          </div>
          
          {recentLoading ? (
            <div className="item-grid">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="item-grid">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No items in your closet yet.</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="mt-4"
              >
                Add Your First Item
              </Button>
            </div>
          )}
        </section>

        {/* AI Outfit Suggestions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-primary">AI Outfit Suggestions</h3>
            <Button 
              onClick={handleGenerateOutfit}
              disabled={generateOutfits.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate New
            </Button>
          </div>
          
          <div className="mb-6">
            <WeatherContext 
              weather={weatherData}
              occasion="Work Meeting"
            />
          </div>

          {outfitsLoading || generateOutfits.isPending ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : outfits.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfits.slice(0, 3).map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onTryOn={() => console.log("Try on", outfit.id)}
                  onEdit={() => console.log("Edit", outfit.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Generate your first AI outfit suggestion!</p>
              <Button 
                onClick={handleGenerateOutfit}
                className="mt-4"
                disabled={generateOutfits.isPending}
              >
                Generate Outfits
              </Button>
            </div>
          )}
        </section>

        {/* Calendar Preview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-primary">Outfit Calendar</h3>
            <Link href="/calendar">
              <Button variant="link" className="text-accent p-0">View Full Calendar</Button>
            </Link>
          </div>
          
          <CalendarGrid 
            entries={mockCalendarEntries}
            onDateClick={(date) => console.log("Date clicked:", date)}
          />
        </section>
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
