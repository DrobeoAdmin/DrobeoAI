import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutfitCalendarEntry } from "@/types";

interface CalendarGridProps {
  entries: OutfitCalendarEntry[];
  onDateClick?: (date: Date) => void;
}

export default function CalendarGrid({ entries, onDateClick }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEntryForDate = (date: Date) => {
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  const getOccasionIcon = (occasion?: string) => {
    const icons: Record<string, string> = {
      'work': '👔',
      'formal': '🤵',
      'party': '🎉',
      'casual': '👕',
      'workout': '🏃',
      'date': '💕',
    };
    return icons[occasion?.toLowerCase() || ''] || '📅';
  };

  const getOccasionColor = (occasion?: string) => {
    const colors: Record<string, string> = {
      'work': 'bg-blue-500',
      'formal': 'bg-purple-500',
      'party': 'bg-pink-500',
      'casual': 'bg-green-500',
      'workout': 'bg-orange-500',
      'date': 'bg-red-500',
    };
    return colors[occasion?.toLowerCase() || ''] || 'bg-gray-500';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const entry = getEntryForDate(date);
      const isCurrentDay = isToday(date);
      
      days.push(
        <div
          key={day}
          className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isCurrentDay 
              ? "bg-blue-50 border-2 border-blue-200" 
              : "bg-gray-50 hover:bg-gray-100"
          }`}
          onClick={() => onDateClick?.(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? "text-primary" : "text-neutral"
          }`}>
            {day}
          </div>
          {entry ? (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              getOccasionColor(entry.occasion)
            }`}>
              <span className="text-white">
                {getOccasionIcon(entry.occasion)}
              </span>
            </div>
          ) : (
            <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded-full"></div>
          )}
          {isCurrentDay && (
            <div className="text-xs text-blue-600 mt-1">Today</div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-neutral">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {renderCalendarDays()}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-neutral">Work</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-neutral">Formal</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
              <span className="text-neutral">Party</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-neutral">Casual</span>
            </div>
          </div>
          <Button variant="link" className="text-accent">
            Plan Outfits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
