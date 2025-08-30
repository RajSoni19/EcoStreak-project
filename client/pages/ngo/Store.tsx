import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  pointsCost: number;
  category: string;
  tags: string[];
  stock: number;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  pointsCost: number;
  stock: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const PRODUCT_CATEGORIES = [
  'eco-friendly',
  'sustainable',
  'renewable',
  'organic',
  'recycled',
  'energy-efficient',
  'water-saving',
  'other'
];

export default function NGOStore() {
  const { toast } = useToast();
  
  // State for real data
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "eco-friendly",
    tags: [],
    price: 0,
    pointsCost: 0,
    stock: 0,
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
    },
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    socialMedia: {},
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newTag, setNewTag] = useState("");

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getNGOStoreProducts();
      if (response.success) {
        setProducts(response.data.products || []);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      
      // Handle authentication errors
      if (error.message === 'Invalid token' || error.message.includes('401')) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load store products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Refresh products
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Products refreshed",
    });
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products
  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "All" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from real data
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.isActive).length,
    verifiedProducts: products.filter((p) => p.isVerified).length,
    averageRating: products.length > 0 
      ? Math.round(products.reduce((sum, p) => sum + p.rating, 0) / products.length * 10) / 10
      : 0,
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "eco-friendly",
      tags: [],
      price: 0,
      pointsCost: 0,
      stock: 0,
      location: {
        address: "",
        city: "",
        state: "",
        country: "",
      },
      contact: {
        email: "",
        phone: "",
        website: "",
      },
      socialMedia: {},
    });
    setNewTag("");
  };

  // Open add product dialog
  const openAddProduct = () => {
    resetForm();
    setShowAddProduct(true);
  };

  // Open edit product dialog
  const openEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      tags: product.tags,
      price: product.price,
      pointsCost: product.pointsCost,
      stock: product.stock,
      location: product.location,
      contact: product.contact,
      socialMedia: product.socialMedia || {},
    });
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  // Close dialog
  const closeDialog = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (formData.name.length < 3) {
      toast({
        title: "Validation Error",
        description: "Product name must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.description.length < 10) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }
      
      const userData = JSON.parse(storedUser);
      console.log('User data from localStorage:', userData);
      console.log('User ID:', userData._id);
      console.log('User ID type:', typeof userData._id);
      console.log('User ID length:', userData._id?.length);
      
      // Prepare the product data with proper types
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        pointsCost: Number(formData.pointsCost),
        stock: Number(formData.stock),
        tags: formData.tags || [],
        // Only include location if address is provided
        ...(formData.location.address && {
          location: {
            address: formData.location.address,
            city: formData.location.city,
            state: formData.location.state,
            country: formData.location.country,
          }
        }),
        // Only include contact if email is provided
        ...(formData.contact.email && {
          contact: {
            email: formData.contact.email,
            ...(formData.contact.phone && { phone: formData.contact.phone }),
            ...(formData.contact.website && { website: formData.contact.website }),
          }
        }),
        // Only include social media if they have values
        ...(Object.keys(formData.socialMedia || {}).length > 0 && {
          socialMedia: Object.fromEntries(
            Object.entries(formData.socialMedia || {}).filter(([_, value]) => value)
          )
        })
      };

      console.log("Submitting product payload:", JSON.stringify(productData, null, 2));
      
      if (editingProduct) {
        // Update existing product
        const response = await apiService.updateNGOStoreProduct(editingProduct._id, productData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Product updated successfully",
          });
          closeDialog();
          fetchProducts(); // Refresh the list
        }
      } else {
        // Create new product
        const response = await apiService.createNGOStoreProduct(productData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Product created successfully",
          });
          closeDialog();
          fetchProducts(); // Refresh the list
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Show detailed validation errors if available
      let errorMessage = error.message || "Failed to save product";
      if (error.message === 'Validation failed' && error.response?.data?.details) {
        const details = error.response.data.details;
        errorMessage = `Validation failed:\n${details.map((d: any) => `• ${d.field}: ${d.message}`).join('\n')}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await apiService.deleteNGOStoreProduct(productId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        fetchProducts(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Toggle product status
  const toggleProductStatus = async (product: Product) => {
    try {
      const response = await apiService.updateNGOStoreProduct(product._id, {
        isActive: !product.isActive
      });
      if (response.success) {
        toast({
          title: "Success",
          description: `Product ${product.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        fetchProducts(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="ngo" userName="NGO Admin" organizationName="Organization">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Store Management</h1>
            <p className="text-muted-foreground">Manage your eco-friendly products and rewards</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={openAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Products</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 border rounded-md"
                  >
                  <option value="All">All Categories</option>
                  {PRODUCT_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== "All" 
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first product"
                  }
                </p>
                {!searchTerm && selectedCategory === "All" && (
                  <Button onClick={openAddProduct}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
              <Card key={product._id} className="relative">
                <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {product.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">${product.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Points Cost:</span>
                      <span className="font-medium">{product.pointsCost} pts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? product.stock : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{product.tags.length - 3}
                        </Badge>
                      )}
                  </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditProduct(product)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  <Button
                    variant="outline"
                    size="sm"
                      onClick={() => toggleProductStatus(product)}
                  >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-700"
                  >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Add/Edit Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            <DialogDescription>
                {editingProduct 
                  ? 'Update your product information below.'
                  : 'Fill in the details to add a new product to your store.'
                }
            </DialogDescription>
          </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
          <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Eco Water Bottle"
                      required
                      minLength={3}
                    />
            </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your product in detail..."
                    rows={4}
                    required
                    minLength={10}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing and Stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Stock</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pointsCost">Points Cost *</Label>
                    <Input
                      id="pointsCost"
                      type="number"
                      min="0"
                      value={formData.pointsCost}
                      onChange={(e) => setFormData({...formData, pointsCost: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location (Optional)</h3>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.location.address}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, address: e.target.value}
                    })}
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, city: e.target.value}
                      })}
                      placeholder="New York"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.location.state}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, state: e.target.value}
                      })}
                      placeholder="NY"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, country: e.target.value}
                      })}
                      placeholder="USA"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({
                        ...formData, 
                        contact: {...formData.contact, email: e.target.value}
                      })}
                      placeholder="contact@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({
                        ...formData, 
                        contact: {...formData.contact, phone: e.target.value}
                      })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) => setFormData({
                      ...formData, 
                      contact: {...formData.contact, website: e.target.value}
                    })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

          <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </Button>
          </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
