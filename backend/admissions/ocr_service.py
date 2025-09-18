import pytesseract
import cv2
import numpy as np
from PIL import Image
import re
import logging
from typing import Dict, List, Optional, Tuple
from django.core.files.uploadedfile import UploadedFile
import io
import os
import fitz  # PyMuPDF for PDF processing

logger = logging.getLogger(__name__)

# Check if Tesseract is available
TESSERACT_AVAILABLE = True
try:
    # Set Tesseract path for Windows
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    pytesseract.get_tesseract_version()
except Exception as e:
    TESSERACT_AVAILABLE = False
    logger.warning(f"Tesseract OCR not available: {e}")

class OCRService:
    """Service for extracting text from admission form images using OCR"""
    
    def __init__(self):
        # Configure Tesseract for better accuracy
        self.tesseract_config = '--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-/:() '
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR accuracy"""
        try:
            # Convert PIL image to OpenCV format
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Convert back to PIL Image
            processed_image = Image.fromarray(thresh)
            
            return processed_image
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            return image  # Return original image if preprocessing fails
    
    def extract_text_from_image(self, image: Image.Image) -> str:
        """Extract text from image using OCR"""
        if not TESSERACT_AVAILABLE:
            logger.error("Tesseract OCR is not available. Please install Tesseract OCR engine.")
            return ""
            
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(
                processed_image, 
                config=self.tesseract_config,
                lang='eng'
            )
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""
    
    def extract_text_from_file(self, uploaded_file: UploadedFile) -> str:
        """Extract text from uploaded file"""
        try:
            # Get file extension
            file_extension = uploaded_file.name.lower().split('.')[-1] if '.' in uploaded_file.name else ''
            
            # Read the file content
            file_content = uploaded_file.read()
            
            # Handle PDF files
            if file_extension == 'pdf':
                return self._extract_text_from_pdf(file_content)
            
            # Handle image files
            elif file_extension in ['jpg', 'jpeg', 'png', 'tiff', 'bmp']:
                image = Image.open(io.BytesIO(file_content))
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                return self.extract_text_from_image(image)
            
            # Handle text files
            elif file_extension == 'txt':
                return file_content.decode('utf-8', errors='ignore')
            
            # Handle DOC/DOCX files (basic text extraction)
            elif file_extension in ['doc', 'docx']:
                return self._extract_text_from_doc(file_content, file_extension)
            
            # Default: try to process as image
            else:
                try:
                    image = Image.open(io.BytesIO(file_content))
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    return self.extract_text_from_image(image)
                except:
                    return ""
            
        except Exception as e:
            logger.error(f"Error extracting text from file: {str(e)}")
            return ""
    
    def _extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            text = ""
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text()
            pdf_document.close()
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""
    
    def _extract_text_from_doc(self, file_content: bytes, file_extension: str) -> str:
        """Extract text from DOC/DOCX file"""
        try:
            # For now, return a placeholder message
            # In a production environment, you'd use python-docx for DOCX files
            # and python-docx2txt or similar for DOC files
            logger.warning(f"DOC/DOCX text extraction not fully implemented for {file_extension}")
            return "Document text extraction not available for this file type. Please use PDF or image format."
        except Exception as e:
            logger.error(f"Error extracting text from DOC: {str(e)}")
            return ""
    
    def parse_admission_form_data(self, extracted_text: str) -> Dict[str, str]:
        """Parse extracted text and map to admission form fields"""
        form_data = {}
        
        # Convert text to lowercase for pattern matching
        text_lower = extracted_text.lower()
        
        # Define patterns for different fields
        patterns = {
            'applicant_name': [
                r'name[:\s]*([a-zA-Z\s]+)',
                r'student\s+name[:\s]*([a-zA-Z\s]+)',
                r'full\s+name[:\s]*([a-zA-Z\s]+)',
                r'candidate\s+name[:\s]*([a-zA-Z\s]+)',
                r'^([A-Z][a-z]+\s+[A-Z][a-z]+)$',  # Standalone names like "Sam Altman"
                r'^([A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+)$',  # Three word names
            ],
            'date_of_birth': [
                r'date\s+of\s+birth[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
                r'dob[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
                r'birth\s+date[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
                r'born[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            ],
            'email': [
                r'email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
                r'e-mail[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
                r'email\s+id[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            ],
            'phone_number': [
                r'phone[:\s]*(\d{10,15})',
                r'mobile[:\s]*(\d{10,15})',
                r'contact[:\s]*(\d{10,15})',
                r'phone\s+number[:\s]*(\d{10,15})',
                r'mobile\s+number[:\s]*(\d{10,15})',
            ],
            'address': [
                r'address[:\s]*([^\n]+(?:\n[^\n]+)*)',
                r'residential\s+address[:\s]*([^\n]+(?:\n[^\n]+)*)',
                r'permanent\s+address[:\s]*([^\n]+(?:\n[^\n]+)*)',
            ],
            'course_applied': [
                r'course[:\s]*([a-zA-Z0-9\s\-]+)',
                r'class[:\s]*([a-zA-Z0-9\s\-]+)',
                r'grade[:\s]*([a-zA-Z0-9\s\-]+)',
                r'standard[:\s]*([a-zA-Z0-9\s\-]+)',
                r'applying\s+for[:\s]*([a-zA-Z0-9\s\-]+)',
            ],
            'previous_school': [
                r'previous\s+school[:\s]*([a-zA-Z0-9\s\-\.]+)',
                r'last\s+school[:\s]*([a-zA-Z0-9\s\-\.]+)',
                r'former\s+school[:\s]*([a-zA-Z0-9\s\-\.]+)',
                r'school\s+name[:\s]*([a-zA-Z0-9\s\-\.]+)',
            ],
            'last_percentage': [
                r'percentage[:\s]*(\d+\.?\d*)',
                r'marks[:\s]*(\d+\.?\d*)',
                r'grade[:\s]*(\d+\.?\d*)',
                r'score[:\s]*(\d+\.?\d*)',
                r'result[:\s]*(\d+\.?\d*)',
            ],
            'guardian_name': [
                r'guardian[:\s]*([a-zA-Z\s]+)',
                r'father[:\s]*([a-zA-Z\s]+)',
                r'mother[:\s]*([a-zA-Z\s]+)',
                r'parent[:\s]*([a-zA-Z\s]+)',
            ],
            'parent_contact': [
                r'parent\s+contact[:\s]*(\d{10,15})',
                r'guardian\s+contact[:\s]*(\d{10,15})',
                r'father\s+contact[:\s]*(\d{10,15})',
                r'mother\s+contact[:\s]*(\d{10,15})',
            ]
        }
        
        # Extract data using patterns
        for field, field_patterns in patterns.items():
            for pattern in field_patterns:
                match = re.search(pattern, text_lower, re.IGNORECASE | re.MULTILINE)
                if match:
                    value = match.group(1).strip()
                    # Clean up the extracted value
                    value = re.sub(r'\s+', ' ', value)  # Replace multiple spaces with single space
                    form_data[field] = value
                    logger.info(f"Extracted {field}: {value}")
                    break  # Use first match found
        
        logger.info(f"Final extracted form data: {form_data}")
        
        # Additional processing for specific fields
        if 'date_of_birth' in form_data:
            form_data['date_of_birth'] = self._normalize_date(form_data['date_of_birth'])
        
        if 'phone_number' in form_data:
            form_data['phone_number'] = self._normalize_phone(form_data['phone_number'])
        
        if 'last_percentage' in form_data:
            form_data['last_percentage'] = self._normalize_percentage(form_data['last_percentage'])
        
        return form_data
    
    def _normalize_date(self, date_str: str) -> str:
        """Normalize date format to YYYY-MM-DD"""
        try:
            # Remove extra spaces and characters
            date_str = re.sub(r'[^\d\/\-\.]', '', date_str)
            
            # Try different date formats
            date_formats = [
                '%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y',
                '%m/%d/%Y', '%m-%d-%Y', '%m.%d.%Y',
                '%d/%m/%y', '%d-%m-%y', '%d.%m.%y',
                '%m/%d/%y', '%m-%d-%y', '%m.%d.%y',
            ]
            
            from datetime import datetime
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_str, fmt)
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    continue
            
            return date_str  # Return original if parsing fails
            
        except Exception:
            return date_str
    
    def _normalize_phone(self, phone_str: str) -> str:
        """Normalize phone number format"""
        try:
            # Remove all non-digit characters
            digits_only = re.sub(r'\D', '', phone_str)
            
            # Handle different phone number lengths
            if len(digits_only) == 10:
                return digits_only
            elif len(digits_only) == 11 and digits_only.startswith('0'):
                return digits_only[1:]  # Remove leading 0
            elif len(digits_only) == 12 and digits_only.startswith('91'):
                return digits_only[2:]  # Remove country code
            else:
                return digits_only
                
        except Exception:
            return phone_str
    
    def _normalize_percentage(self, percentage_str: str) -> str:
        """Normalize percentage value"""
        try:
            # Extract numeric value
            numeric_value = re.search(r'(\d+\.?\d*)', percentage_str)
            if numeric_value:
                value = float(numeric_value.group(1))
                # Ensure percentage is between 0 and 100
                if value > 100:
                    value = value / 10  # Handle cases where percentage is written as 850 instead of 85.0
                return str(value)
            return percentage_str
        except Exception:
            return percentage_str
    
    def extract_and_parse_form(self, uploaded_file: UploadedFile) -> Dict[str, any]:
        """Main method to extract text and parse admission form data"""
        if not TESSERACT_AVAILABLE:
            return {
                'success': False,
                'message': 'OCR functionality is not available. Tesseract OCR engine is not installed. Please install Tesseract OCR to use this feature.',
                'extracted_text': '',
                'form_data': {},
                'installation_required': True
            }
            
        try:
            # Extract text from image
            extracted_text = self.extract_text_from_file(uploaded_file)
            
            if not extracted_text:
                return {
                    'success': False,
                    'message': 'No text could be extracted from the image. Please ensure the image is clear and contains readable text.',
                    'extracted_text': '',
                    'form_data': {}
                }
            
            # Parse the extracted text
            form_data = self.parse_admission_form_data(extracted_text)
            
            return {
                'success': True,
                'message': f'Successfully extracted {len(form_data)} fields from the form',
                'extracted_text': extracted_text,
                'form_data': form_data,
                'confidence': self._calculate_confidence(form_data)
            }
            
        except Exception as e:
            logger.error(f"Error in extract_and_parse_form: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing form: {str(e)}',
                'extracted_text': '',
                'form_data': {}
            }
    
    def _calculate_confidence(self, form_data: Dict[str, str]) -> float:
        """Calculate confidence score based on extracted fields"""
        if not form_data:
            return 0.0
        
        # Weight different fields based on importance
        field_weights = {
            'applicant_name': 0.25,
            'date_of_birth': 0.20,
            'email': 0.15,
            'phone_number': 0.15,
            'address': 0.10,
            'course_applied': 0.10,
            'previous_school': 0.05,
        }
        
        total_weight = 0.0
        weighted_score = 0.0
        
        for field, weight in field_weights.items():
            total_weight += weight
            if field in form_data and form_data[field]:
                weighted_score += weight
        
        if total_weight == 0:
            return 0.0
        
        return round((weighted_score / total_weight) * 100, 2)
