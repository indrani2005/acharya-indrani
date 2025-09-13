import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { admissionService, AdmissionApplication } from "@/lib/api";

const Admission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    applicant_name: "",
    date_of_birth: "",
    course_applied: "",
    phone_number: "",
    email: "",
    address: "",
    previous_school: "",
    last_percentage: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData(prev => ({ 
        ...prev, 
        date_of_birth: format(selectedDate, "yyyy-MM-dd") 
      }));
    }
  };

  const validateForm = () => {
    if (!formData.applicant_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.date_of_birth) {
      toast({
        title: "Validation Error",
        description: "Please select your date of birth",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.course_applied) {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phone_number || formData.phone_number.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData: Partial<AdmissionApplication> = {
        ...formData,
        last_percentage: formData.last_percentage ? parseFloat(formData.last_percentage) : undefined,
      };

      const response = await admissionService.submitApplication(applicationData);
      
      setApplicationId(response.id!);
      setIsSubmitted(true);
      
      toast({
        title: "Application Submitted Successfully!",
        description: `Your application has been received. Reference ID: ${response.id}`,
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.error || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Application Submitted!</CardTitle>
              <CardDescription>
                Your admission application has been successfully submitted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Application ID:</strong> {applicationId}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  We will review your application and contact you within 3-5 business days.
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>What's Next?</strong></p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Application review by admissions team</li>
                  <li>Document verification</li>
                  <li>Interview scheduling (if required)</li>
                  <li>Final admission decision</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Back to Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSubmitted(false);
                    setApplicationId(null);
                    setFormData({
                      applicant_name: "",
                      date_of_birth: "",
                      course_applied: "",
                      phone_number: "",
                      email: "",
                      address: "",
                      previous_school: "",
                      last_percentage: "",
                    });
                    setDate(undefined);
                  }}
                  className="w-full"
                >
                  Submit Another Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Admission Application</h1>
          <p className="text-gray-600 mt-2">Join Acharya School and start your educational journey</p>
        </div>

        {/* Application Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Please fill in all required information accurately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.applicant_name}
                    onChange={(e) => handleInputChange("applicant_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select 
                    value={formData.course_applied} 
                    onValueChange={(value) => handleInputChange("course_applied", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical Engineering</SelectItem>
                      <SelectItem value="Civil">Civil Engineering</SelectItem>
                      <SelectItem value="Business Administration">Business Administration</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input
                    id="previousSchool"
                    placeholder="Enter previous school name"
                    value={formData.previous_school}
                    onChange={(e) => handleInputChange("previous_school", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage">Last Percentage</Label>
                  <Input
                    id="percentage"
                    type="number"
                    placeholder="Enter last exam percentage"
                    value={formData.last_percentage}
                    onChange={(e) => handleInputChange("last_percentage", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admission;