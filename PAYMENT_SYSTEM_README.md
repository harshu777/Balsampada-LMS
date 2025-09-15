# Cash Payment Approval Workflow System

## Overview

This comprehensive cash payment approval workflow system has been implemented for the Tuition LMS. It handles cash payments with admin approval for both student enrollment and monthly fees.

## Features

### Core Features
1. **Payment Initiation**: Students can initiate cash payment requests
2. **Proof Upload**: Students upload payment proof (receipt, photo of payment)
3. **Admin Approval**: Admins review and approve/reject payments
4. **Payment History**: Track payment history for each student
5. **Digital Receipts**: Generate digital receipts for approved payments
6. **Notifications**: Payment status update notifications
7. **Monthly Fee Tracking**: Track monthly fees and send reminders
8. **Payment Statistics**: Payment reporting and analytics

### Payment Types
- Enrollment Fee
- Monthly Fee
- Exam Fee
- Material Fee
- Other

### Payment Methods
- Cash
- Bank Transfer
- Cheque
- Online
- Other

### Payment Status
- Pending (awaiting admin approval)
- Approved (payment confirmed)
- Rejected (payment declined with reason)
- Partial (partial payment received)

## File Structure

### Backend Files Created
```
/backend/src/payments/
├── payments.module.ts          # NestJS module configuration
├── payments.controller.ts      # REST API endpoints
├── payments.service.ts         # Business logic
└── dto/
    ├── index.ts               # DTO exports
    ├── create-payment.dto.ts  # Payment creation validation
    └── update-payment.dto.ts  # Payment update validation

/backend/prisma/
├── schema.prisma              # Updated database schema
└── migrations/
    └── 20250906000000_enhanced_payment_workflow/
        └── migration.sql      # Database migration

/backend/uploads/
└── payment-proofs/            # Payment proof file storage
```

### Frontend Files Created
```
/frontend/src/services/
└── payment.service.ts         # Payment API service

/frontend/src/app/admin/payments/
└── page.tsx                   # Admin payment management page

/frontend/src/app/student/payments/
└── page.tsx                   # Student payment submission page
```

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
The required dependencies should already be installed, but ensure these are in your `package.json`:
```bash
npm install @nestjs/platform-express multer @types/multer
```

#### Database Migration
Run the database migration to update the schema:
```bash
cd backend
npx prisma db push
# or
npx prisma migrate deploy
```

#### File Upload Directory
Ensure the upload directory exists:
```bash
mkdir -p uploads/payment-proofs
```

### 2. Frontend Setup

No additional dependencies are required for the frontend as it uses existing packages.

### 3. Environment Configuration

Ensure your backend `.env` file has the following:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tuition_lms?schema=public"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB
```

## API Endpoints

### Student Endpoints

#### Submit Monthly Payment
```http
POST /api/payments/student/monthly
Content-Type: multipart/form-data

Form Data:
- amount: number (required)
- method: PaymentMethod (required)
- monthYear: string (YYYY-MM format)
- academicYear: string
- description: string (optional)
- notes: string (optional)
- proofFile: File (required)
```

#### Get Payment History
```http
GET /api/payments/student/history?page=1&limit=10&status=PENDING
```

### Admin Endpoints

#### Get All Payments
```http
GET /api/payments?page=1&limit=20&status=PENDING&type=MONTHLY_FEE
```

#### Get Pending Payments
```http
GET /api/payments/admin/pending
```

#### Approve Payment
```http
POST /api/payments/{id}/approve
Content-Type: application/json

{
  "notes": "Payment verified and approved",
  "receiptNumber": "RCP202409001"
}
```

#### Reject Payment
```http
POST /api/payments/{id}/reject
Content-Type: application/json

{
  "rejectionReason": "Invalid payment proof",
  "notes": "Please provide a clearer image of the receipt"
}
```

#### Bulk Actions
```http
POST /api/payments/admin/bulk-approve
POST /api/payments/admin/bulk-reject
Content-Type: application/json

