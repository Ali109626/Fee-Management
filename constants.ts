
import { Student, FeeRecord, PaymentStatus } from './types';

export const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const GRADE_FEES: Record<string, number> = {
  'Grade 1': 1500,
  'Grade 2': 1800,
  'Grade 3': 2000,
  'Grade 4': 2200,
  'Grade 5': 2500,
  'Grade 6': 2800,
  'Grade 7': 3000,
  'Grade 8': 3500,
  'Grade 9': 4000,
  'Grade 10': 4500,
};

export const INITIAL_STUDENTS: Student[] = [
  { id: 'ST001', name: 'Muhammad Ahmed', fatherName: 'Abdul Rehman', phone: '03001234567', grade: 'Grade 5', section: 'A', rollNumber: 'G5-101', portalId: 'APS-G5-101', admissionDate: '2023-04-10', monthlyFee: 2500 },
  { id: 'ST002', name: 'Fatima Zahra', fatherName: 'Muhammad Yousaf', phone: '03127654321', grade: 'Grade 5', section: 'B', rollNumber: 'G5-102', portalId: 'APS-G5-102', admissionDate: '2023-04-12', monthlyFee: 2500 },
  { id: 'ST003', name: 'Ahmed Raza', fatherName: 'Ghulam Abbas', phone: '03219876543', grade: 'Grade 6', section: 'A', rollNumber: 'G6-201', portalId: 'APS-G6-201', admissionDate: '2023-04-15', monthlyFee: 2800 },
  { id: 'ST004', name: 'Zainab Bibi', fatherName: 'Sajid Mahmood', phone: '03334567890', grade: 'Grade 6', section: 'A', rollNumber: 'G6-202', portalId: 'APS-G6-202', admissionDate: '2023-04-20', monthlyFee: 2800 },
  { id: 'ST005', name: 'Umar Farooq', fatherName: 'Tariq Javed', phone: '03451234567', grade: 'Grade 7', section: 'C', rollNumber: 'G7-301', portalId: 'APS-G7-301', admissionDate: '2023-05-01', monthlyFee: 3000 },
];

export const INITIAL_FEES: FeeRecord[] = [
  { id: 'F001', studentId: 'ST001', month: 'October', year: 2023, totalAmount: 2500, paidAmount: 2500, status: PaymentStatus.PAID, paymentDate: '2023-10-05', method: undefined, receiptNumber: 'RCP-1001' },
  { id: 'F002', studentId: 'ST002', month: 'October', year: 2023, totalAmount: 2500, paidAmount: 1000, status: PaymentStatus.PARTIAL, paymentDate: '2023-10-07', method: undefined, receiptNumber: 'RCP-1002' },
  { id: 'F003', studentId: 'ST003', month: 'October', year: 2023, totalAmount: 2800, paidAmount: 0, status: PaymentStatus.UNPAID },
];
