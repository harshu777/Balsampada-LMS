'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/verify-email?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Tuition LMS Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Status Icon and Message */}
          <div className="text-center">
            {verificationStatus === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  Verifying Your Email
                </h1>
                <p className="text-neutral-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  Email Verified Successfully!
                </h1>
                <p className="text-neutral-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-500">
                    Your account is now pending admin approval. You'll receive an email once your account is approved.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Go to Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-100 rounded-full">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  Verification Failed
                </h1>
                <p className="text-neutral-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-500">
                    If you continue to have issues, please contact support or request a new verification email.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors text-center"
                    >
                      Back to Login
                    </Link>
                    <Link
                      href="/resend-verification"
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                    >
                      Resend Email
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Having trouble? {' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-neutral-600">Verifying email...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}