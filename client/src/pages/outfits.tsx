import { useState } from "react";
import { Plus, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import OutfitCard from "@/components/outfits/outfit-card";
import WeatherContext from "@/components/outfits/weather-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutfits, useGenerateOutfits, useStyleAdvice } from "@/hooks/use-outfits";
import { useClothingItems } from "@/hooks/use-closet";

export default function Outfits() {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showStyleChat, setShowStyleChat] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedWeather, setSelectedWeather] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [styleQuestion, setStyleQuestion] = useState("");
  const [styleResponse, setStyleResponse] = useState("");

  const { data: outfits = [], isLoading: outfitsLoading } = useOutfits();
  const { data: items = [] } = useClothingItems();
  const generateOutfits = useGenerateOutfits();
  const styleAdvice = useStyleAdvice();

  // Mock weather data
  const weatherData = {
    condition: "sunny",
    temperature: 72,
    description: "Perfect for light layers",
    icon: "☀️"
  };

  const handleGenerateOutfits = async () => {
    if (!selectedOccasion || !selectedWeather) {
      return;
    }

    try {
      await generateOutfits.mutateAsync({
        occasion: selectedOccasion,
        weatherCondition: selectedWeather,
        style: selectedStyle || undefined,
      });
      setShowGenerateModal(false);
      setSelectedOccasion("");
      setSelectedWeather("");
      setSelectedStyle("");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleStyleAdvice = async () => {
    if (!styleQuestion.trim()) return;

    try {
      const response = await styleAdvice.mutateAsync(styleQuestion);
      setStyleResponse(response.advice);
      setStyleQuestion("");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const aiOutfits = outfits.filter(outfit => outfit.aiGenerated);
  const manualOutfits = outfits.filter(outfit => !outfit.aiGenerated);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">AI Outfits</h1>
              <p className="text-neutral mt-2">
                Let AI create perfect outfit combinations for you
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowStyleChat(true)}
                variant="outline"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Style Chat
              </Button>
              <Button 
                onClick={() => setShowGenerateModal(true)}
                className="bg-accent hover:bg-accent/90"
                disabled={items.length < 3}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Outfits
              </Button>
            </div>
          </div>

          {items.length < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                You need at least 3 clothing items to generate AI outfit suggestions. 
                Add more items to your closet to get started!
              </p>
            </div>
          )}

          {/* Weather Context */}
          <WeatherContext 
            weather={weatherData}
            occasion="Work Meeting"
          />
        </div>

        {/* AI Generated Outfits */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-primary">AI Suggestions</h2>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              <Sparkles className="mr-1 h-3 w-3" />
              {aiOutfits.length} AI Generated
            </Badge>
          </div>

          {generateOutfits.isPending ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : aiOutfits.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onTryOn={() => console.log("Try on", outfit.id)}
                  onEdit={() => console.log("Edit", outfit.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                No AI Suggestions Yet
              </h3>
              <p className="text-neutral mb-4">
                Generate your first AI outfit recommendations based on your wardrobe
              </p>
              <Button 
                onClick={() => setShowGenerateModal(true)}
                className="bg-accent hover:bg-accent/90"
                disabled={items.length < 3}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Outfits
              </Button>
            </div>
          )}
        </section>

        {/* Manual Outfits */}
        {manualOutfits.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Your Outfits</h2>
              <Badge variant="secondary">
                {manualOutfits.length} Created
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {manualOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onTryOn={() => console.log("Try on", outfit.id)}
                  onEdit={() => console.log("Edit", outfit.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State for All Outfits */}
        {outfits.length === 0 && !generateOutfits.isPending && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              Ready to Create Amazing Outfits?
            </h3>
            <p className="text-neutral mb-6 max-w-md mx-auto">
              Use AI to discover new outfit combinations from your wardrobe, 
              or create your own custom looks.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => setShowGenerateModal(true)}
                className="bg-accent hover:bg-accent/90"
                disabled={items.length < 3}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Manually
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Generate Outfits Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Generate AI Outfits
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Occasion *
              </label>
              <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="workout">Workout</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Weather *
              </label>
              <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">Sunny</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="snowy">Snowy</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Style Preference (Optional)
              </label>
              <Input
                placeholder="e.g., minimalist, streetwear, vintage"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90"
                onClick={handleGenerateOutfits}
                disabled={!selectedOccasion || !selectedWeather || generateOutfits.isPending}
              >
                {generateOutfits.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Style Chat Modal */}
      <Dialog open={showStyleChat} onOpenChange={setShowStyleChat}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-accent" />
              AI Style Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Ask for fashion advice
              </label>
              <Textarea
                placeholder="e.g., What should I wear to a business dinner? How can I style this dress for different occasions?"
                value={styleQuestion}
                onChange={(e) => setStyleQuestion(e.target.value)}
                rows={3}
              />
            </div>

            {styleResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Stylist Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {styleResponse}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowStyleChat(false);
                  setStyleQuestion("");
                  setStyleResponse("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90"
                onClick={handleStyleAdvice}
                disabled={!styleQuestion.trim() || styleAdvice.isPending}
              >
                {styleAdvice.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Get Advice
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
}
