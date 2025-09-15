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
  GraduationCap,
  Upload,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Award,
  Calendar,
  BookOpen
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
  
  // Professional Details
  qualification: string;
  experience: string;
  specialization: string[];
  teachingMode: string[];
  bio: string;
  
  // Documents
  documents: {
    resume: UploadedFile[];
    idProof: UploadedFile[];
    photo: UploadedFile[];
    certificates: UploadedFile[];
  };
}

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Professional Info', icon: Briefcase },
  { id: 3, title: 'Documents Upload', icon: Upload },
  { id: 4, title: 'Review & Submit', icon: FileText },
];

const QUALIFICATIONS = [
  'Bachelor of Science (B.Sc)',
  'Master of Science (M.Sc)',
  'Bachelor of Arts (B.A)',
  'Master of Arts (M.A)',
  'Bachelor of Education (B.Ed)',
  'Master of Education (M.Ed)',
  'Bachelor of Technology (B.Tech)',
  'Master of Technology (M.Tech)',
  'PhD',
  'Other'
];

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Computer Science',
  'Social Studies',
  'History',
  'Geography',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Political Science',
  'Psychology',
  'Sociology'
];

const TEACHING_MODES = [
  'Online Classes',
  'Offline Classes',
  'Both Online & Offline'
];

export default function TeacherRegistrationPage() {
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
    qualification: '',
    experience: '',
    specialization: [],
    teachingMode: [],
    bio: '',
    documents: {
      resume: [],
      idProof: [],
      photo: [],
      certificates: [],
    },
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
        if (!formData.qualification) newErrors.qualification = 'Qualification is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        if (formData.specialization.length === 0) {
          newErrors.specialization = 'Please select at least one subject';
        }
        if (formData.teachingMode.length === 0) {
          newErrors.teachingMode = 'Please select teaching mode';
        }
        if (!formData.bio.trim()) {
          newErrors.bio = 'Brief bio is required';
        } else if (formData.bio.trim().length < 50) {
          newErrors.bio = 'Bio must be at least 50 characters';
        }
        break;
      
      case 3:
        if (formData.documents.resume.length === 0) newErrors.resume = 'Resume is required';
        if (formData.documents.idProof.length === 0) newErrors.idProof = 'ID proof is required';
        if (formData.documents.photo.length === 0) newErrors.photo = 'Photo is required';
        if (formData.documents.certificates.length === 0) newErrors.certificates = 'Educational certificates are required';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecializationToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(subject)
        ? prev.specialization.filter(s => s !== subject)
        : [...prev.specialization, subject]
    }));
    if (errors.specialization) {
      setErrors(prev => ({ ...prev, specialization: '' }));
    }
  };

  const handleTeachingModeToggle = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      teachingMode: prev.teachingMode.includes(mode)
        ? prev.teachingMode.filter(m => m !== mode)
        : [...prev.teachingMode, mode]
    }));
    if (errors.teachingMode) {
      setErrors(prev => ({ ...prev, teachingMode: '' }));
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
    
    // Upload resume
    if (formData.documents.resume.length > 0) {
      for (const uploadedFile of formData.documents.resume) {
        uploadPromises.push(
          documentService.uploadDocument(uploadedFile.file, 'resume', 'Teacher resume/CV document', token)
        );
      }
    }
    
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
    
    // Upload certificates
    if (formData.documents.certificates.length > 0) {
      for (const uploadedFile of formData.documents.certificates) {
        uploadPromises.push(
          documentService.uploadDocument(uploadedFile.file, 'qualification', 'Educational certificates', token)
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
        role: 'TEACHER'
      });

      // Store tokens in localStorage for document upload
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Upload documents after successful user registration
        try {
          await uploadDocuments(response.user.id, response.accessToken);
        } catch (uploadError) {
          console.error('Document upload failed:', uploadError);
          // Continue with registration success even if document upload fails
          // Documents can be uploaded later
        }
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Highest Qualification *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.qualification ? 'border-danger' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">-- Select Qualification --</option>
                    {QUALIFICATIONS.map(qual => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                </div>
                {errors.qualification && <p className="mt-1 text-sm text-danger">{errors.qualification}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Teaching Experience *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.experience ? 'border-danger' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">-- Select Experience --</option>
                    <option value="0-1">0-1 Years</option>
                    <option value="1-3">1-3 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5-10">5-10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
                {errors.experience && <p className="mt-1 text-sm text-danger">{errors.experience}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Subject Specialization * (Select all that apply)
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                {SUBJECTS.map(subject => (
                  <label
                    key={subject}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.specialization.includes(subject)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-white border-neutral-300 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(subject)}
                      onChange={() => handleSpecializationToggle(subject)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{subject}</span>
                      {formData.specialization.includes(subject) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {errors.specialization && <p className="mt-2 text-sm text-danger">{errors.specialization}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Teaching Mode *
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                {TEACHING_MODES.map(mode => (
                  <label
                    key={mode}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.teachingMode.includes(mode)
                        ? 'bg-secondary/10 border-secondary'
                        : 'bg-white border-neutral-300 hover:border-secondary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.teachingMode.includes(mode)}
                      onChange={() => handleTeachingModeToggle(mode)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{mode}</span>
                      {formData.teachingMode.includes(mode) && (
                        <Check className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {errors.teachingMode && <p className="mt-2 text-sm text-danger">{errors.teachingMode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Brief Bio * (Min 50 characters)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                  errors.bio ? 'border-danger' : 'border-neutral-300'
                }`}
                placeholder="Tell us about your teaching experience, methodology, and achievements..."
              />
              <p className="mt-1 text-xs text-neutral-500">
                {formData.bio.length}/500 characters
              </p>
              {errors.bio && <p className="mt-1 text-sm text-danger">{errors.bio}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-neutral-600 mb-6">
              Please upload the required documents. Files should be in PDF, JPG, PNG, DOC, or DOCX format (max 5MB each).
            </p>

            <DocumentUpload
              label="Resume/CV"
              description="Upload your detailed resume or curriculum vitae"
              required={true}
              maxFiles={1}
              accept=".pdf,.doc,.docx"
              allowedTypes={['PDF', 'DOC', 'DOCX']}
              onFilesChange={(files) => handleDocumentUpload(files, 'resume')}
              error={errors.resume}
              showPreview={true}
            />

            <DocumentUpload
              label="ID Proof (Aadhar/PAN Card)"
              description="Upload a clear copy of your government-issued identity proof"
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
              label="Educational Certificates"
              description="Upload your educational qualification certificates"
              required={true}
              maxFiles={3}
              allowedTypes={['PDF', 'JPG', 'PNG']}
              onFilesChange={(files) => handleDocumentUpload(files, 'certificates')}
              error={errors.certificates}
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
                  Your application has been submitted for review. You will receive an email once your account is approved.
                </p>
                <p className="text-sm text-neutral-500">
                  Redirecting to login page...
                </p>
              </div>
            ) : (
              <>
                <div className="bg-neutral-50 rounded-lg p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Review Your Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-neutral-700 mb-2">Personal Details</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-neutral-600">Name:</span>
                          <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div>
                          <span className="text-neutral-600">Email:</span>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-neutral-600">Phone:</span>
                          <p className="font-medium">{formData.phone}</p>
                        </div>
                        <div>
                          <span className="text-neutral-600">Address:</span>
                          <p className="font-medium">{formData.address}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-neutral-700 mb-2">Professional Details</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-neutral-600">Qualification:</span>
                          <p className="font-medium">{formData.qualification}</p>
                        </div>
                        <div>
                          <span className="text-neutral-600">Experience:</span>
                          <p className="font-medium">{formData.experience} Years</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-neutral-600">Specialization:</span>
                          <p className="font-medium">{formData.specialization.join(', ')}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-neutral-600">Teaching Mode:</span>
                          <p className="font-medium">{formData.teachingMode.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Application Review Process:</strong>
                      </p>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1">
                        <li>• Your application will be reviewed within 24-48 hours</li>
                        <li>• Documents will be verified by our admin team</li>
                        <li>• You'll receive an email once your account is approved</li>
                        <li>• After approval, you can start creating classes and accepting students</li>
                      </ul>
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
                    I certify that all information provided is accurate and agree to the Terms of Service and Privacy Policy.
                    I understand that my account will be activated after verification.
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Teacher Registration</h1>
          <p className="text-neutral-600">Join our community of educators and share your knowledge</p>
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
                      Submit Application
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