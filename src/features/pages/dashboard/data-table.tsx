'use client';
import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { FormatPrice } from '@/utils/formatPrice';

// Definisikan tipe data transaksi
interface Transaction {
  id: number;
  merchantOrderId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  paymentCode: string;
  noWa: string;
  createdAt: string;
  updatedAt: string | null;
  userId: string | null;
  layananId: number | null;
  categoryId: number | null;
  layanan: {
    layanan: string;
  };
  category: string;
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
    status: 'PAID' | 'UNPAID' | 'CANCELLED';
  }[];
  transactionType: string;
}

// Kolom untuk tabel transaksi
const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'merchantOrderId',
    header: 'Order ID',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('merchantOrderId')}</div>
    ),
  },
  {
    accessorKey: 'layanan',
    header: 'Service',
    cell: ({ row }) => {
      const serviceName = row.original.layananId || 'N/A';
      return <div>{serviceName}</div>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const categoryName = row.original.categoryId || 'N/A';
      return <div>{categoryName}</div>;
    },
  },
  {
    accessorKey: 'finalAmount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('finalAmount'));

      return <div className="font-medium">{FormatPrice(amount)}</div>;
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string;
      return (
        <div className="flex items-center">
          {status === 'SUCCESS' && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Success
            </Badge>
          )}
          {status === 'PAID' && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Paid
            </Badge>
          )}
          {status === 'PENDING' && (
            <Badge
              variant="outline"
              className="text-yellow-500 border-yellow-500"
            >
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
          {status === 'FAILED' && (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentCode',
    header: 'Payment Method',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div>{date.toLocaleDateString('id-ID')}</div>;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            {transaction.invoice.length > 0 && (
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View invoice
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download receipt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Komponen DataTable
interface DataTableProps {
  status?: string;
}

export function DataTable({ status }: DataTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Mengambil data dari API
  const {
    data: transactionData,
    isLoading,
    isError,
  } = trpc.transaction.getCalculatedTransaction.useQuery({
    status,
  });

  const table = useReactTable({
    data: transactionData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data.</div>;
  }

  return (
    <div>
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-card-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-card-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-card-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {transactionData?.length}{' '}
          transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-card-foreground"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-card-foreground"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
