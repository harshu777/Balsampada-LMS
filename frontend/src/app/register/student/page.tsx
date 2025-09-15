'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Upload,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import authService from '@/services/auth.service';
import documentService from '@/services/document.service';
import { DocumentUpload, UploadedFile } from '@/components/documents/DocumentUpload';

interface FormData {
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  
  // Class & Subject Selection
  selectedClass: string;
  selectedSubjects: string[];
  
  // Documents
  documents: {
    idProof: UploadedFile[];
    photo: UploadedFile[];
    previousMarksheet: UploadedFile[];
  };
  
  // Payment
  paymentMethod: string;
  transactionId: string;
}

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Class & Subjects', icon: BookOpen },
  { id: 3, title: 'Documents Upload', icon: Upload },
  { id: 4, title: 'Payment & Review', icon: FileText },
];

const CLASSES = [
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11 Science', 'Grade 11 Commerce', 'Grade 11 Arts',
  'Grade 12 Science', 'Grade 12 Commerce', 'Grade 12 Arts'
];

const SUBJECTS = {
  'Grade 6': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  'Grade 7': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  'Grade 8': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  'Grade 9': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  'Grade 10': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  'Grade 11 Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
  'Grade 11 Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
  'Grade 11 Arts': ['History', 'Political Science', 'Economics', 'Psychology', 'English', 'Sociology'],
  'Grade 12 Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
  'Grade 12 Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
  'Grade 12 Arts': ['History', 'Political Science', 'Economics', 'Psychology', 'English', 'Sociology'],
};

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    selectedClass: '',
    selectedSubjects: [],
    documents: {
      idProof: [],
      photo: [],
      previousMarksheet: [],
    },
    paymentMethod: 'cash',
    transactionId: '',
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      
      case 2:
        if (!formData.selectedClass) newErrors.selectedClass = 'Please select a class';
        if (formData.selectedSubjects.length === 0) {
          newErrors.selectedSubjects = 'Please select at least one subject';
        }
        break;
      
      case 3:
        if (formData.documents.idProof.length === 0) newErrors.idProof = 'ID proof is required';
        if (formData.documents.photo.length === 0) newErrors.photo = 'Photo is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedClass,
      selectedSubjects: [] // Reset subjects when class changes
    }));
    if (errors.selectedClass) {
      setErrors(prev => ({ ...prev, selectedClass: '' }));
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
    if (errors.selectedSubjects) {
      setErrors(prev => ({ ...prev, selectedSubjects: '' }));
    }
  };

  const handleDocumentUpload = (files: UploadedFile[], docType: keyof typeof formData.documents) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: files
      }
    }));
    if (errors[docType]) {
      setErrors(prev => ({ ...prev, [docType]: '' }));
    }
  };

  const uploadDocuments = async (userId: string, token: string): Promise<void> => {
    const uploadPromises: Promise<any>[] = [];
    
    // Upload ID proof
    if (formData.documents.idProof.length > 0) {
      for (const uploadedFile of formData.documents.idProof) {
        uploadPromises.push(
          documentService.uploadDocument(uploadedFile.file, 'id_proof', 'Identity proof document', token)
        );
      }
    }
    
    // Upload photo
    if (formData.documents.photo.length > 0) {
      for (const uploadedFile of formData.documents.photo) {
        uploadPromises.push(
          documentService.uploadDocument(uploadedFile.file, 'photo', 'Passport size photo', token)
        );
      }
    }
    
    // Upload previous marksheet (optional)
    if (formData.documents.previousMarksheet.length > 0) {
      for (const uploadedFile of formData.documents.previousMarksheet) {
        uploadPromises.push(
          documentService.uploadDocument(uploadedFile.file, 'marksheet', 'Previous academic records', token)
        );
      }
    }
    
    await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        role: 'STUDENT'
      });

      // Store tokens in localStorage for document upload
      if (response.accessToken && response.refreshToken) {
        console.log('Registration successful, storing tokens...');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Small delay to ensure localStorage is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Upload documents after successful user registration
        if (formData.documents.idProof.length > 0 || 
            formData.documents.photo.length > 0 || 
            formData.documents.previousMarksheet.length > 0) {
          console.log('Uploading documents with token:', response.accessToken.substring(0, 20) + '...');
          try {
            await uploadDocuments(response.user.id, response.accessToken);
            console.log('Documents uploaded successfully');
          } catch (uploadError) {
            console.error('Document upload failed:', uploadError);
            // Continue with registration success even if document upload fails
            // Documents can be uploaded later
          }
        }
      } else {
        console.error('No tokens received from registration');
      }

      setRegistrationSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.firstName ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && <p className="mt-1 text-sm text-danger">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.lastName ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="mt-1 text-sm text-danger">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.email ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.phone ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="1234567890"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                    errors.address ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="Enter your full address"
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-danger">{errors.address}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.password ? 'border-danger' : 'border-neutral-300'
                    }`}
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.confirmPassword ? 'border-danger' : 'border-neutral-300'
                    }`}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-danger">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Class *
              </label>
              <select
                value={formData.selectedClass}
                onChange={handleClassChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.selectedClass ? 'border-danger' : 'border-neutral-300'
                }`}
              >
                <option value="">-- Select Class --</option>
                {CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.selectedClass && <p className="mt-1 text-sm text-danger">{errors.selectedClass}</p>}
            </div>

            {formData.selectedClass && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-4">
                  Select Subjects * (Choose one or more)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {SUBJECTS[formData.selectedClass as keyof typeof SUBJECTS]?.map(subject => (
                    <label
                      key={subject}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.selectedSubjects.includes(subject)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-neutral-300 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedSubjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{subject}</span>
                        {formData.selectedSubjects.includes(subject) && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.selectedSubjects && <p className="mt-2 text-sm text-danger">{errors.selectedSubjects}</p>}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-neutral-600 mb-6">
              Please upload the required documents. Files should be in PDF, JPG, PNG, DOC, or DOCX format (max 5MB each).
            </p>

            <DocumentUpload
              label="ID Proof (Aadhar/Birth Certificate)"
              description="Upload a clear copy of your identity proof document"
              required={true}
              maxFiles={1}
              allowedTypes={['PDF', 'JPG', 'PNG']}
              onFilesChange={(files) => handleDocumentUpload(files, 'idProof')}
              error={errors.idProof}
              showPreview={true}
            />

            <DocumentUpload
              label="Passport Size Photo"
              description="Upload a recent passport size photograph"
              required={true}
              maxFiles={1}
              accept="image/*"
              allowedTypes={['JPG', 'PNG']}
              maxSize={2}
              onFilesChange={(files) => handleDocumentUpload(files, 'photo')}
              error={errors.photo}
              showPreview={true}
            />

            <DocumentUpload
              label="Previous Year Marksheet"
              description="Upload your previous academic records (optional)"
              required={false}
              maxFiles={1}
              allowedTypes={['PDF', 'JPG', 'PNG']}
              onFilesChange={(files) => handleDocumentUpload(files, 'previousMarksheet')}
              showPreview={true}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {registrationSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-neutral-600 mb-4">
                  Your registration has been submitted. Please wait for admin approval.
                </p>
                <p className="text-sm text-neutral-500">
                  Redirecting to login page...
                </p>
              </div>
            ) : (
              <>
                <div className="bg-neutral-50 rounded-lg p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Review Your Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-neutral-600">Name:</span>
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Email:</span>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Phone:</span>
                      <p className="font-medium">{formData.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Class:</span>
                      <p className="font-medium">{formData.selectedClass}</p>
                    </div>
                    <div>
                      <span className="text-sm text-neutral-600">Subjects:</span>
                      <p className="font-medium">{formData.selectedSubjects.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 mb-4">Payment Information</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Cash Payment Instructions:</strong>
                        </p>
                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                          <li>• Submit your registration form first</li>
                          <li>• Pay fees directly at the institute</li>
                          <li>• Your account will be activated after payment verification</li>
                          <li>• Keep the receipt for future reference</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {apiError && (
                  <div className="bg-danger/10 border border-danger text-danger rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{apiError}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-neutral-600">
                    I agree to the Terms of Service and Privacy Policy. I understand that my account
                    will be activated after document verification and fee payment.
                  </label>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-6">
            <div className="bg-primary rounded-lg p-2">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">
              Tuition <span className="text-primary">LMS</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Student Registration</h1>
          <p className="text-neutral-600">Join our learning community and excel in your studies</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep > step.id
                        ? 'bg-success text-white'
                        : currentStep === step.id
                        ? 'bg-primary text-white'
                        : 'bg-neutral-200 text-neutral-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        currentStep > step.id ? 'bg-success' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
                <p className="mt-2 text-xs text-neutral-600 font-medium">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {!registrationSuccess && (
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Next
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="ml-auto flex items-center gap-2 px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <Check className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="text-center mt-6">
          <p className="text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}