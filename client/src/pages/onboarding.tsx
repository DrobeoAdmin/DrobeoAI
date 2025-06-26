import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompleteOnboarding, useAuth } from "@/hooks/useAuth";
import { Loader2, Sparkles, Shirt, Palette, Sun, Cloud, Snowflake, Leaf, User, Calendar } from "lucide-react";

const stylePreferences = [
  { id: "casual", label: "Casual", icon: Shirt },
  { id: "formal", label: "Formal", icon: Sparkles },
  { id: "minimalist", label: "Minimalist", icon: Palette },
  { id: "trendy", label: "Trendy", icon: Sparkles },
  { id: "classic", label: "Classic", icon: Shirt },
  { id: "bohemian", label: "Bohemian", icon: Leaf },
];

const favoriteSeasons = [
  { id: "spring", label: "Spring", icon: Leaf },
  { id: "summer", label: "Summer", icon: Sun },
  { id: "fall", label: "Fall", icon: Leaf },
  { id: "winter", label: "Winter", icon: Snowflake },
];

const occasions = [
  { id: "work", label: "Work" },
  { id: "casual", label: "Casual Outings" },
  { id: "formal", label: "Formal Events" },
  { id: "party", label: "Parties" },
  { id: "workout", label: "Workouts" },
  { id: "date", label: "Dates" },
  { id: "travel", label: "Travel" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const completeOnboarding = useCompleteOnboarding();
  
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<{
    styles: string[];
    seasons: string[];
    occasions: string[];
    goals: string[];
    age: string;
    gender: string;
  }>({
    styles: [],
    seasons: [],
    occasions: [],
    goals: [],
    age: "",
    gender: "",
  });

  const goals = [
    { id: "organize", label: "Organize my wardrobe" },
    { id: "discover", label: "Discover new outfit combinations" },
    { id: "plan", label: "Plan outfits in advance" },
    { id: "shopping", label: "Make smarter shopping decisions" },
    { id: "sustainable", label: "Build a more sustainable closet" },
    { id: "confidence", label: "Feel more confident in my style" },
  ];

  const togglePreference = (category: keyof typeof preferences, value: string) => {
    setPreferences(prev => {
      const currentValue = prev[category];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [category]: currentValue.includes(value)
            ? currentValue.filter(item => item !== value)
            : [...currentValue, value]
        };
      } else {
        return {
          ...prev,
          [category]: value
        };
      }
    });
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding.mutateAsync(preferences);
      // Force navigation after a brief delay to ensure state is updated
      setTimeout(() => {
        setLocation("/");
      }, 500);
    } catch (error) {
      console.error("Onboarding completion failed:", error);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Digital Closet, {user.name}!</h1>
          <p className="text-muted-foreground">Let's personalize your wardrobe experience</p>
          <div className="flex justify-center mt-4">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full mx-1 ${
                  stepNum <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "What's your style?"}
              {step === 3 && "Which seasons inspire you?"}
              {step === 4 && "What occasions do you dress for?"}
              {step === 5 && "What are your goals?"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Help us personalize your experience"}
              {step === 2 && "Select the styles that resonate with you (pick as many as you like)"}
              {step === 3 && "Choose your favorite seasons for outfit inspiration"}
              {step === 4 && "Select the occasions you regularly dress for"}
              {step === 5 && "What do you hope to achieve with your digital closet?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Age Range
                  </label>
                  <Select onValueChange={(value) => togglePreference("age", value)} value={preferences.age}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-18">Under 18</SelectItem>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55-64">55-64</SelectItem>
                      <SelectItem value="65-plus">65+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Gender
                  </label>
                  <Select onValueChange={(value) => togglePreference("gender", value)} value={preferences.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stylePreferences.map((style) => {
                  const Icon = style.icon;
                  const isSelected = preferences.styles.includes(style.id);
                  return (
                    <Button
                      key={style.id}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center space-y-2"
                      onClick={() => togglePreference("styles", style.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{style.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {favoriteSeasons.map((season) => {
                  const Icon = season.icon;
                  const isSelected = preferences.seasons.includes(season.id);
                  return (
                    <Button
                      key={season.id}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center space-y-2"
                      onClick={() => togglePreference("seasons", season.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{season.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {occasions.map((occasion) => {
                  const isSelected = preferences.occasions.includes(occasion.id);
                  return (
                    <Button
                      key={occasion.id}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => togglePreference("occasions", occasion.id)}
                    >
                      {occasion.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                {goals.map((goal) => {
                  const isSelected = preferences.goals.includes(goal.id);
                  return (
                    <Button
                      key={goal.id}
                      variant={isSelected ? "default" : "outline"}
                      className="w-full justify-start h-auto py-3"
                      onClick={() => togglePreference("goals", goal.id)}
                    >
                      {goal.label}
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 5 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={completeOnboarding.isPending}
                >
                  {completeOnboarding.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}