import { Sun, Cloud, CloudRain, Snowflake, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherData } from "@/types";

interface WeatherContextProps {
  weather: WeatherData;
  occasion: string;
}

export default function WeatherContext({ weather, occasion }: WeatherContextProps) {
  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, any> = {
      'sunny': Sun,
      'cloudy': Cloud,
      'rainy': CloudRain,
      'snowy': Snowflake,
      'hot': Thermometer,
      'cold': Snowflake,
      'mild': Sun,
    };
    return icons[condition.toLowerCase()] || Sun;
  };

  const Icon = getWeatherIcon(weather.condition);

  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-primary">Today's Weather</h4>
              <p className="text-sm text-neutral">
                {weather.condition}, {weather.temperature}°F - {weather.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral">Occasion</div>
            <div className="font-medium text-primary capitalize">{occasion}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
