import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileImage, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { admissionService } from '@/lib/api/services';

interface OCRFormExtractorProps {
  onDataExtracted: (formData: Record<string, string>) => void;
  disabled?: boolean;
}

interface ExtractedData {
  extracted_text: string;
  form_data: Record<string, string>;
  confidence: number;
  extracted_fields_count: number;
}

export const OCRFormExtractor: React.FC<OCRFormExtractorProps> = ({
  onDataExtracted,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image file (JPEG, PNG, TIFF, BMP).",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset previous extraction results
      setExtractedData(null);
    }
  };

  const handleExtractText = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const response = await admissionService.extractFormData(selectedFile);
      
      if (response.success) {
        setExtractedData(response.data);
        toast({
          title: "Text extracted successfully!",
          description: `Found ${response.data.extracted_fields_count} form fields with ${response.data.confidence}% confidence.`,
        });
      } else {
        // Check if OCR is not installed
        if (response.data?.installation_required) {
          toast({
            title: "OCR Not Available",
            description: "OCR functionality requires Tesseract OCR engine to be installed on the server. Please contact the administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Extraction failed",
            description: response.message || "Failed to extract text from the image.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('OCR extraction error:', error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyData = () => {
    if (extractedData?.form_data) {
      onDataExtracted(extractedData.form_data);
      setIsOpen(false);
      toast({
        title: "Form data applied!",
        description: "The extracted data has been filled into the form fields.",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setExtractedData(null);
    setShowRawText(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload & Extract Form Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileImage className="h-6 w-6 text-blue-600" />
            </div>
            Smart Form Data Extraction
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Upload your admission form (image or document) to automatically extract and fill the form fields.
            <br />
            <span className="font-medium">Supported formats:</span> Images (JPG, PNG), Documents (PDF, DOC, DOCX, TXT) - Max 10MB
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - File Upload and Preview */}
          <div className="space-y-4">
            <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="form-image" className="text-base font-medium">Select Document</Label>
                  <div className="relative">
                    <Input
                      id="form-image"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      disabled={isProcessing}
                      className="cursor-pointer border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FileImage className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported formats: Images (JPG, PNG), Documents (PDF, DOC, DOCX)
                  </p>
                </div>

                {selectedFile && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Selected File</Label>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileImage className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-800">{selectedFile.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewUrl && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Document Preview</Label>
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <img
                        src={previewUrl}
                        alt="Document preview"
                        className="max-w-full h-auto object-contain mx-auto shadow-sm rounded"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    onClick={handleExtractText}
                    disabled={!selectedFile || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Processing Document...
                      </>
                    ) : (
                      <>
                        <FileImage className="h-5 w-5 mr-3" />
                        Extract Form Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Extraction Results */}
          <div className="space-y-4">
            {extractedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Extraction Results
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getConfidenceColor(extractedData.confidence)} text-white`}
                      >
                        {getConfidenceText(extractedData.confidence)} Confidence
                      </Badge>
                      <Badge variant="outline">
                        {extractedData.extracted_fields_count} fields
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Confidence Score</Label>
                      <span className="text-sm font-medium">{extractedData.confidence}%</span>
                    </div>
                    <Progress value={extractedData.confidence} className="h-2" />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Extracted Form Fields</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRawText(!showRawText)}
                      >
                        {showRawText ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide Raw Text
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Show Raw Text
                          </>
                        )}
                      </Button>
                    </div>

                    {showRawText ? (
                      <ScrollArea className="h-32 w-full border rounded-md p-2">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {extractedData.extracted_text}
                        </pre>
                      </ScrollArea>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {Object.entries(extractedData.form_data).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                            <Badge variant="outline" className="text-xs">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm flex-1">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleApplyData}
                      className="flex-1"
                      disabled={Object.keys(extractedData.form_data).length === 0}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply to Form
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!extractedData && selectedFile && (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Extract</h3>
                    <p className="text-gray-500">Click "Extract Form Data" to process your document</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedFile && !extractedData && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <Button
                    onClick={handleExtractText}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Processing Document...
                      </>
                    ) : (
                      <>
                        <FileImage className="h-5 w-5 mr-3" />
                        Extract Form Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!selectedFile && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select an image file to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
