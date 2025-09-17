# Category-Based Fee System Implementation

## Overview
The Acharya system now includes a comprehensive category-based fee system that calculates fees based on student's class and category (General/SC/ST/OBC/SBC). This document outlines the implementation of the fee structure and payment workflow.

## Fee Structure

### Categories
- **General**: General category students
- **SC**: Scheduled Caste
- **ST**: Scheduled Tribe
- **OBC**: Other Backward Class
- **SBC**: Special Backward Class

### Fee Structure by Class and Category

| Class Range | Category | Annual Fee |
|-------------|----------|------------|
| 1-8 | All Categories | ₹0 (Free) |
| 9-10 | General | ₹200 - ₹600 |
| 9-10 | SC/ST/OBC/SBC | ₹100 |
| 11-12 | General | ₹300 - ₹1200 |
| 11-12 | SC/ST/OBC/SBC | ₹150 |

## Implementation Details

### Backend Changes

#### 1. Model Updates
- **AdmissionApplication Model**: Added `category` field to track student's category
- **FeeStructure Model**: New model to store fee structure based on class and category

```python
class AdmissionApplication(models.Model):
    # ... existing fields ...
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')

class FeeStructure(models.Model):
    class_range = models.CharField(max_length=10, choices=CLASS_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    annual_fee_min = models.DecimalField(max_digits=10, decimal_places=2)
    annual_fee_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
```

#### 2. API Endpoints

##### Fee Calculation API
- **Endpoint**: `POST /api/admissions/fee-calculation/`
- **Purpose**: Calculate fee based on student's course and category
- **Request**: `{ "reference_id": "ADM-2025-ABC123" }`
- **Response**: Fee structure details with calculated fee

#### 3. Fee Calculation Logic
The system automatically maps courses to class ranges and determines appropriate fee structure:

```python
@classmethod
def get_fee_for_student(cls, course_applied, category):
    # Map course to class range
    class_mapping = {
        '1': '1-8', '2': '1-8', ..., '8': '1-8',
        '9': '9-10', '10': '9-10',
        '11': '11-12', '12': '11-12'
    }
    
    # Map student category to fee category
    fee_category = 'general' if category == 'general' else 'sc_st_obc_sbc'
    
    return FeeStructure.objects.get(class_range=class_range, category=fee_category)
```

### Frontend Changes

#### 1. Admission Form Updates
- Added category dropdown in admission form
- Category selection is mandatory for all applications
- Category options: General, SC, ST, OBC, SBC

#### 2. Tracking Page Enhancements
- **Accept & Proceed Button**: Shows for each accepted school
- **Fee Calculation**: Automatic fee calculation based on student's category
- **Payment Modal**: Enhanced to show category-based fee structure
- **Free Education**: Special handling for ₹0 fees with "Confirm Free Enrollment" button

#### 3. Payment Workflow
1. Student gets accepted by one or more schools
2. "Accept & Proceed" button appears for each accepted school
3. Click triggers fee calculation API call
4. Payment modal shows:
   - School details
   - Category and class information
   - Calculated fee amount
   - Payment methods (if fee > 0) or enrollment confirmation (if fee = 0)

### API Services Updates

#### New Service Method
```typescript
// Calculate fee based on student's course and category
calculateFee: (data: { reference_id: string }): Promise<ApiResponse<any>> =>
  api.post('admissions/fee-calculation/', data),
```

## Workflow

### 1. Admission Application
1. Student fills admission form
2. Selects category (General/SC/ST/OBC/SBC)
3. Category is stored with application

### 2. School Review & Decision
1. Schools review applications
2. Accept/reject students as usual
3. No changes to existing workflow

### 3. Student Acceptance & Payment
1. Student tracks application using reference ID
2. If accepted, "Accept & Proceed" button appears for each school
3. Student clicks button for preferred school
4. System calculates fee based on:
   - Course applied (determines class range)
   - Student's category
5. Payment modal opens with:
   - Fee details
   - Payment options (if fee > 0)
   - Free enrollment confirmation (if fee = 0)

### 4. Payment Processing
- **Paid Courses**: Redirect to payment gateway
- **Free Courses**: Immediate enrollment confirmation
- **SC/ST/OBC/SBC**: Reduced fees or free (Classes 1-8)

## Database Migrations

```bash
# Create and apply migrations
python manage.py makemigrations admissions
python manage.py migrate

# Populate fee structure data
python manage.py shell -c "
from admissions.models import FeeStructure
from decimal import Decimal

fee_data = [
    ('1-8', 'general', 0, 0),
    ('1-8', 'sc_st_obc_sbc', 0, 0),
    ('9-10', 'general', 200, 600),
    ('9-10', 'sc_st_obc_sbc', 100, 100),
    ('11-12', 'general', 300, 1200),
    ('11-12', 'sc_st_obc_sbc', 150, 150),
]

for class_range, category, min_fee, max_fee in fee_data:
    FeeStructure.objects.get_or_create(
        class_range=class_range,
        category=category,
        defaults={
            'annual_fee_min': Decimal(str(min_fee)),
            'annual_fee_max': Decimal(str(max_fee)) if max_fee != min_fee else None
        }
    )
"
```

## Benefits

### 1. Automated Fee Calculation
- No manual fee calculation required
- Consistent fee structure across all schools
- Automatic application of category-based discounts

### 2. Transparent Process
- Students see exact fee before payment
- Clear category-based pricing
- Free education clearly indicated

### 3. Compliance
- Follows government fee structure guidelines
- Proper categorization for SC/ST/OBC/SBC students
- Audit trail for fee calculations

### 4. User Experience
- Seamless payment workflow
- Clear fee breakdown
- Immediate enrollment for free categories

## Testing

### Test Cases
1. **General Category Students**: Verify correct fee calculation for classes 9-12
2. **SC/ST/OBC/SBC Students**: Verify reduced fees for classes 9-12
3. **Classes 1-8**: Verify free education for all categories
4. **Payment Flow**: Test payment modal and workflows
5. **Free Enrollment**: Test immediate enrollment for ₹0 fees

### Test Data
```python
# Test fee calculations
test_cases = [
    ("class-5", "general", 0),      # Free for classes 1-8
    ("class-9", "general", 200),    # General category class 9
    ("class-9", "sc", 100),         # SC category class 9
    ("class-11", "general", 300),   # General category class 11
    ("class-11", "obc", 150),       # OBC category class 11
]
```

## Future Enhancements

1. **Dynamic Fee Structures**: Admin interface to modify fees
2. **Scholarship Integration**: Additional discounts/scholarships
3. **Payment Gateway Integration**: Real payment processing
4. **Receipt Generation**: Automated fee receipts
5. **Refund Processing**: Handle fee refunds if needed

## Conclusion

The category-based fee system provides a comprehensive solution for handling diverse fee structures while maintaining transparency and compliance with educational policies. The system automatically calculates appropriate fees and provides a seamless payment experience for all student categories.