import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from "@/types";

interface QuickStatsProps {
  stats: UserStats;
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const statsData = [
    {
      value: stats.totalItems,
      label: "Total Items",
      color: "text-primary"
    },
    {
      value: stats.outfitsCreated,
      label: "Outfits Created",
      color: "text-accent"
    },
    {
      value: `${stats.itemsWornPercentage}%`,
      label: "Items Worn",
      color: "text-green-600"
    },
    {
      value: stats.wishlistItems,
      label: "Wishlist Items",
      color: "text-blue-600"
    },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="shadow-sm border border-gray-100">
            <CardContent className="pt-6 text-center">
              <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-neutral">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
