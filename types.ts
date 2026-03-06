
export enum PaymentStatus {
  PAID = 'Paid',
  PARTIAL = 'Partial',
  UNPAID = 'Unpaid'
}

export enum PaymentMethod {
  CASH = 'Cash',
  BANK = 'Bank',
  ONLINE = 'Online'
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  address?: string;
  grade: string;
  section: string;
  rollNumber: string;
  portalId: string;
  admissionDate: string;
  monthlyFee: number; // The specific monthly fee assigned to this student
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string;
  year: number;
  totalAmount: number;
  paidAmount: number;
  paymentDate?: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  receiptNumber?: string;
  remarks?: string;
}

export type UserRole = 'Admin' | 'Accountant' | 'Staff' | 'Student';

export interface DashboardStats {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  pendingCount: number;
}
