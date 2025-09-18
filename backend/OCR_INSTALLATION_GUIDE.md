# OCR Installation Guide

This guide explains how to install Tesseract OCR engine to enable the OCR functionality in the Acharya School Management System.

## What is OCR?

Optical Character Recognition (OCR) allows the system to automatically extract text from images of admission forms, making it easier for the admission department to process applications without manual data entry.

## Installation Instructions

### Windows

1. **Download Tesseract OCR:**
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download the latest Windows installer (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)

2. **Install Tesseract:**
   - Run the downloaded installer
   - Follow the installation wizard
   - **Important:** Note the installation path (usually `C:\Program Files\Tesseract-OCR\`)

3. **Add to PATH (if not done automatically):**
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\Tesseract-OCR\` to your PATH variable
   - Or set the path in your Django settings

4. **Verify Installation:**
   ```bash
   tesseract --version
   ```

### macOS

1. **Using Homebrew (Recommended):**
   ```bash
   brew install tesseract
   ```

2. **Using MacPorts:**
   ```bash
   sudo port install tesseract4
   ```

3. **Verify Installation:**
   ```bash
   tesseract --version
   ```

### Linux (Ubuntu/Debian)

1. **Install Tesseract:**
   ```bash
   sudo apt update
   sudo apt install tesseract-ocr
   ```

2. **Install additional language packs (optional):**
   ```bash
   sudo apt install tesseract-ocr-eng tesseract-ocr-hin
   ```

3. **Verify Installation:**
   ```bash
   tesseract --version
   ```

### Linux (CentOS/RHEL/Fedora)

1. **For CentOS/RHEL:**
   ```bash
   sudo yum install tesseract
   ```

2. **For Fedora:**
   ```bash
   sudo dnf install tesseract
   ```

3. **Verify Installation:**
   ```bash
   tesseract --version
   ```

## Django Configuration

If Tesseract is not in your system PATH, you can specify the path in your Django settings:

```python
# In your settings.py or .env file
TESSERACT_CMD = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows
# TESSERACT_CMD = '/usr/bin/tesseract'  # Linux/macOS
```

Then update the OCR service to use this path:

```python
# In ocr_service.py
import os
from django.conf import settings

# Set Tesseract path if specified in settings
if hasattr(settings, 'TESSERACT_CMD'):
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
```

## Testing the Installation

After installation, you can test the OCR functionality:

1. **Run the test script:**
   ```bash
   cd backend
   uv run python test_ocr.py
   ```

2. **Test via API:**
   - Start the Django server: `uv run python manage.py runserver`
   - Use the OCR endpoint: `POST /api/v1/admissions/ocr-extract/`
   - Upload an image file with form data

## Troubleshooting

### Common Issues

1. **"tesseract is not installed or it's not in your PATH"**
   - Ensure Tesseract is installed correctly
   - Check if the executable is in your system PATH
   - Try specifying the full path in Django settings

2. **"No text could be extracted from the image"**
   - Ensure the image is clear and high quality
   - Check if the text is readable
   - Try different image formats (PNG, JPEG)

3. **Poor OCR accuracy**
   - Use high-resolution images
   - Ensure good contrast between text and background
   - Avoid skewed or rotated images
   - Use clear, printed text rather than handwritten text

### Performance Tips

1. **Image Quality:**
   - Use images with at least 300 DPI resolution
   - Ensure good lighting and contrast
   - Avoid shadows and reflections

2. **Text Format:**
   - Use clear, printed fonts
   - Avoid handwritten text when possible
   - Ensure text is not too small or too large

3. **Form Layout:**
   - Use consistent form layouts
   - Label fields clearly
   - Avoid overlapping text or complex layouts

## Supported File Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- TIFF (.tiff, .tif)
- BMP (.bmp)

## File Size Limits

- Maximum file size: 10MB
- Recommended size: 1-5MB for optimal processing speed

## Language Support

Currently supports English text extraction. For other languages:

1. Install additional language packs for Tesseract
2. Update the OCR service configuration
3. Modify the language parameter in the OCR service

## Security Considerations

- All uploaded images are processed locally
- No data is sent to external OCR services
- Images are not stored permanently (only processed)
- File type and size validation is enforced

## Support

If you encounter issues with OCR functionality:

1. Check the Django logs for error messages
2. Verify Tesseract installation
3. Test with a simple, clear image first
4. Contact the development team for assistance

---

**Note:** OCR accuracy depends on image quality and text clarity. For best results, use high-quality images with clear, printed text.

