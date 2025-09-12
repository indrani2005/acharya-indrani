import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Upload, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Admission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    class: "",
    parentContact: "",
    email: "",
    address: "",
    documents: [] as File[],
    additional: {
      previousSchool: "",
      lastPercentage: "",
      guardianName: "",
    },
    acceptedTerms: false,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalChange = (field: keyof typeof formData.additional, value: string) => {
    setFormData(prev => ({ ...prev, additional: { ...prev.additional, [field]: value } }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const isStepValid = useMemo(() => {
    if (step === 1) {
      return (
        formData.name.trim().length > 1 &&
        formData.dob &&
        formData.class &&
        formData.parentContact &&
        formData.email &&
        formData.address
      );
    }
    if (step === 2) {
      return formData.documents.length > 0;
    }
    if (step === 3) {
      return true; // optional
    }
    if (step === 4) {
      return formData.acceptedTerms;
    }
    return false;
  }, [step, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 4) {
      if (isStepValid) setStep(prev => prev + 1);
      return;
    }

    if (!isStepValid) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Form Submitted Successfully!",
        description: "Your admission application has been received. We will contact you soon.",
      });
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
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
              <p className="text-sm text-muted-foreground">
                We will review your application and contact you within 3-5 business days.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/auth')}
                >
                  Back to Portal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      dob: "",
                      class: "",
                      parentContact: "",
                      email: "",
                      address: "",
                      documents: [],
                      additional: { previousSchool: "", lastPercentage: "", guardianName: "" },
                      acceptedTerms: false,
                    });
                    setDate(undefined);
                    setStep(1);
                  }}
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Admission Application</CardTitle>
            <CardDescription>
              Fill out the form below to apply for admission
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step Progress */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[1,2,3,4].map((s) => (
                  <div key={s} className={`h-2 rounded ${step >= s ? 'bg-primary' : 'bg-muted'}`}></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-white/80">
                <span>Details</span>
                <span>Documents</span>
                <span>Additional</span>
                <span>Terms</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Step 1: Personal & Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" placeholder="Enter full name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}> 
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={(selectedDate) => { setDate(selectedDate); handleInputChange('dob', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''); }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class Applying For *</Label>
                    <Select onValueChange={(value) => handleInputChange('class', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {['nursery','lkg','ukg','1','2','3','4','5','6','7','8','9','10','11','12'].map((c) => (
                          <SelectItem key={c} value={c}>{c === 'nursery' || c==='lkg' || c==='ukg' ? c.toUpperCase() : (Number.isNaN(Number(c)) ? c : `Class ${c}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentContact">Parent Contact Number *</Label>
                      <Input id="parentContact" type="tel" placeholder="Enter contact number" value={formData.parentContact} onChange={(e) => handleInputChange('parentContact', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" placeholder="Enter complete address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} required rows={3} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Step 2: Upload Required Documents</h3>
                  <div className="space-y-2">
                    <Label htmlFor="documents">Upload Documents *</Label>
                    <Input id="documents" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="cursor-pointer" />
                    <p className="text-sm text-muted-foreground">Upload: Birth Certificate, Previous Report Card, ID Proof (PDF, JPG, PNG)</p>
                  </div>
                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files:</Label>
                      <div className="space-y-2">
                        {formData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Step 3: Additional Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="previousSchool">Previous School</Label>
                      <Input id="previousSchool" placeholder="Enter previous school name" value={formData.additional.previousSchool} onChange={(e) => handleAdditionalChange('previousSchool', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastPercentage">Last Exam Percentage</Label>
                      <Input id="lastPercentage" type="number" placeholder="e.g. 86" value={formData.additional.lastPercentage} onChange={(e) => handleAdditionalChange('lastPercentage', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name (if applicable)</Label>
                    <Input id="guardianName" placeholder="Enter guardian name" value={formData.additional.guardianName} onChange={(e) => handleAdditionalChange('guardianName', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Step 4: Terms & Policies</h3>
                  <div className="space-y-3 p-4 border rounded bg-muted/30">
                    <p className="text-sm">By submitting this form, I hereby declare that the information provided is true and correct to the best of my knowledge. I understand that providing false information may result in rejection of the application.</p>
                    <p className="text-sm">I consent to the processing of my personal data for the purpose of admission in accordance with the institution's privacy policy.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id="terms" type="checkbox" className="h-4 w-4" checked={formData.acceptedTerms} onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))} />
                    <Label htmlFor="terms">I agree to the terms and policies</Label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate('/auth'))}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {step > 1 ? 'Back' : 'Back to Portal'}
                </Button>
                {step < 4 ? (
                  <Button type="submit" disabled={!isStepValid}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !isStepValid}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admission;
