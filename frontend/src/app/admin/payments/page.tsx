'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckIcon, 
  XMarkIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import paymentService, { 
  Payment, 
  PaymentFilters, 
  PaymentStatistics,
  PaginatedPayments 
} from '@/services/payment.service';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'bulk-approve' | 'bulk-reject'>('approve');
  const [modalNotes, setModalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [filters]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, filters.status, filters.type]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response: PaginatedPayments = await paymentService.getPayments(filters);
      setPayments(response.payments);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await paymentService.getPaymentStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await paymentService.approvePayment(paymentId, modalNotes, receiptNumber);
      fetchPayments();
      fetchStatistics();
      resetModal();
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await paymentService.rejectPayment(paymentId, rejectionReason, modalNotes);
      fetchPayments();
      fetchStatistics();
      resetModal();
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedPayments.length === 0) return;

    try {
      if (modalAction === 'bulk-approve') {
        await paymentService.bulkApprovePayments(selectedPayments, modalNotes);
      } else if (modalAction === 'bulk-reject') {
        await paymentService.bulkRejectPayments(selectedPayments, rejectionReason, modalNotes);
      }
      
      setSelectedPayments([]);
      fetchPayments();
      fetchStatistics();
      resetModal();
    } catch (error) {
      console.error('Error in bulk action:', error);
    }
  };

  const resetModal = () => {
    setShowApprovalModal(false);
    setShowRejectionModal(false);
    setShowPaymentDetails(false);
    setSelectedPayment(null);
    setModalNotes('');
    setRejectionReason('');
    setReceiptNumber('');
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const openApprovalModal = (payment?: Payment, action: 'approve' | 'bulk-approve' = 'approve') => {
    setSelectedPayment(payment || null);
    setModalAction(action);
    setShowApprovalModal(true);
  };

  const openRejectionModal = (payment?: Payment, action: 'reject' | 'bulk-reject' = 'reject') => {
    setSelectedPayment(payment || null);
    setModalAction(action);
    setShowRejectionModal(true);
  };

  const openPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage student payments
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.pendingPayments}
                </p>
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
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.approvedPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.rejectedPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {paymentService.formatAmount(statistics.overview.approvedAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="ENROLLMENT_FEE">Enrollment Fee</option>
                <option value="MONTHLY_FEE">Monthly Fee</option>
                <option value="EXAM_FEE">Exam Fee</option>
                <option value="MATERIAL_FEE">Material Fee</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month/Year
              </label>
              <select
                value={filters.monthYear || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, monthYear: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Months</option>
                {paymentService.getMonthYearOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                value={filters.academicYear || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Years</option>
                {paymentService.getAcademicYearOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, limit: 20 })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {selectedPayments.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => openApprovalModal(undefined, 'bulk-approve')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Approve ({selectedPayments.length})
              </button>
              <button
                onClick={() => openRejectionModal(undefined, 'bulk-reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Reject ({selectedPayments.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={filteredPayments.every(payment => selectedPayments.includes(payment.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPayments(filteredPayments.map(p => p.id));
                      } else {
                        setSelectedPayments([]);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => togglePaymentSelection(payment.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.student.firstName} {payment.student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paymentService.formatAmount(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paymentService.getPaymentTypeLabel(payment.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentService.getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paymentService.formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openPaymentDetails(payment)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {payment.proofFileUrl && (
                      <button
                        onClick={() => downloadPaymentProof(payment)}
                        className="text-green-600 hover:text-green-900"
                        title="Download Proof"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    )}

                    {payment.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openApprovalModal(payment)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openRejectionModal(payment)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  {/* Page numbers could be added here */}
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

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalAction === 'bulk-approve' ? `Approve ${selectedPayments.length} Payments` : 'Approve Payment'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      {modalAction !== 'bulk-approve' && selectedPayment && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-600">
                            Amount: <span className="font-medium">{paymentService.formatAmount(selectedPayment.amount)}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Student: <span className="font-medium">{selectedPayment.student.firstName} {selectedPayment.student.lastName}</span>
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Receipt Number (optional)
                        </label>
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={(e) => setReceiptNumber(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Enter receipt number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          value={modalNotes}
                          onChange={(e) => setModalNotes(e.target.value)}
                          rows={3}
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
                  type="button"
                  onClick={() => {
                    if (modalAction === 'bulk-approve') {
                      handleBulkAction();
                    } else if (selectedPayment) {
                      handleApprovePayment(selectedPayment.id);
                    }
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={resetModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalAction === 'bulk-reject' ? `Reject ${selectedPayments.length} Payments` : 'Reject Payment'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      {modalAction !== 'bulk-reject' && selectedPayment && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-600">
                            Amount: <span className="font-medium">{paymentService.formatAmount(selectedPayment.amount)}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Student: <span className="font-medium">{selectedPayment.student.firstName} {selectedPayment.student.lastName}</span>
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Please provide a reason for rejection"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Notes (optional)
                        </label>
                        <textarea
                          value={modalNotes}
                          onChange={(e) => setModalNotes(e.target.value)}
                          rows={3}
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
                  type="button"
                  onClick={() => {
                    if (!rejectionReason.trim()) return;
                    if (modalAction === 'bulk-reject') {
                      handleBulkAction();
                    } else if (selectedPayment) {
                      handleRejectPayment(selectedPayment.id);
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={resetModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Payment Details
                  </h3>
                  <button
                    onClick={resetModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Student Information</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-900 font-medium">
                        {selectedPayment.student.firstName} {selectedPayment.student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedPayment.student.email}</p>
                      {selectedPayment.student.phone && (
                        <p className="text-sm text-gray-600">{selectedPayment.student.phone}</p>
                      )}
                    </div>
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
                      <p className="text-sm text-red-900">{selectedPayment.rejectionReason}</p>
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
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
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