import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { UserStats } from "@/types";

interface WelcomeSectionProps {
  stats: UserStats;
  onGenerateOutfit: () => void;
  onAddItem: () => void;
}

export default function WelcomeSection({ stats, onGenerateOutfit, onAddItem }: WelcomeSectionProps) {
  return (
    <section className="mb-8">
      <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Welcome back, Sarah! ✨</h2>
          <p className="text-lg opacity-90 mb-6">
            You have {stats.totalItems} items in your closet. Ready to create some amazing outfits?
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={onGenerateOutfit}
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Outfit
            </Button>
            <Button 
              onClick={onAddItem}
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      </div>
    </section>
  );
}
