import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "@/components/UserLayout";
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
  Lightbulb, 
  Recycle, 
  Car,
  CheckCircle,
  Flame,
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
  emoji: string;
  icon: any;
  color: string;
  actions: HabitAction[];
}

export default function Habits() {
  const navigate = useNavigate();
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const currentStreak = 15; // This would come from user data
  
  const habitCategories: HabitCategory[] = [
    {
      id: "water",
      title: "Save Water",
      emoji: "💧",
      icon: Droplets,
      color: "blue",
      actions: [
        { id: "shower", label: "Took a shorter shower", points: 10 },
        { id: "plants", label: "Used leftover water for plants", points: 8 },
        { id: "teeth", label: "Turned off tap while brushing teeth", points: 5 },
        { id: "dishwater", label: "Collected dishwater for garden use", points: 12 }
      ]
    },
    {
      id: "electricity",
      title: "Save Electricity",
      emoji: "💡",
      icon: Lightbulb,
      color: "yellow",
      actions: [
        { id: "lights", label: "Turned off lights when leaving room", points: 5 },
        { id: "unplugged", label: "Unplugged devices when not in use", points: 8 },
        { id: "natural-light", label: "Used natural light instead of artificial", points: 10 },
        { id: "air-con", label: "Reduced air conditioning usage", points: 15 }
      ]
    },
    {
      id: "plastic",
      title: "Reduce Plastic",
      emoji: "♻️",
      icon: Recycle,
      color: "green",
      actions: [
        { id: "bottle", label: "Used reusable water bottle", points: 10 },
        { id: "bag", label: "Brought reusable shopping bag", points: 12 },
        { id: "container", label: "Used glass/metal containers for food storage", points: 15 },
        { id: "no-straw", label: "Refused plastic straws", points: 8 }
      ]
    },
    {
      id: "transport",
      title: "Reduce Fuel CO₂",
      emoji: "🚗",
      icon: Car,
      color: "orange",
      actions: [
        { id: "walk", label: "Walked instead of driving", points: 15 },
        { id: "bike", label: "Rode a bicycle for transportation", points: 18 },
        { id: "public", label: "Used public transportation", points: 12 },
        { id: "carpool", label: "Carpooled with others", points: 14 }
      ]
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleHabitToggle = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const getCategorySelectionCount = (categoryId: string) => {
    const category = habitCategories.find(c => c.id === categoryId);
    if (!category) return 0;
    
    return category.actions.filter(action => 
      selectedHabits.includes(action.id)
    ).length;
  };

  const getTotalPoints = () => {
    return habitCategories
      .flatMap(category => category.actions)
      .filter(action => selectedHabits.includes(action.id))
      .reduce((sum, action) => sum + action.points, 0);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        bg: isSelected ? "bg-blue-50 border-blue-500" : "bg-blue-50/50 hover:bg-blue-50",
        border: isSelected ? "border-blue-500" : "border-blue-200",
        text: "text-blue-700",
        icon: "text-blue-600"
      },
      yellow: {
        bg: isSelected ? "bg-yellow-50 border-yellow-500" : "bg-yellow-50/50 hover:bg-yellow-50",
        border: isSelected ? "border-yellow-500" : "border-yellow-200",
        text: "text-yellow-700",
        icon: "text-yellow-600"
      },
      green: {
        bg: isSelected ? "bg-green-50 border-green-500" : "bg-green-50/50 hover:bg-green-50",
        border: isSelected ? "border-green-500" : "border-green-200",
        text: "text-green-700",
        icon: "text-green-600"
      },
      orange: {
        bg: isSelected ? "bg-orange-50 border-orange-500" : "bg-orange-50/50 hover:bg-orange-50",
        border: isSelected ? "border-orange-500" : "border-orange-200",
        text: "text-orange-700",
        icon: "text-orange-600"
      }
    };
    return colorMap[color as keyof typeof colorMap];
  };

  const handleSubmit = () => {
    // Simulate saving the data
    setShowSuccessModal(true);
  };

  const handleModalContinue = () => {
    setShowSuccessModal(false);
    navigate("/user/dashboard");
  };

  return (
    <UserLayout>
      <div className="p-6 space-y-6">
        {/* Clear Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Log Your Eco-Habits for Today
          </h1>
          <p className="text-lg text-gray-600">
            Select the eco-friendly actions you completed today and keep your streak alive! 🌱
          </p>
          {selectedHabits.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">
                {selectedHabits.length} habit{selectedHabits.length > 1 ? 's' : ''} selected • +{getTotalPoints()} points
              </span>
            </div>
          )}
        </div>

        {/* Habit Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {habitCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;
            const selectionCount = getCategorySelectionCount(category.id);
            const isSelected = selectionCount > 0;
            const colors = getColorClasses(category.color, isSelected);
            
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  isSelected 
                    ? `${colors.bg} border-4 shadow-lg scale-[1.02]` 
                    : `${colors.bg} ${colors.border} hover:shadow-md`
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center transition-transform ${isSelected ? 'scale-110' : ''}`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.emoji}</span>
                          <span className={`font-semibold ${colors.text}`}>
                            {category.title}
                          </span>
                        </div>
                        {selectionCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                              {selectionCount} action{selectionCount > 1 ? 's' : ''} selected
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-green-600">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {category.actions.map((action) => {
                        const isActionSelected = selectedHabits.includes(action.id);
                        
                        return (
                          <div 
                            key={action.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                              isActionSelected 
                                ? 'bg-green-100 border border-green-300' 
                                : 'hover:bg-white/80 border border-transparent'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHabitToggle(action.id);
                            }}
                          >
                            <Checkbox 
                              checked={isActionSelected}
                              onChange={() => {}} // Controlled by parent click
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <div className="flex-1">
                              <p className={`text-sm ${isActionSelected ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                                {action.label}
                              </p>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              isActionSelected 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-600'
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
        <div className="text-center pt-8 pb-4">
          <Button
            onClick={handleSubmit}
            disabled={selectedHabits.length === 0}
            className={`px-12 py-4 h-auto text-lg font-semibold transition-all ${
              selectedHabits.length > 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedHabits.length === 0 
              ? 'Select habits to continue' 
              : `Submit & Continue Streak (+${getTotalPoints()} points)`
            }
          </Button>
          
          {selectedHabits.length > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              Great job! You're about to add {selectedHabits.length} eco-action{selectedHabits.length > 1 ? 's' : ''} to your streak! 🌟
            </p>
          )}
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold text-green-600">
                Awesome work! 🎉
              </DialogTitle>
              <DialogDescription className="text-xl text-gray-700">
                Your streak is now <span className="font-bold text-green-600">{currentStreak + 1} days!</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                  <Flame className="w-5 h-5" />
                  <span>Keep it up! You're building amazing habits! 🌱</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>+{getTotalPoints()} points earned</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{currentStreak + 1} day streak</span>
                </div>
              </div>
              
              <Button 
                onClick={handleModalContinue}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 mt-6"
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}
