import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, Mail, Lock, User, Building, Eye, EyeOff, MapPin, Phone } from "lucide-react";
import { apiService, NGOOrganizationRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const focusAreas = [
  'environmental-conservation',
  'climate-change',
  'renewable-energy',
  'waste-management',
  'water-conservation',
  'biodiversity',
  'sustainable-agriculture',
  'forest-conservation',
  'ocean-conservation',
  'air-quality',
  'education',
  'research',
  'advocacy',
  'community-development',
  'other'
];

const legalStatuses = [
  'registered',
  'non-profit',
  'charity',
  'foundation',
  'trust',
  'society',
  'other'
];

export default function NGORegister() {
  const [formData, setFormData] = useState<NGOOrganizationRequest>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    description: "",
    mission: "",
    focusAreas: [],
    establishedYear: new Date().getFullYear(),
    legalStatus: "non-profit",
    registrationNumber: "",
    taxId: "",
    contactPerson: {
      name: "",
      email: "",
      phone: "",
      position: "",
    },
    documents: {
      registrationCertificate: "",
      taxExemptionCertificate: "",
      annualReport: "",
      otherDocuments: [],
    },
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Organization details
    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Organization email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Organization phone is required";
    }

    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.address.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.address.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Organization description is required";
    }

    if (!formData.mission.trim()) {
      newErrors.mission = "Mission statement is required";
    }

    if (formData.focusAreas.length === 0) {
      newErrors.focusAreas = "At least one focus area is required";
    }

    if (!formData.establishedYear || formData.establishedYear < 1900 || formData.establishedYear > new Date().getFullYear()) {
      newErrors.establishedYear = "Valid establishment year is required";
    }

    // Contact person
    if (!formData.contactPerson.name.trim()) {
      newErrors.contactPersonName = "Contact person name is required";
    }

    if (!formData.contactPerson.email.trim()) {
      newErrors.contactPersonEmail = "Contact person email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
      newErrors.contactPersonEmail = "Please enter a valid email";
    }

    if (!formData.contactPerson.phone.trim()) {
      newErrors.contactPersonPhone = "Contact person phone is required";
    }

    if (!formData.contactPerson.position.trim()) {
      newErrors.contactPersonPosition = "Contact person position is required";
    }

    // Admin details
    if (!formData.adminFullName.trim()) {
      newErrors.adminFullName = "Admin full name is required";
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email";
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = "Admin password is required";
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = "Password must be at least 6 characters";
    }

    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone = "Admin phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Clean up the data before sending
      const cleanData = {
        ...formData,
        // Remove empty optional fields
        website: formData.website?.trim() || undefined,
        address: {
          ...formData.address,
          zipCode: formData.address.zipCode?.trim() || undefined
        },
        registrationNumber: formData.registrationNumber?.trim() || undefined,
        taxId: formData.taxId?.trim() || undefined,
        documents: {
          registrationCertificate: formData.documents.registrationCertificate?.trim() || undefined,
          taxExemptionCertificate: formData.documents.taxExemptionCertificate?.trim() || undefined,
          annualReport: formData.documents.annualReport?.trim() || undefined,
          otherDocuments: formData.documents.otherDocuments?.filter(doc => doc?.trim()) || []
        }
      };

      console.log('Sending NGO registration data:', cleanData);

      const response = await apiService.registerNGOOrganization(cleanData);
      
      if (response.success) {
        toast({
          title: "Registration submitted successfully!",
          description: "Your organization registration has been submitted and is pending approval.",
        });
        navigate("/login", { 
          state: { 
            message: "Organization registration submitted successfully. Please wait for admin approval before logging in.",
            adminEmail: formData.adminEmail 
          } 
        });
      } else {
        toast({
          title: "Registration failed",
          description: response.message || "Please check your information",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('NGO Registration error:', error);
      
      // Handle validation errors specifically
      if (error.message && error.message.includes('Validation failed')) {
        // Try to extract specific validation errors from the error
        let errorMessage = "Please check all required fields and ensure they meet the requirements.";
        
        // If we have more specific error details, show them
        if (error.details && Array.isArray(error.details)) {
          const fieldErrors = error.details.map((detail: any) => `${detail.field}: ${detail.message}`).join(', ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        }
        
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "An error occurred during registration",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: checked
        ? [...prev.focusAreas, area]
        : prev.focusAreas.filter((a) => a !== area),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-forest/20 via-eco-leaf/10 to-eco-sky/20 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div
        className={
          'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-40'
        }
      ></div>

      <div className="relative w-full max-w-4xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-eco-forest">EcoConnect</h1>
          <p className="text-muted-foreground mt-2">
            Register your NGO organization
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-card-foreground">
              NGO Organization Registration
            </CardTitle>
            <CardDescription>
              Register your organization to join our environmental community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Organization Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter organization name"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Organization Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="contact@organization.org"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Organization Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1-555-0123"
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://organization.org"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange("address.street", e.target.value)}
                        placeholder="123 Organization Street"
                        className={errors.street ? "border-destructive" : ""}
                      />
                      {errors.street && <p className="text-xs text-destructive">{errors.street}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange("address.city", e.target.value)}
                        placeholder="City"
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={formData.address.state}
                        onChange={(e) => handleInputChange("address.state", e.target.value)}
                        placeholder="State"
                        className={errors.state ? "border-destructive" : ""}
                      />
                      {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange("address.country", e.target.value)}
                        placeholder="Country"
                        className={errors.country ? "border-destructive" : ""}
                      />
                      {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.address.zipCode}
                        onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>

                {/* Description and Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Organization Description * (Min 20 characters)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your organization's work and impact..."
                      rows={4}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mission">Mission Statement * (Min 10 characters)</Label>
                    <Textarea
                      id="mission"
                      value={formData.mission}
                      onChange={(e) => handleInputChange("mission", e.target.value)}
                      placeholder="Your organization's mission and goals..."
                      rows={4}
                      className={errors.mission ? "border-destructive" : ""}
                    />
                    {errors.mission && <p className="text-xs text-destructive">{errors.mission}</p>}
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="space-y-2">
                  <Label>Focus Areas * (Select at least one)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {focusAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={formData.focusAreas.includes(area)}
                          onCheckedChange={(checked) => handleFocusAreaChange(area, checked as boolean)}
                        />
                        <Label htmlFor={area} className="text-sm capitalize">
                          {area.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.focusAreas && <p className="text-xs text-destructive">{errors.focusAreas}</p>}
                </div>

                {/* Legal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year *</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => handleInputChange("establishedYear", parseInt(e.target.value))}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalStatus">Legal Status *</Label>
                    <Select
                      value={formData.legalStatus}
                      onValueChange={(value) => handleInputChange("legalStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select legal status" />
                      </SelectTrigger>
                      <SelectContent>
                        {legalStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Primary Contact Person
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName">Contact Name *</Label>
                    <Input
                      id="contactPersonName"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleInputChange("contactPerson.name", e.target.value)}
                      placeholder="Full name"
                      className={errors.contactPersonName ? "border-destructive" : ""}
                    />
                    {errors.contactPersonName && <p className="text-xs text-destructive">{errors.contactPersonName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonEmail">Contact Email *</Label>
                    <Input
                      id="contactPersonEmail"
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleInputChange("contactPerson.email", e.target.value)}
                      placeholder="contact@organization.org"
                      className={errors.contactPersonEmail ? "border-destructive" : ""}
                    />
                    {errors.contactPersonEmail && <p className="text-xs text-destructive">{errors.contactPersonEmail}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonPhone">Contact Phone *</Label>
                    <Input
                      id="contactPersonPhone"
                      value={formData.contactPerson.phone}
                      onChange={(e) => handleInputChange("contactPerson.phone", e.target.value)}
                      placeholder="+1-555-0124"
                      className={errors.contactPersonPhone ? "border-destructive" : ""}
                    />
                    {errors.contactPersonPhone && <p className="text-xs text-destructive">{errors.contactPersonPhone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonPosition">Position *</Label>
                    <Input
                      id="contactPersonPosition"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleInputChange("contactPerson.position", e.target.value)}
                      placeholder="Executive Director"
                      className={errors.contactPersonPosition ? "border-destructive" : ""}
                    />
                    {errors.contactPersonPosition && <p className="text-xs text-destructive">{errors.contactPersonPosition}</p>}
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Admin Account
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminFullName">Admin Full Name *</Label>
                    <Input
                      id="adminFullName"
                      value={formData.adminFullName}
                      onChange={(e) => handleInputChange("adminFullName", e.target.value)}
                      placeholder="Admin full name"
                      className={errors.adminFullName ? "border-destructive" : ""}
                    />
                    {errors.adminFullName && <p className="text-xs text-destructive">{errors.adminFullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                      placeholder="admin@organization.org"
                      className={errors.adminEmail ? "border-destructive" : ""}
                    />
                    {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password * (Min 6 characters)</Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                        placeholder="Create a strong password"
                        className={errors.adminPassword ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.adminPassword && <p className="text-xs text-destructive">{errors.adminPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">Admin Phone *</Label>
                    <Input
                      id="adminPhone"
                      value={formData.adminPhone}
                      onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                      placeholder="+1-555-0125"
                      className={errors.adminPhone ? "border-destructive" : ""}
                    />
                    {errors.adminPhone && <p className="text-xs text-destructive">{errors.adminPhone}</p>}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Submitting Registration..." : "Submit Organization Registration"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-xs text-muted-foreground">
          © 2024 EcoConnect. All rights reserved.
        </div>
      </div>
    </div>
  );
}
