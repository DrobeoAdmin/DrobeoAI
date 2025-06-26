import { useState } from "react";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import CalendarGrid from "@/components/calendar/calendar-grid";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useOutfits } from "@/hooks/use-outfits";

export default function Calendar() {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: outfits = [] } = useOutfits();

  // Mock calendar entries - in real app, this would come from API
  const mockEntries = [
    {
      id: 1,
      userId: 1,
      date: new Date(2024, 11, 15), // December 15, 2024
      occasion: "work",
      notes: "Important client meeting",
      createdAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      date: new Date(2024, 11, 16), // December 16, 2024
      occasion: "work",
      outfitId: 1,
      createdAt: new Date()
    },
    {
      id: 3,
      userId: 1,
      date: new Date(2024, 11, 17), // December 17, 2024
      occasion: "party",
      notes: "Company holiday party",
      createdAt: new Date()
    },
    {
      id: 4,
      userId: 1,
      date: new Date(2024, 11, 19), // December 19, 2024
      occasion: "casual",
      createdAt: new Date()
    }
  ];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowPlanModal(true);
  };

  const handlePlanOutfit = () => {
    // TODO: Implement outfit planning
    console.log("Plan outfit for:", selectedDate, {
      outfitId: selectedOutfit,
      occasion: selectedOccasion,
      notes
    });
    setShowPlanModal(false);
    setSelectedOutfit("");
    setSelectedOccasion("");
    setNotes("");
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

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return mockEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= today && entryDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const upcomingEvents = getUpcomingEvents();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Outfit Calendar</h1>
              <p className="text-neutral mt-2">
                Plan your outfits ahead of time and never repeat looks
              </p>
            </div>
            <Button 
              onClick={() => setShowPlanModal(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Plan Outfit
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <CalendarGrid 
              entries={mockEntries}
              onDateClick={handleDateClick}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Month Navigation */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex space-x-1">
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
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
                      const eventDate = new Date(event.date);
                      const isToday = eventDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div key={event.id} className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            event.occasion === 'work' ? 'bg-blue-500' :
                            event.occasion === 'formal' ? 'bg-purple-500' :
                            event.occasion === 'party' ? 'bg-pink-500' :
                            event.occasion === 'casual' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium text-sm">
                                {eventDate.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              {isToday && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  Today
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-neutral capitalize">
                              {event.occasion}
                            </div>
                            {event.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {event.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No upcoming events planned
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral">Planned outfits</span>
                    <span className="font-medium">{mockEntries.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral">Work events</span>
                    <span className="font-medium">
                      {mockEntries.filter(e => e.occasion === 'work').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral">Social events</span>
                    <span className="font-medium">
                      {mockEntries.filter(e => e.occasion === 'party').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Plan Outfit Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-accent" />
              Plan Outfit
              {selectedDate && (
                <span className="ml-2 text-sm font-normal text-neutral">
                  for {selectedDate.toLocaleDateString()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Select Outfit (Optional)
              </label>
              <Select value={selectedOutfit} onValueChange={setSelectedOutfit}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an existing outfit" />
                </SelectTrigger>
                <SelectContent>
                  {outfits.map((outfit) => (
                    <SelectItem key={outfit.id} value={outfit.id.toString()}>
                      {outfit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Occasion
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
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes about this event..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90"
                onClick={handlePlanOutfit}
                disabled={!selectedOccasion}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Plan Outfit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
}