{
  "paymentIds": ["id1", "id2", "id3"],
  "notes": "Bulk processing notes",
  "rejectionReason": "Required for bulk reject"
}
```

#### Payment Statistics
```http
GET /api/payments/statistics?academicYear=2024-2025&monthYear=2024-09
```

#### Overdue Payments
```http
GET /api/payments/overdue
```

### General Endpoints

#### Get Payment Details
```http
GET /api/payments/{id}
```

#### Download Payment Proof
```http
GET /api/payments/{id}/proof
```

#### Generate Receipt
```http
GET /api/payments/{id}/receipt
```

## Usage Guide

### For Students

1. **Navigate to Payments**: Go to `/student/payments`
2. **View Payment History**: See all previous payments with status indicators
3. **Submit New Payment**: 
   - Click "Submit Payment"
   - Fill in payment details (amount, method, month/year)
   - Upload payment proof (image or PDF)
   - Submit for admin review
4. **Track Status**: Monitor payment approval status
5. **Download Receipts**: Download approved payment receipts

### For Admins

1. **Navigate to Payment Management**: Go to `/admin/payments`
2. **View Dashboard**: See payment statistics and overview
3. **Filter Payments**: Use filters to find specific payments
4. **Review Payments**:
   - View payment details
   - Download payment proofs
   - Approve or reject with comments
5. **Bulk Actions**: Process multiple payments simultaneously
6. **Generate Reports**: View payment statistics and trends

## Payment Workflow

1. **Student Submits Payment**:
   - Student fills payment form
   - Uploads payment proof
   - Payment status: PENDING

2. **Admin Reviews**:
   - Admin receives notification
   - Reviews payment details and proof
   - Makes approval decision

3. **Payment Approved**:
   - Status changes to APPROVED
   - Receipt number generated
   - Student receives notification
   - For enrollment fees: student enrollment activated

4. **Payment Rejected**:
   - Status changes to REJECTED
   - Rejection reason provided
   - Student receives notification with reason

## Security Features

- **File Validation**: Only images and PDFs allowed (max 5MB)
- **Role-based Access**: Students can only see their own payments
- **Input Validation**: All inputs validated using DTOs
- **Authentication Required**: All endpoints require valid JWT tokens
- **File Storage**: Secure file storage with unique naming

## Notification System

The system automatically creates notifications for:
- Payment submission (to admins)
- Payment approval (to student)
- Payment rejection (to student)

## Database Schema Updates

### New Enums
- `PaymentType`: ENROLLMENT_FEE, MONTHLY_FEE, EXAM_FEE, MATERIAL_FEE, OTHER
- `PaymentMethod`: CASH, BANK_TRANSFER, CHEQUE, ONLINE, OTHER

### Enhanced Payment Model
- Added payment type and method tracking
- Added proof file storage
- Added monthly fee tracking with monthYear field
- Added rejection reason field
- Added academic year tracking
- Made enrollment optional for non-enrollment payments
- Added indexes for better query performance

## Troubleshooting

### Common Issues

1. **File Upload Fails**:
   - Check file size (max 5MB)
   - Ensure file type is supported (JPG, PNG, PDF)
   - Verify upload directory exists and has write permissions

2. **Database Migration Issues**:
   - Ensure PostgreSQL is running
   - Run `npx prisma db push` or `npx prisma migrate deploy`
   - Check database connection string in `.env`

3. **Permission Denied**:
   - Verify JWT token is valid
   - Check user role permissions
   - Ensure user is authenticated

### Development Tips

1. **Testing File Uploads**:
   - Use tools like Postman for API testing
   - Test with various file types and sizes
   - Verify file storage and retrieval

2. **Database Queries**:
   - Use Prisma Studio to view data: `npx prisma studio`
   - Check query performance with database indexes
   - Monitor payment statistics accuracy

3. **Frontend Testing**:
   - Test responsive design on various screen sizes
   - Verify form validation works correctly
   - Test modal interactions and file uploads

## Future Enhancements

1. **PDF Receipt Generation**: Implement actual PDF generation for receipts
2. **Email Notifications**: Send email notifications for payment updates
3. **Payment Reminders**: Automated reminders for due payments
4. **Advanced Reporting**: More detailed analytics and reporting
5. **Payment Integration**: Integration with payment gateways for online payments
6. **Bulk Import**: CSV import for multiple payments
7. **Payment Plans**: Support for installment payments

## Support

For technical support or questions about the payment system, please refer to the main project documentation or contact the development team.