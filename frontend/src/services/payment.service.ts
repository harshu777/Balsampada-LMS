import api from './api';

export interface PaymentType {
  ENROLLMENT_FEE: 'ENROLLMENT_FEE';
  MONTHLY_FEE: 'MONTHLY_FEE';
  EXAM_FEE: 'EXAM_FEE';
  MATERIAL_FEE: 'MATERIAL_FEE';
  OTHER: 'OTHER';
}

export interface PaymentMethod {
  CASH: 'CASH';
  BANK_TRANSFER: 'BANK_TRANSFER';
  CHEQUE: 'CHEQUE';
  ONLINE: 'ONLINE';
  OTHER: 'OTHER';
}

export interface PaymentStatus {
  PENDING: 'PENDING';
  APPROVED: 'APPROVED';
  REJECTED: 'REJECTED';
  PARTIAL: 'PARTIAL';
}

export interface CreatePaymentData {
  enrollmentId?: string;
  studentId: string;
  amount: number;
  type: keyof PaymentType;
  method: keyof PaymentMethod;
  dueDate?: string;
  description?: string;
  notes?: string;
  monthYear?: string;
  academicYear?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  type?: keyof PaymentType;
  method?: keyof PaymentMethod;
  status?: keyof PaymentStatus;
  dueDate?: string;
  description?: string;
  notes?: string;
  rejectionReason?: string;
  monthYear?: string;
  academicYear?: string;
}

export interface PaymentFilters {
  studentId?: string;
  status?: keyof PaymentStatus;
  type?: keyof PaymentType;
  monthYear?: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface Payment {
  id: string;
  enrollmentId?: string;
  studentId: string;
  amount: number;
  type: keyof PaymentType;
  method: keyof PaymentMethod;
  paidBy: string;
  approvedBy?: string;
  status: keyof PaymentStatus;
  paymentDate: string;
  approvalDate?: string;
  dueDate?: string;
  receiptNumber?: string;
  description?: string;
  notes?: string;
  proofFileUrl?: string;
  proofFileName?: string;
  rejectionReason?: string;
  monthYear?: string;
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  paidByUser: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  approvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  enrollment?: {
    id: string;
    subject: {
      id: string;
      name: string;
      class: {
        id: string;
        name: string;
        grade?: string;
      };
    };
  };
}

export interface PaymentStatistics {
  overview: {
    totalPayments: number;
    pendingPayments: number;
    approvedPayments: number;
    rejectedPayments: number;
    totalAmount: number;
    approvedAmount: number;
  };
  monthlyStats: Array<{
    monthYear: string;
    _sum: { amount: number };
    _count: number;
  }>;
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class PaymentService {
  // Create a new payment
  async createPayment(paymentData: CreatePaymentData, proofFile?: File): Promise<Payment> {
    const formData = new FormData();
    
    // Append payment data
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Append proof file if provided
    if (proofFile) {
      formData.append('proofFile', proofFile);
    }

    const response = await api.post('/payments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Create monthly payment (for students)
  async createMonthlyPayment(
    paymentData: Omit<CreatePaymentData, 'studentId' | 'type'>,
    proofFile?: File
  ): Promise<Payment> {
    const formData = new FormData();
    
    // Append payment data
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Append proof file if provided
    if (proofFile) {
      formData.append('proofFile', proofFile);
    }

    const response = await api.post('/payments/student/monthly', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Get payments with filters
  async getPayments(filters?: PaymentFilters): Promise<PaginatedPayments> {
    const response = await api.get('/payments', { params: filters });
    return response.data;
  }

  // Get payment by ID
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  // Get payment proof file
  async getPaymentProof(id: string): Promise<Blob> {
    const response = await api.get(`/payments/${id}/proof`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Update payment
  async updatePayment(id: string, updateData: UpdatePaymentData): Promise<Payment> {
    const response = await api.put(`/payments/${id}`, updateData);
    return response.data;
  }

  // Approve payment (admin only)
  async approvePayment(id: string, notes?: string, receiptNumber?: string): Promise<Payment> {
    const response = await api.post(`/payments/${id}/approve`, {
      notes,
      receiptNumber,
    });
    return response.data;
  }

  // Reject payment (admin only)
  async rejectPayment(id: string, rejectionReason: string, notes?: string): Promise<Payment> {
    const response = await api.post(`/payments/${id}/reject`, {
      rejectionReason,
      notes,
    });
    return response.data;
  }

  // Delete payment (admin only)
  async deletePayment(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  }

  // Get payment statistics (admin only)
  async getPaymentStatistics(filters?: {
    academicYear?: string;
    monthYear?: string;
  }): Promise<PaymentStatistics> {
    const response = await api.get('/payments/statistics', { params: filters });
    return response.data;
  }

  // Get overdue payments (admin only)
  async getOverduePayments(): Promise<Payment[]> {
    const response = await api.get('/payments/overdue');
    return response.data;
  }

  // Get student payment history
  async getStudentPaymentHistory(filters?: PaymentFilters): Promise<PaginatedPayments> {
    const response = await api.get('/payments/student/history', { params: filters });
    return response.data;
  }

  // Get pending payments (admin only)
  async getPendingPayments(filters?: PaymentFilters): Promise<PaginatedPayments> {
    const response = await api.get('/payments/admin/pending', { params: filters });
    return response.data;
  }

  // Bulk approve payments (admin only)
  async bulkApprovePayments(paymentIds: string[], notes?: string): Promise<any> {
    const response = await api.post('/payments/admin/bulk-approve', {
      paymentIds,
      notes,
    });
    return response.data;
  }

  // Bulk reject payments (admin only)
  async bulkRejectPayments(
    paymentIds: string[],
    rejectionReason: string,
    notes?: string
  ): Promise<any> {
    const response = await api.post('/payments/admin/bulk-reject', {
      paymentIds,
      rejectionReason,
      notes,
    });
    return response.data;
  }

  // Generate receipt (placeholder)
  async generateReceipt(id: string): Promise<any> {
    const response = await api.get(`/payments/${id}/receipt`);
    return response.data;
  }

  // Utility functions
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: keyof PaymentStatus): string {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      APPROVED: 'text-green-600 bg-green-100',
      REJECTED: 'text-red-600 bg-red-100',
      PARTIAL: 'text-blue-600 bg-blue-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getPaymentTypeLabel(type: keyof PaymentType): string {
    const labels = {
      ENROLLMENT_FEE: 'Enrollment Fee',
      MONTHLY_FEE: 'Monthly Fee',
      EXAM_FEE: 'Exam Fee',
      MATERIAL_FEE: 'Material Fee',
      OTHER: 'Other',
    };
    return labels[type] || type;
  }

  getPaymentMethodLabel(method: keyof PaymentMethod): string {
    const labels = {
      CASH: 'Cash',
      BANK_TRANSFER: 'Bank Transfer',
      CHEQUE: 'Cheque',
      ONLINE: 'Online',
      OTHER: 'Other',
    };
    return labels[method] || method;
  }

  // Generate month-year options for current and next 12 months
  getMonthYearOptions(): Array<{ value: string; label: string }> {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -6; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthYear = date.toISOString().slice(0, 7); // YYYY-MM format
      const label = date.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
      options.push({ value: monthYear, label });
    }
    
    return options;
  }

  // Get academic year options
  getAcademicYearOptions(): Array<{ value: string; label: string }> {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      const academicYear = `${year}-${year + 1}`;
      options.push({ value: academicYear, label: academicYear });
    }
    
    return options;
  }
}

export default new PaymentService();