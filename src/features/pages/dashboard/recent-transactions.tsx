'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TransactionWithUser } from '@/types/transaction';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function RecentTransactions({
  transaction,
}: {
  transaction: TransactionWithUser;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 bg-primary/10">
          <AvatarFallback className="text-primary">
            {transaction?.user?.name ??
              'Anonymous User'
                .split(' ')
                .map((n) => n[0])
                .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-card-foreground">
            {transaction?.user?.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {transaction.layananName} - {transaction.categoryName}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="font-medium text-card-foreground">
          {FormatPrice(transaction.finalAmount)}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </div>
          {transaction.paymentStatus === 'PAID' && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Success
            </Badge>
          )}
          {transaction.paymentStatus === 'PENDING' && (
            <Badge
              variant="outline"
              className="text-yellow-500 border-yellow-500"
            >
              <Clock className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
          {transaction.paymentStatus === 'FAILED' && (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
