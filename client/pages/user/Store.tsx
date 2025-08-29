import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  Store as StoreIcon,
  Filter,
  SortAsc,
  Gift,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  ngoName: string;
  ngoLogo?: string;
  category: string;
  inStock: boolean;
  popularity: number;
}

export default function Store() {
  const userPoints = 1250;
  const pointsExpiryDays = 90;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("points-low");

  const products: Product[] = [
    {
      id: "1",
      name: "Organic Cotton Tote Bag",
      description: "Sustainable shopping bag made from 100% organic cotton",
      pointsCost: 150,
      imageUrl: "",
      ngoName: "Green Earth Foundation",
      category: "accessories",
      inStock: true,
      popularity: 95
    },
    {
      id: "2", 
      name: "Bamboo Water Bottle",
      description: "Eco-friendly water bottle with bamboo exterior and steel interior",
      pointsCost: 300,
      imageUrl: "",
      ngoName: "Ocean Cleanup Initiative",
      category: "drinkware",
      inStock: true,
      popularity: 88
    },
    {
      id: "3",
      name: "Solar Power Bank",
      description: "Portable solar charger for your devices, never run out of power",
      pointsCost: 800,
      imageUrl: "",
      ngoName: "Solar Communities Network",
      category: "electronics",
      inStock: true,
      popularity: 92
    },
    {
      id: "4",
      name: "Seed Bomb Kit",
      description: "Grow wildflowers anywhere with these biodegradable seed bombs",
      pointsCost: 100,
      imageUrl: "",
      ngoName: "Green Earth Foundation",
      category: "gardening",
      inStock: true,
      popularity: 79
    },
    {
      id: "5",
      name: "Recycled Notebook Set",
      description: "Beautiful notebooks made from 100% recycled paper",
      pointsCost: 200,
      imageUrl: "",
      ngoName: "Zero Waste Alliance",
      category: "stationery",
      inStock: false,
      popularity: 85
    },
    {
      id: "6",
      name: "Beeswax Food Wraps",
      description: "Replace plastic wrap with these reusable beeswax wraps",
      pointsCost: 180,
      imageUrl: "",
      ngoName: "Zero Waste Alliance",
      category: "kitchen",
      inStock: true,
      popularity: 91
    },
    {
      id: "7",
      name: "Wooden Phone Stand",
      description: "Handcrafted phone stand from sustainably sourced wood",
      pointsCost: 250,
      imageUrl: "",
      ngoName: "Urban Forest Project",
      category: "accessories",
      inStock: true,
      popularity: 76
    },
    {
      id: "8",
      name: "Eco-Friendly Soap Set",
      description: "Natural soap bars with biodegradable packaging",
      pointsCost: 120,
      imageUrl: "",
      ngoName: "Green Earth Foundation",
      category: "personal-care",
      inStock: true,
      popularity: 83
    },
    {
      id: "9",
      name: "Reusable Produce Bags",
      description: "Mesh bags perfect for grocery shopping without plastic",
      pointsCost: 80,
      imageUrl: "",
      ngoName: "Ocean Cleanup Initiative",
      category: "accessories",
      inStock: true,
      popularity: 94
    }
  ];

  const ngos = Array.from(new Set(products.map(p => p.ngoName)));

  const filteredProducts = products
    .filter(product => selectedNGO === "all" || product.ngoName === selectedNGO)
    .sort((a, b) => {
      switch (sortBy) {
        case "points-low":
          return a.pointsCost - b.pointsCost;
        case "points-high":
          return b.pointsCost - a.pointsCost;
        case "popularity":
          return b.popularity - a.popularity;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleRedeem = (product: Product) => {
    setSelectedProduct(product);
    setShowRedeemModal(true);
  };

  const confirmRedemption = () => {
    setShowRedeemModal(false);
    setShowSuccessModal(true);
    
    // In a real app, you would make an API call here
    setTimeout(() => {
      setShowSuccessModal(false);
      setSelectedProduct(null);
    }, 3000);
  };

  const canAfford = (pointsCost: number) => {
    return userPoints >= pointsCost;
  };

  const getProductImage = (product: Product) => {
    // Placeholder image logic - in real app would use actual images
    const colors = ['bg-eco-forest', 'bg-eco-sky', 'bg-eco-sage', 'bg-eco-earth'];
    const colorIndex = parseInt(product.id) % colors.length;
    return colors[colorIndex];
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <DashboardLayout userRole="user" userName="Alex Johnson">
      <div className="space-y-6">
        {/* Header with Points Balance */}
        <div className="bg-gradient-to-r from-eco-sage/10 via-eco-sky/5 to-eco-leaf/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <StoreIcon className="w-8 h-8 text-eco-sage" />
                Rewards Store
              </h1>
              <p className="text-muted-foreground">
                Redeem your eco-points for amazing sustainable products
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-eco-sage" />
                <span className="text-3xl font-bold text-eco-sage">{userPoints.toLocaleString()}</span>
                <span className="text-muted-foreground">points</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Points expire in {pointsExpiryDays} days of inactivity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedNGO} onValueChange={setSelectedNGO}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by NGO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All NGOs</SelectItem>
                    {ngos.map((ngo) => (
                      <SelectItem key={ngo} value={ngo}>
                        {ngo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points-low">Points: Low to High</SelectItem>
                    <SelectItem value="points-high">Points: High to Low</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const affordable = canAfford(product.pointsCost);
            
            return (
              <Card 
                key={product.id}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  !product.inStock ? 'opacity-60' : ''
                } ${affordable ? 'hover:scale-[1.02]' : ''}`}
              >
                {/* Product Image */}
                <div className={`h-48 ${getProductImage(product)} rounded-t-lg flex items-center justify-center`}>
                  <Gift className="w-16 h-16 text-white/80" />
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>

                    {/* NGO Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-eco-sky/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-eco-sky">{getInitials(product.ngoName)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{product.ngoName}</span>
                    </div>

                    {/* Points and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-eco-sage" />
                        <span className={`font-bold ${affordable ? 'text-eco-sage' : 'text-destructive'}`}>
                          {product.pointsCost} pts
                        </span>
                      </div>
                      
                      {!product.inStock && (
                        <Badge variant="secondary" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    {/* Redeem Button */}
                    <Button
                      onClick={() => handleRedeem(product)}
                      disabled={!affordable || !product.inStock}
                      className={`w-full ${
                        affordable && product.inStock
                          ? 'bg-gradient-to-r from-eco-sage to-eco-sky hover:from-eco-sage/90 hover:to-eco-sky/90 text-white'
                          : ''
                      }`}
                      variant={affordable && product.inStock ? "default" : "outline"}
                    >
                      {!product.inStock 
                        ? "Out of Stock"
                        : !affordable 
                          ? `Need ${product.pointsCost - userPoints} more points`
                          : "Redeem Now"
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <StoreIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more products</p>
            </CardContent>
          </Card>
        )}

        {/* Redemption Confirmation Modal */}
        <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-eco-sage" />
                Redeem Reward
              </DialogTitle>
              <DialogDescription>
                Confirm your reward redemption
              </DialogDescription>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-semibold">{selectedProduct.pointsCost} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>You have:</span>
                    <span className="font-semibold">{userPoints} points</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>After redemption:</span>
                    <span className="font-semibold text-eco-sage">
                      {userPoints - selectedProduct.pointsCost} points
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Remember, points expire after {pointsExpiryDays} days of inactivity!
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRedeemModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmRedemption}
                className="bg-gradient-to-r from-eco-sage to-eco-sky hover:from-eco-sage/90 hover:to-eco-sky/90"
              >
                Confirm Redemption
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <div className="w-20 h-20 bg-gradient-to-r from-eco-sage to-eco-sky rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-eco-sage">
                Success! 🎉
              </DialogTitle>
              <DialogDescription className="text-lg">
                Your reward is on its way!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedProduct && (
                <div className="bg-eco-sage/10 rounded-lg p-4">
                  <h3 className="font-semibold text-eco-sage">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Provided by {selectedProduct.ngoName}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                You'll receive instructions on how to claim your reward via email within 24 hours.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
