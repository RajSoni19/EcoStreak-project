import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Droplets, 
  Zap, 
  Recycle, 
  Car,
  CheckCircle,
  Flame,
  Sparkles,
  Trophy
} from "lucide-react";

interface HabitAction {
  id: string;
  label: string;
  points: number;
}

interface HabitCategory {
  id: string;
  title: string;
  icon: any;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  actions: HabitAction[];
}

interface SelectedHabit {
  categoryId: string;
  actionId: string;
  points: number;
}

export default function Habits() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabit[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(15);

  const habitCategories: HabitCategory[] = [
    {
      id: "water",
      title: "Save Water",
      icon: Droplets,
      emoji: "💧",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      actions: [
        { id: "shower", label: "Took a shorter shower (under 5 minutes)", points: 10 },
        { id: "plants", label: "Used leftover water for plants", points: 8 },
        { id: "teeth", label: "Turned off tap while brushing teeth", points: 5 },
        { id: "dishwater", label: "Collected dishwater for garden use", points: 12 },
        { id: "rainwater", label: "Used rainwater for cleaning", points: 15 }
      ]
    },
    {
      id: "electricity",
      title: "Save Electricity", 
      icon: Zap,
      emoji: "⚡",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      actions: [
        { id: "lights", label: "Turned off lights when leaving room", points: 5 },
        { id: "unplugged", label: "Unplugged devices when not in use", points: 8 },
        { id: "natural-light", label: "Used natural light instead of artificial", points: 10 },
        { id: "air-con", label: "Reduced air conditioning usage", points: 15 },
        { id: "led", label: "Switched to LED bulbs", points: 20 }
      ]
    },
    {
      id: "plastic",
      title: "Reduce Plastic",
      icon: Recycle,
      emoji: "♻️",
      color: "text-green-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      actions: [
        { id: "bottle", label: "Used reusable water bottle", points: 10 },
        { id: "bag", label: "Brought reusable shopping bag", points: 12 },
        { id: "container", label: "Used glass/metal containers for food storage", points: 15 },
        { id: "no-straw", label: "Refused plastic straws", points: 8 },
        { id: "bulk", label: "Bought items in bulk to reduce packaging", points: 18 }
      ]
    },
    {
      id: "transport",
      title: "Reduce Fuel CO₂",
      icon: Car,
      emoji: "🚗",
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      borderColor: "border-orange-300",
      actions: [
        { id: "walk", label: "Walked instead of driving", points: 15 },
        { id: "bike", label: "Rode a bicycle for transportation", points: 18 },
        { id: "public", label: "Used public transportation", points: 12 },
        { id: "carpool", label: "Carpooled with others", points: 14 },
        { id: "remote", label: "Worked from home to avoid commuting", points: 10 }
      ]
    }
  ];

  const isHabitSelected = (categoryId: string, actionId: string) => {
    return selectedHabits.some(h => h.categoryId === categoryId && h.actionId === actionId);
  };

  const toggleHabit = (categoryId: string, actionId: string, points: number) => {
    setSelectedHabits(prev => {
      const existingIndex = prev.findIndex(h => h.categoryId === categoryId && h.actionId === actionId);
      
      if (existingIndex >= 0) {
        // Remove habit
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add habit
        return [...prev, { categoryId, actionId, points }];
      }
    });
  };

  const getCategorySelectionCount = (categoryId: string) => {
    return selectedHabits.filter(h => h.categoryId === categoryId).length;
  };

  const getTotalPoints = () => {
    return selectedHabits.reduce((sum, habit) => sum + habit.points, 0);
  };

  const handleSubmit = () => {
    if (selectedHabits.length === 0) return;
    
    // Here you would typically send the data to your backend
    setCurrentStreak(prev => prev + 1);
    setShowSuccessModal(true);
    
    // Reset after a delay
    setTimeout(() => {
      setShowSuccessModal(false);
      navigate("/user/dashboard");
    }, 3000);
  };

  const isCategoryExpanded = (categoryId: string) => {
    return selectedCategory === categoryId || getCategorySelectionCount(categoryId) > 0;
  };

  return (
    <DashboardLayout userRole="user" userName="Alex Johnson">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Log Your Eco-Habits for Today 🌱
          </h1>
          <p className="text-muted-foreground">
            Every small action makes a big difference! Select the habits you practiced today.
          </p>
          {selectedHabits.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-eco-forest/10 text-eco-forest px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">+{getTotalPoints()} points ready to earn!</span>
            </div>
          )}
        </div>

        {/* Habit Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habitCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = isCategoryExpanded(category.id);
            const selectionCount = getCategorySelectionCount(category.id);
            
            return (
              <Card 
                key={category.id}
                className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  isExpanded 
                    ? `border-2 ${category.borderColor} shadow-lg scale-[1.02]` 
                    : 'border border-border hover:border-border/80'
                }`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${category.bgColor} flex items-center justify-center transition-transform ${isExpanded ? 'scale-110' : ''}`}>
                        <Icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{category.emoji}</span>
                          <span className="font-semibold">{category.title}</span>
                        </div>
                        {selectionCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-4 h-4 text-eco-forest" />
                            <span className="text-sm text-eco-forest font-medium">
                              {selectionCount} habit{selectionCount > 1 ? 's' : ''} selected
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="text-eco-forest">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {category.actions.map((action) => {
                        const isSelected = isHabitSelected(category.id, action.id);
                        
                        return (
                          <div 
                            key={action.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                              isSelected 
                                ? 'bg-eco-forest/10 border border-eco-forest/30' 
                                : 'hover:bg-accent/50 border border-transparent'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHabit(category.id, action.id, action.points);
                            }}
                          >
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => {}} // Controlled by parent click
                              className="data-[state=checked]:bg-eco-forest data-[state=checked]:border-eco-forest"
                            />
                            <div className="flex-1">
                              <p className={`text-sm ${isSelected ? 'text-eco-forest font-medium' : 'text-foreground'}`}>
                                {action.label}
                              </p>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              isSelected 
                                ? 'bg-eco-forest text-white' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              +{action.points} pts
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="text-center pt-6">
          <Button
            onClick={handleSubmit}
            disabled={selectedHabits.length === 0}
            className={`px-12 py-4 h-auto text-lg font-semibold transition-all ${
              selectedHabits.length > 0
                ? 'bg-gradient-to-r from-eco-forest to-eco-leaf hover:from-eco-forest/90 hover:to-eco-leaf/90 text-white shadow-lg hover:shadow-xl'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {selectedHabits.length === 0 
              ? 'Select habits to continue' 
              : `Submit Habits for Today (+${getTotalPoints()} points)`
            }
          </Button>
          
          {selectedHabits.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              You've selected {selectedHabits.length} eco-habit{selectedHabits.length > 1 ? 's' : ''} today!
            </p>
          )}
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <div className="w-20 h-20 bg-gradient-to-r from-eco-forest to-eco-leaf rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-eco-forest">
                Great job! 🎉
              </DialogTitle>
              <DialogDescription className="text-lg">
                Your streak is now <span className="font-bold text-eco-forest">{currentStreak + 1} days!</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <div className="bg-eco-forest/10 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-eco-forest font-semibold">
                  <Sparkles className="w-5 h-5" />
                  <span>+{getTotalPoints()} points earned!</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{currentStreak + 1} day streak</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-eco-forest" />
                  <span>{selectedHabits.length} habits logged</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Keep up the amazing work! Every habit makes our planet greener. 🌍
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
