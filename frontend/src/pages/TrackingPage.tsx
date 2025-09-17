import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Search, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";
import { admissionService } from "@/lib/api/services";
import { AdmissionTrackingResponse, SchoolAdmissionDecision } from "@/lib/api/types";

export default function TrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<AdmissionTrackingResponse | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [acceptedSchools, setAcceptedSchools] = useState<SchoolAdmissionDecision[]>([]);
  const [isSubmittingChoice, setIsSubmittingChoice] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleTrackApplication = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reference ID",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    try {
      const result = await admissionService.trackApplication(trackingId.trim());
      setTrackingResult(result);

      if (result.success && result.data) {
        // Check for accepted schools
        const accepted = result.data.school_decisions?.filter(decision => 
          decision.decision === 'accepted'
        ) || [];
        setAcceptedSchools(accepted);

        // Update URL with reference ID
        setSearchParams({ ref: trackingId.trim() });

        toast({
          title: "Application Found",
          description: `Found application for ${result.data.applicant_name}`,
        });
      } else {
        toast({
          title: "Not Found",
          description: "No application found with this reference ID",
          variant: "destructive",
        });
        setTrackingResult(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track application. Please try again.",
        variant: "destructive",
      });
      setTrackingResult(null);
    } finally {
      setIsTracking(false);
    }
  };

  const handleStudentChoice = async (chosenSchool: string) => {
    if (!trackingResult?.data?.reference_id) return;

    setIsSubmittingChoice(true);
    try {
      const result = await admissionService.submitStudentChoice({
        reference_id: trackingResult.data.reference_id,
        chosen_school: chosenSchool
      });

      if (result.success) {
        toast({
          title: "School Selected",
          description: `You have successfully selected ${chosenSchool}. Proceeding to fee payment...`,
        });
        
        // Refresh tracking data
        await handleTrackApplication();
        
        // Proceed to fee payment after a short delay
        setTimeout(() => {
          handleProceedToPayment(acceptedSchools.find(school => 
            getSchoolName(school.school, school.school_name) === chosenSchool
          ));
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to submit choice');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your choice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingChoice(false);
    }
  };

  const handleProceedToPayment = async (selectedSchool?: SchoolAdmissionDecision) => {
    if (!trackingResult?.data?.reference_id) return;
    
    try {
      const result = await admissionService.initializeFeePayment({
        reference_id: trackingResult.data.reference_id,
        school_decision_id: selectedSchool?.id
      });
      
      if (result.success) {
        setPaymentInfo(result.data);
        setShowPaymentModal(true);
        
        toast({
          title: "Payment Information Ready",
          description: `Fee details loaded for ${result.data.school_name}`,
        });
      } else {
        throw new Error(result.message || 'Failed to initialize payment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      
      console.error('Payment initialization error:', error);
    }
  };

  const handlePaymentMethod = (method: string) => {
    // Here you would integrate with actual payment gateways
    toast({
      title: "Payment Gateway",
      description: `Redirecting to ${method} payment portal...`,
    });
    
    // For demonstration purposes, simulate payment success after 2 seconds
    setTimeout(() => {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your enrollment has been confirmed. Check your email for details.",
      });
      setShowPaymentModal(false);
    }, 2000);
    
    console.log('Payment method selected:', method, 'for amount:', paymentInfo?.fee_structure?.total_fee);
  };

  const getSchoolName = (school: any, schoolName?: string): string => {
    if (typeof school === 'string') return school;
    if (typeof school === 'object' && school?.school_name) return school.school_name;
    if (schoolName) return schoolName;
    return 'Unknown School';
  };

  const getStatusBadge = (decision: string) => {
    switch (decision) {
      case 'accepted':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />ACCEPTED</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />REJECTED</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />PENDING</Badge>;
    }
  };

  const getOverallStatus = () => {
    if (!trackingResult?.data?.school_decisions) return "PENDING";
    
    const decisions = trackingResult.data.school_decisions;
    const hasAccepted = decisions.some(d => d.decision === 'accepted');
    const allDecided = decisions.every(d => d.decision && d.decision !== 'pending');
    
    if (hasAccepted) return "ACCEPTED";
    if (allDecided) return "REJECTED";
    return "PENDING";
  };

  // Handle URL parameter on page load
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && refParam !== trackingId) {
      setTrackingId(refParam);
      // Auto-track if we have a reference ID in URL
      setTimeout(() => {
        const trackRef = refParam;
        setIsTracking(true);
        admissionService.trackApplication(trackRef.trim())
          .then(result => {
            setTrackingResult(result);
            if (result.success && result.data) {
              const accepted = result.data.school_decisions?.filter(decision => 
                decision.decision === 'accepted'
              ) || [];
              setAcceptedSchools(accepted);
            }
          })
          .catch(() => {
            setTrackingResult(null);
          })
          .finally(() => {
            setIsTracking(false);
          });
      }, 100);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Track Your Application</h1>
          <p className="text-white/80">Enter your reference ID to check your application status</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6 shadow-2xl border-0">
          <CardHeader className="bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Application Tracking
            </CardTitle>
            <CardDescription className="text-white/90">
              Enter your application reference ID (e.g., ADM-2025-QFYS29)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Reference ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackApplication()}
                className="flex-1"
              />
              <Button 
                onClick={handleTrackApplication}
                disabled={isTracking}
                className="min-w-[120px] bg-gradient-primary hover:opacity-90"
              >
                {isTracking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Track Application
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingResult?.success && trackingResult.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(100vh-300px)] overflow-hidden">
            {/* Left Column */}
            <div className="space-y-4 overflow-y-auto pr-2">
              {/* Application Overview */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-primary text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span>Application Status</span>
                    {getStatusBadge(getOverallStatus().toLowerCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reference ID:</label>
                      <p className="font-mono text-lg">{trackingResult.data.reference_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applicant:</label>
                      <p className="text-lg">{trackingResult.data.applicant_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Course:</label>
                      <p className="text-lg">{trackingResult.data.course_applied}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applied:</label>
                      <p className="text-lg">
                        {new Date(trackingResult.data.application_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School Preferences */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-primary text-white">
                  <CardTitle>School Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {trackingResult.data.first_preference_school && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-blue-600">1st Preference:</span>
                        <p className="font-medium">{trackingResult.data.first_preference_school.school_name}</p>
                      </div>
                    </div>
                  )}
                  {trackingResult.data.second_preference_school && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">2nd Preference:</span>
                        <p className="font-medium">{trackingResult.data.second_preference_school.school_name}</p>
                      </div>
                    </div>
                  )}
                  {trackingResult.data.third_preference_school && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">3rd Preference:</span>
                        <p className="font-medium">{trackingResult.data.third_preference_school.school_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4 overflow-y-auto pl-2">
              {/* School Review Status */}
              {trackingResult.data.school_decisions && trackingResult.data.school_decisions.length > 0 && (
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-primary text-white">
                    <CardTitle>School Review Status</CardTitle>
                    <CardDescription className="text-white/90">
                      Review status from each school where you applied
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {trackingResult.data.school_decisions.map((decision, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{getSchoolName(decision.school, decision.school_name)}</p>
                            {decision.decision_date && (
                              <p className="text-sm text-gray-500">
                                Reviewed on {new Date(decision.decision_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(decision.decision || 'pending')}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Student Choice Interface */}
              {acceptedSchools.length > 1 && (
                <Card className="shadow-xl border-green-200 border-2">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      🎉 Multiple Acceptances!
                    </CardTitle>
                    <CardDescription className="text-white/90">
                      Congratulations! You've been accepted to multiple schools. Choose your preferred school to proceed with enrollment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {acceptedSchools.map((school, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="lg"
                          className="w-full justify-between border-green-200 hover:bg-green-50 h-auto p-4"
                          onClick={() => handleStudentChoice(getSchoolName(school.school))}
                          disabled={isSubmittingChoice}
                        >
                          <div className="text-left">
                            <p className="font-medium">{getSchoolName(school.school, school.school_name)}</p>
                            <p className="text-sm text-gray-500">Click to select this school</p>
                          </div>
                          {isSubmittingChoice ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>Note:</strong> After selecting your preferred school, you'll be guided to the fee payment process.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Single Acceptance with Fee Payment */}
              {acceptedSchools.length === 1 && (
                <Card className="shadow-xl border-green-200 border-2">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      🎉 Congratulations!
                    </CardTitle>
                    <CardDescription className="text-white/90">
                      You've been accepted! Proceed with enrollment and fee payment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-700 mb-2">Accepted School:</h4>
                        <p className="text-lg font-semibold">{getSchoolName(acceptedSchools[0].school, acceptedSchools[0].school_name)}</p>
                      </div>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        onClick={() => handleProceedToPayment(acceptedSchools[0])}
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Proceed to Fee Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments */}
              {trackingResult.data.review_comments && (
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-primary text-white">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Review Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-700">{trackingResult.data.review_comments}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* No Results */}
        {trackingResult && !trackingResult.success && (
          <Card className="shadow-xl border-0">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Found</h3>
              <p className="text-gray-600">
                No application found with reference ID: {trackingId}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please check your reference ID and try again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Fee Payment Details
            </DialogTitle>
            <DialogDescription>
              Review your fee structure and proceed with payment
            </DialogDescription>
          </DialogHeader>
          
          {paymentInfo && (
            <div className="space-y-6">
              {/* School and Course Info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Enrollment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">School:</span>
                    <p className="font-medium">{paymentInfo.school_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Course:</span>
                    <p className="font-medium">{paymentInfo.course}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Reference ID:</span>
                    <p className="font-mono font-medium">{paymentInfo.reference_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <p className="font-medium">{new Date(paymentInfo.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-4">Fee Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tuition Fee:</span>
                    <span>₹{paymentInfo.fee_structure.tuition_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Library Fee:</span>
                    <span>₹{paymentInfo.fee_structure.library_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lab Fee:</span>
                    <span>₹{paymentInfo.fee_structure.lab_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exam Fee:</span>
                    <span>₹{paymentInfo.fee_structure.exam_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admission Fee:</span>
                    <span>₹{paymentInfo.fee_structure.admission_fee}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{paymentInfo.fee_structure.total_fee}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h4 className="font-medium">Select Payment Method</h4>
                <div className="grid grid-cols-1 gap-3">
                  {paymentInfo.payment_methods.map((method: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => handlePaymentMethod(method)}
                    >
                      <div className="text-left">
                        <p className="font-medium">
                          {method === 'online' && '💳 Online Payment'}
                          {method === 'card' && '💳 Credit/Debit Card'}
                          {method === 'bank_transfer' && '🏦 Bank Transfer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {method === 'online' && 'Pay securely using UPI, Net Banking, or Cards'}
                          {method === 'card' && 'Direct card payment with instant confirmation'}
                          {method === 'bank_transfer' && 'Transfer directly to school account'}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p><strong>Note:</strong> Payment is required to confirm your enrollment. 
                Once payment is completed, you will receive a confirmation receipt and 
                further enrollment instructions via email.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}