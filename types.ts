
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

export interface Admin {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  password?: string;
}

export interface Student {
  id: string;
  adminId: string; // To associate with a specific school/admin
  name: string;
  fatherName: string;
  phone: string;
  address?: string;
  image?: string;
  grade: string;
  section: string;
  rollNumber: string;
  portalId: string;
  admissionDate: string;
  monthlyFee: number;
}

export interface FeeRecord {
  id: string;
  adminId: string; // To associate with a specific school/admin
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
