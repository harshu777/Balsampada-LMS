'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import paymentService, {
  Payment,
  PaymentFilters,
  CreatePaymentData,
  PaginatedPayments
} from '@/services/payment.service';

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
  });

  // Form state
  const [formData, setFormData] = useState<Omit<CreatePaymentData, 'studentId' | 'type'>>({
    amount: 0,
    method: 'CASH',
    monthYear: '',
    academicYear: '',
    description: '',
    notes: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  useEffect(() => {
    // Set default month year to current month
    const currentDate = new Date();
    const currentMonthYear = currentDate.toISOString().slice(0, 7);
    const currentAcademicYear = paymentService.getAcademicYearOptions()[2].value; // Current academic year
    
    setFormData(prev => ({
      ...prev,
      monthYear: currentMonthYear,
      academicYear: currentAcademicYear,
    }));
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response: PaginatedPayments = await paymentService.getStudentPaymentHistory(filters);
      setPayments(response.payments);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.monthYear) {
      errors.monthYear = 'Month/Year is required';
    }

    if (!formData.academicYear) {
      errors.academicYear = 'Academic Year is required';
    }

    if (!proofFile) {
      errors.proofFile = 'Payment proof is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await paymentService.createMonthlyPayment(formData, proofFile!);
      
      // Reset form
      setFormData({
        amount: 0,
        method: 'CASH',
        monthYear: formData.monthYear,
        academicYear: formData.academicYear,
        description: '',
        notes: '',
      });
      setProofFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowPaymentForm(false);
      setFormErrors({});
      
      // Refresh payments list
      fetchPayments();
    } catch (error) {
      console.error('Error submitting payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, proofFile: 'File size must be less than 5MB' }));
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({ ...prev, proofFile: 'Only JPG, PNG, and PDF files are allowed' }));
        return;
      }

      setProofFile(file);
      setFormErrors(prev => ({ ...prev, proofFile: '' }));
    }
  };

  const openPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const closeModals = () => {
    setShowPaymentForm(false);
    setShowPaymentDetails(false);
    setSelectedPayment(null);
    setFormErrors({});
  };

  const downloadPaymentProof = async (payment: Payment) => {
    try {
      const blob = await paymentService.getPaymentProof(payment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = payment.proofFileName || `payment-proof-${payment.receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading proof:', error);
    }
  };

  // Get payment statistics for student
  const paymentStats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    approved: payments.filter(p => p.status === 'APPROVED').length,
    rejected: payments.filter(p => p.status === 'REJECTED').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    approvedAmount: payments.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Submit and track your fee payments
          </p>
        </div>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Submit Payment
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{paymentStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{paymentStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{paymentStats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-semibold text-gray-900">
                {paymentService.formatAmount(paymentStats.approvedAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: undefined, page: 1 }))}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              !filters.status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({paymentStats.total})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: 'PENDING', page: 1 }))}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filters.status === 'PENDING'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({paymentStats.pending})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: 'APPROVED', page: 1 }))}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filters.status === 'APPROVED'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({paymentStats.approved})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, status: 'REJECTED', page: 1 }))}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filters.status === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({paymentStats.rejected})
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by submitting your first payment.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowPaymentForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Submit Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentService.getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {paymentService.getPaymentTypeLabel(payment.type)}
                        </span>
                        {payment.monthYear && (
                          <span className="text-sm text-gray-600">
                            • {new Date(payment.monthYear + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {paymentService.formatAmount(payment.amount)}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {paymentService.formatDate(payment.paymentDate)}
                      </div>
                      <div>
                        Method: {paymentService.getPaymentMethodLabel(payment.method)}
                      </div>
                      {payment.receiptNumber && (
                        <div>
                          Receipt: {payment.receiptNumber}
                        </div>
                      )}
                    </div>

                    {payment.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {payment.description}
                      </p>
                    )}

                    {payment.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm text-red-800 font-medium">Rejected</p>
                            <p className="text-sm text-red-700">{payment.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => openPaymentDetails(payment)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {payment.proofFileUrl && (
                      <button
                        onClick={() => downloadPaymentProof(payment)}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Download Proof"
                      >
                        <DocumentArrowUpIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, pagination.page - 1) }))}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, pagination.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, pagination.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, pagination.page + 1) }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Submission Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModals}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitPayment}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <BanknotesIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Submit Monthly Payment
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            className={`w-full rounded-md border px-3 py-2 text-sm ${
                              formErrors.amount ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter payment amount"
                            min="1"
                            step="0.01"
                            required
                          />
                          {formErrors.amount && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.method}
                            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                          >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Month/Year <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.monthYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, monthYear: e.target.value }))}
                            className={`w-full rounded-md border px-3 py-2 text-sm ${
                              formErrors.monthYear ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Select Month/Year</option>
                            {paymentService.getMonthYearOptions().map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.monthYear && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.monthYear}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Academic Year <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.academicYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                            className={`w-full rounded-md border px-3 py-2 text-sm ${
                              formErrors.academicYear ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Select Academic Year</option>
                            {paymentService.getAcademicYearOptions().map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.academicYear && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.academicYear}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Proof <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className={`w-full rounded-md border px-3 py-2 text-sm ${
                              formErrors.proofFile ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Upload payment receipt/proof (JPG, PNG, PDF - max 5MB)
                          </p>
                          {formErrors.proofFile && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.proofFile}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={2}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Add any additional information"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (optional)
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Add any additional notes"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModals}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Payment Details
                  </h3>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Receipt Number</label>
                      <p className="text-sm text-gray-900">{selectedPayment.receiptNumber || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentService.getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Amount</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {paymentService.formatAmount(selectedPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Type</label>
                      <p className="text-sm text-gray-900">{paymentService.getPaymentTypeLabel(selectedPayment.type)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Method</label>
                      <p className="text-sm text-gray-900">{paymentService.getPaymentMethodLabel(selectedPayment.method)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Payment Date</label>
                      <p className="text-sm text-gray-900">{paymentService.formatDate(selectedPayment.paymentDate)}</p>
                    </div>
                    {selectedPayment.monthYear && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Month/Year</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedPayment.monthYear + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                    {selectedPayment.academicYear && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Academic Year</label>
                        <p className="text-sm text-gray-900">{selectedPayment.academicYear}</p>
                      </div>
                    )}
                  </div>

                  {selectedPayment.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Description</label>
                      <p className="text-sm text-gray-900">{selectedPayment.description}</p>
                    </div>
                  )}

                  {selectedPayment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-sm text-gray-900">{selectedPayment.notes}</p>
                    </div>
                  )}

                  {selectedPayment.rejectionReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Rejection Reason</label>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-900">{selectedPayment.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {selectedPayment.approvedByUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        {selectedPayment.status === 'APPROVED' ? 'Approved By' : 'Processed By'}
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedPayment.approvedByUser.firstName} {selectedPayment.approvedByUser.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedPayment.approvalDate && paymentService.formatDateTime(selectedPayment.approvalDate)}
                      </p>
                    </div>
                  )}

                  {selectedPayment.proofFileUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Payment Proof</label>
                      <button
                        onClick={() => downloadPaymentProof(selectedPayment)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                        Download {selectedPayment.proofFileName || 'Proof File'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}