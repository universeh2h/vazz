'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

import { useState } from 'react';

// Sample data - replace with your actual data
const orders = [
  {
    id: 'INV-001',
    service: 'Mobile Legends',
    target: 'user123',
    price: 'Rp 50.000',
    status: 'completed',
    date: '2023-05-15',
  },
  {
    id: 'INV-002',
    service: 'PUBG Mobile',
    target: 'gamer456',
    price: 'Rp 100.000',
    status: 'pending',
    date: '2023-05-16',
  },
  {
    id: 'INV-003',
    service: 'Free Fire',
    target: 'player789',
    price: 'Rp 25.000',
    status: 'processing',
    date: '2023-05-16',
  },
  {
    id: 'INV-004',
    service: 'Genshin Impact',
    target: 'traveler101',
    price: 'Rp 150.000',
    status: 'completed',
    date: '2023-05-14',
  },
  {
    id: 'INV-005',
    service: 'Valorant',
    target: 'agent202',
    price: 'Rp 75.000',
    status: 'failed',
    date: '2023-05-13',
  },
  {
    id: 'INV-006',
    service: 'Mobile Legends',
    target: 'mlbb303',
    price: 'Rp 200.000',
    status: 'completed',
    date: '2023-05-12',
  },
  {
    id: 'INV-007',
    service: 'Call of Duty Mobile',
    target: 'soldier404',
    price: 'Rp 125.000',
    status: 'processing',
    date: '2023-05-16',
  },
];

export function TableOrder() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-400"
          >
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell>{order.target}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View order details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="bg-gray-400 text-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-400 text-white"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
