import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Gift,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  image?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  totalRedeemed: number;
}

export default function NGOStore() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Eco Water Bottle",
      description: "Reusable stainless steel water bottle with eco-friendly design",
      points: 500,
      category: "Lifestyle",
      stock: 25,
      isActive: true,
      createdAt: "2024-01-15",
      totalRedeemed: 12,
    },
    {
      id: "2",
      name: "Organic Cotton Tote",
      description: "Sustainable shopping bag made from organic cotton",
      points: 300,
      category: "Lifestyle",
      stock: 40,
      isActive: true,
      createdAt: "2024-01-10",
      totalRedeemed: 8,
    },
    {
      id: "3",
      name: "Solar Power Bank",
      description: "Portable charger powered by solar energy",
      points: 800,
      category: "Technology",
      stock: 15,
      isActive: true,
      createdAt: "2024-01-20",
      totalRedeemed: 5,
    },
  ]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Lifestyle", "Technology", "Food", "Fashion"];

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "All" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.isActive).length,
    totalRedeemed: products.reduce((sum, p) => sum + p.totalRedeemed, 0),
    averagePoints: Math.round(
      products.reduce((sum, p) => sum + p.points, 0) / products.length
    ),
  };

  const handleAddProduct = () => {
    // Add product logic here
    setShowAddProduct(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleProductStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  return (
    <DashboardLayout
      userRole="ngo"
      userName="NGO Admin"
      organizationName="Green Earth Foundation"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Rewards Store Management
            </h1>
            <p className="text-muted-foreground">
              Manage products and rewards for your community members
            </p>
          </div>
          <Button onClick={() => setShowAddProduct(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-forest/10 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-eco-forest" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-eco-forest">
                    {stats.totalProducts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-sky/10 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-eco-sky" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold text-eco-sky">
                    {stats.activeProducts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-sage/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-eco-sage" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Redeemed</p>
                  <p className="text-2xl font-bold text-eco-sage">
                    {stats.totalRedeemed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eco-earth/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-eco-earth" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Points</p>
                  <p className="text-2xl font-bold text-eco-earth">
                    {stats.averagePoints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={product.image} />
                      <AvatarFallback className="bg-eco-forest/20 text-eco-forest">
                        {product.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className="mt-1 bg-eco-sky/10 text-eco-sky border-eco-sky/20"
                      >
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-eco-sage" />
                    <span className="font-semibold text-eco-sage">
                      {product.points} points
                    </span>
                  </div>
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className={product.isActive ? "bg-eco-forest" : ""}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p className="font-medium">{product.stock} available</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Redeemed</p>
                    <p className="font-medium">{product.totalRedeemed}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleProductStatus(product.id)}
                  >
                    {product.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search terms or filters"
                  : "Get started by adding your first product"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new reward product for your community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Enter product description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points Required</Label>
                <Input id="points" type="number" placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input id="stock" type="number" placeholder="25" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
