import { TransactionDetailsType } from '@/types/transaction';
import { useState } from 'react';
import {
  CalendarIcon,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { calculateTimeRemaining } from '@/utils/calculate';
import { getStatusColor, getStatusIcon } from '@/components/ui/payment-status';
import { Category } from '@/types/category';
export function TransactionDetails({
  data,
  category,
}: {
  data: TransactionDetailsType;
  category: Category;
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeRemaining = calculateTimeRemaining({ createdAt: data.createdAt });
console.log(data,"data")
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              Transaction Details
            </CardTitle>
            <CardDescription className="mt-1">
              Order ID:{' '}
              <span className="font-medium">{data.merchantOrderId}</span>
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(
              data.paymentStatus
            )} px-3 py-1.5 text-sm flex items-center gap-1.5 border`}
          >
            {getStatusIcon(data.paymentStatus)}
            {data.paymentStatus}
          </Badge>
        </div>
      </CardHeader>

      {data.paymentStatus === 'PENDING' && (
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-medium">
              Payment Pending
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Please complete your payment within {timeRemaining.hours}h{' '}
              {timeRemaining.minutes}m to avoid cancellation.
            </AlertDescription>
          </Alert>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-amber-700 mb-1.5">
              <span>Time remaining</span>
              <span>
                {timeRemaining.hours}h {timeRemaining.minutes}m left
              </span>
            </div>
            <div className="relative">
              <Progress
                value={timeRemaining.percentage}
                className="h-2 bg-amber-200"
              />
              <style jsx>{`
                :global(.progress-indicator) {
                  background-color: #f59e0b; /* amber-500 */
                }
              `}</style>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-0">
        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 rounded-none border-b">
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Transaction Details
            </TabsTrigger>
            <TabsTrigger
              value="invoice"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Invoice Information
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="details" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Game Information */}
                  <div className="bg-muted/30 rounded-lg p-5 border">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-background border">
                        {category && (
                          <Image
                            src={category.thumbnail}
                            alt={category.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.subName}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="font-medium">User ID:</span>
                      <span>{data.pembelian[0].accountID}</span>

                      {data.pembelian[0].zone && (
                        <>
                          <span className="font-medium">Server ID:</span>
                          <span>{data.pembelian[0].zone}</span>
                        </>
                      )}

                      <span className="font-medium">Service:</span>
                      <span>Top up</span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-muted/30 rounded-lg p-5 border">
                    <h3 className="font-medium mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="font-medium">Amount:</span>
                      <span className="font-semibold">
                        {FormatPrice(data.finalAmount)}
                      </span>

                      <span className="font-medium">Original Amount:</span>
                      <span>{FormatPrice(data.originalAmount)}</span>

                      <span className="font-medium">Discount:</span>
                      <span>{FormatPrice(data.discountAmount)}</span>

                      <span className="font-medium">Payment Method:</span>
                      <span>{data.paymentCode}</span>

                      <span className="font-medium">Reference:</span>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[120px]">
                          {data.paymentReference || 'N/A'}
                        </span>
                        {data.paymentReference && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    copyToClipboard(data.paymentReference)
                                  }
                                >
                                  {copied ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{copied ? 'Copied!' : 'Copy reference'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Status Information */}
                  <div className="bg-muted/30 rounded-lg p-5 border">
                    <h3 className="font-medium mb-4">Status Information</h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(data.paymentStatus)}>
                        {data.paymentStatus}
                      </Badge>

                      <span className="font-medium">Created At:</span>
                      <span>{formatDate(data.createdAt)}</span>

                      <span className="font-medium">Updated At:</span>
                      <span>{formatDate(data.updatedAt)}</span>

                      <span className="font-medium">Completed At:</span>
                      <span>
                        {data.completedAt
                          ? formatDate(data.completedAt)
                          : 'Pending'}
                      </span>

                      <span className="font-medium">WhatsApp:</span>
                      <span>{data.noWa}</span>
                    </div>
                  </div>

                  {/* QR Code (if available) */}
                  {data.qrString && (
                    <div className="bg-muted/30 rounded-lg p-5 border">
                      <h3 className="font-medium mb-4">QR Payment</h3>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg mb-3">
                          <Image
                            width={150}
                            height={150}
                            src={`data:image/png;base64,${data.qrString}`}
                            alt="Payment QR Code"
                            className="w-[150px] h-[150px]"
                          />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                          Scan this QR code with your payment app to complete
                          the transaction
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Action (for pending status) */}
                  {data.paymentStatus === 'PENDING' && (
                    <div className="bg-primary-foreground rounded-lg p-5 border border-primary/20">
                      <h3 className="font-medium mb-3">
                        Complete Your Payment
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click the button below to proceed to the payment page
                        and complete your transaction.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => window.open(data.paymentUrl, '_blank')}
                      >
                        Pay Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoice" className="mt-0">
              {data.invoice && data.invoice.length > 0 ? (
                <div className="space-y-6">
                  {data.invoice.map((inv, index) => (
                    <Card key={index} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              Invoice #{inv.invoiceNumber}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-3 w-3" />
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(inv.status)}>
                            {inv.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-y-2">
                            <span className="text-sm font-medium">
                              Subtotal:
                            </span>
                            <span className="text-sm">
                              {FormatPrice(inv.subtotal)}
                            </span>

                            <span className="text-sm font-medium">
                              Discount:
                            </span>
                            <span className="text-sm">
                              {FormatPrice(inv.discountAmount)}
                            </span>

                            <span className="text-sm font-medium">Tax:</span>
                            <span className="text-sm">
                              {FormatPrice(inv.taxAmount)}
                            </span>

                            <Separator className="col-span-2 my-1" />

                            <span className="text-sm font-medium">
                              Total Amount:
                            </span>
                            <span className="text-sm font-bold">
                              {FormatPrice(inv.totalAmount)}
                            </span>
                          </div>

                          {inv.notes && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1">
                                Notes:
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {inv.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          Created:{' '}
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No Invoice Available
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {data.paymentStatus === 'PENDING'
                      ? 'The invoice will be generated once the payment is completed.'
                      : 'No invoice information is available for this transaction.'}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t p-6">
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
