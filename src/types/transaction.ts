import { Check, CreditCard, Package, Loader2 } from 'lucide-react';
import { Pembelian } from './pembelians';

// Assuming FLOWTRANSACTION is a type with these possible values
export type FLOWTRANSACTION =
  | 'PENDING'
  | 'PAID'
  | 'PROCESS'
  | 'SUCCESS'
  | 'FAILED';
export const stepsTransaction = [
  {
    id: 'PENDING',
    label: 'Transaksi telah Dibuat',
    description: 'Transaksi telah berhasil dibuat',
    icon: Check,
  },
  {
    id: 'PAID',
    label: 'Pembayaran',
    description: 'Silahkan melakukan pembayaran',
    icon: CreditCard,
  },
  {
    id: 'PROCESS',
    label: 'Sedang Di Proses',
    description: 'Pembelian sedang dalam proses',
    icon: Loader2,
  },
  {
    id: 'SUCCESS',
    label: 'Transaksi Selesai',
    description: 'Transaksi telah Berhasil Dilakukan',
    icon: Package,
  },
  {
    id: 'Failed',
    label: 'Transaksi Gagal',
    description: 'Transaksi telah Berhasil Dilakukan',
    icon: Package,
  },
];

export interface Transaction {
  id: number;
  merchantOrderId: string;
  userId: string | null;
  layananId: number | null;
  categoryId: number | null;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherId: number | null;
  paymentStatus: string | null;
  paymentCode: string;
  paymentReference: string | null;
  paymentUrl: string | null;
  layananName: string;
  noWa: string;
  statusMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  qrString: string | null;
  transactionType: string;
  categoryName: string;
}

export type TransactionWithUser = Transaction & {
  layanan: {
    layanan: string | null;
  } | null; // Allow layanan to be null
  category: {
    name: string | null;
  } | null;
  user: {
    name: string | null;
    username: string;
    id: string;
    whatsapp: string;
  } | null;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  notes: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  paymentDate: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  transactionId: number;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type TransactionDetailsType = {
  id: number;
  categoryId?: number;
  layananId?: number;
  merchantOrderId: string;
  noWa: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentCode: string;
  paymentReference: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'PAID' | 'PROCESS';
  paymentUrl: string;
  qrString: string | null;
  statusMessage: string | null;
  transactionType: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  voucherId: string | null;
  invoice: Invoice[];
  accountId?: string;
  serverId?: string | null;
  pembelian: Pembelian[];
};
export type TransactionAll = {
  totalCount: number;
  transactions: TransactionWithUser[];
};
