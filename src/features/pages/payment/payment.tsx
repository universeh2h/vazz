'use client';
import { type JSX, useState } from 'react';
import { trpc } from '@/utils/trpc';
import Image from 'next/image';
import type { PaymentMethod } from '@/types/payment';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; 
import {
  CreditCard,
  CheckCircle2,
  LockIcon,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { typeIcons, typeLabels } from '@/hooks/use-payment';
import { Input } from '@/components/ui/input';
import { usePlansStore } from '@/hooks/use-select-plan';
import { FormatPrice } from '@/utils/formatPrice';
import { DialogPayment } from './dialog-payment';
import type { PlansProps } from '@/types/category';
import type { Voucher } from '@/types/voucher';

// Fungsi validasi amount
const isAmountValid = (method: PaymentMethod, amount?: number): boolean => {
  // If amount is undefined or null, check if method has min and max values
  if (!amount) return false;
  
  // check  values from minimal if not  return 0 and max values if not eexist return infinity
  const minValue = method?.min ?? 0;
  const maxValue = method?.max ?? Infinity;
  
  return amount >= minValue && amount <= maxValue;
};
export function PaymentsSection({
  amount,
}: {
  amount?: number;
  productDetails?: PlansProps | null;
}): JSX.Element {
  const { data: methods } = trpc.methods.getMethods.useQuery();
  console.log(methods);
  const {
    noWa,
    setNowa,
    selectPayment,
    setSelectPayment,
    categories,
    voucher,
    setVoucher,
  } = usePlansStore();
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [validVoucher, setValidVoucher] = useState<Voucher | null>(null);
  const [discountedAmount, setDiscountedAmount] = useState<number | null>(null);

  const validateVoucherMutation = trpc.voucher.validateVoucher.useMutation({
    onSuccess: (data) => {
      setValidVoucher(data);
      setVoucherError(null);
      // Calculate the discount
      if (amount && data) {
        let discount = 0;
        if (data.discountType === 'PERCENTAGE') {
          discount = (amount * data.discountValue) / 100;
          // Apply max discount if specified
          if (data.maxDiscount && discount > data.maxDiscount) {
            discount = data.maxDiscount;
          }
        } else {
          // Fixed amount discount
          discount = data.discountValue;
        }
        // Ensure discount doesn't exceed the amount
        if (discount > amount) {
          discount = amount;
        }
        setDiscountedAmount(amount - discount);
      }
      setIsValidatingVoucher(false);
    },
    onError: (error) => {
      setVoucherError(error.message);
      setValidVoucher(null);
      setDiscountedAmount(null);
      setIsValidatingVoucher(false);
    },
  });

  const groupedMethods =
    methods?.data.reduce((acc, method) => {
      const type = method.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(method);
      return acc;
    }, {} as Record<string, PaymentMethod[]>) || {};

  const paymentTypes = Object.keys(groupedMethods);

  const handleSelectMethod = (method: PaymentMethod) => {
    if (!amount) return;
    setSelectPayment({
      code: method.code as string,
      price: discountedAmount || amount,
      name: method.name,
      type: method.type,
    });
  };

  // Handler untuk accordion yang hanya memungkinkan dibuka jika amount tersedia
  const handleAccordionChange = (value: string) => {
    if (!amount) return;
    setExpandedType(value === expandedType ? null : value);
  };

  // Handler for voucher validation
  const handleValidateVoucher = async () => {
    if (!voucher || !amount || !categories) return;
    console.log(categories);
    setIsValidatingVoucher(true);
    setVoucherError(null);
    validateVoucherMutation.mutate({
      code: voucher,
      amount: discountedAmount || amount,
      categoryId: categories.id.toString(),
    });
  };

  const displayAmount = discountedAmount || amount;

  return (
    <section className="w-full mx-auto p-6 bg-[#001435] border-2 border-blue-900 rounded-2xl mt-5 space-y-6 shadow-lg">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
          Pilih Metode Pembayaran
        </h2>
      </div>
      <div className="mb-4 space-y-2">
        <label
          htmlFor="whatsapp"
          className="block text-white text-sm mb-2 font-medium"
        >
          No Whatsapp
        </label>
        <Input
          type="number"
          id="whatsapp"
          value={noWa || ''}
          onChange={(e) => setNowa(e.target.value)}
          placeholder="Enter your no whatsapp"
          className="w-full px-4 py-3 rounded-md bg-blue-950 border border-blue-800 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          required
        />
      </div>
      <div className="mb-4 space-y-2">
        <label
          htmlFor="voucher"
          className="block text-white text-sm mb-2 font-medium"
        >
          Kode Voucher
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            id="voucher"
            value={voucher || ''}
            onChange={(e) => {
              setVoucher(e.target.value);
              if (validVoucher) {
                setValidVoucher(null);
                setDiscountedAmount(null);
                setVoucherError(null);
              }
            }}
            placeholder="Masukkan kode voucher"
            className="w-full px-4 py-3 rounded-md bg-blue-950 border border-blue-800 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />
          <button
            className={cn(
              'px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-sm transition-colors',
              isValidatingVoucher && 'opacity-70 cursor-not-allowed'
            )}
            onClick={handleValidateVoucher}
            disabled={isValidatingVoucher || !voucher || !amount}
          >
            {isValidatingVoucher ? 'Memproses...' : 'Terapkan'}
          </button>
        </div>
        {voucherError && (
          <div className="text-xs text-red-300 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 text-red-400" />
            {voucherError}
          </div>
        )}
        {validVoucher && (
          <div className="mt-2 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Tag className="h-4 w-4 text-green-400" />
              <span className="font-medium">{validVoucher.code}</span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-blue-300">
                {validVoucher.discountType === 'PERCENTAGE'
                  ? `Diskon ${validVoucher.discountValue}%`
                  : `Diskon ${FormatPrice(validVoucher.discountValue)}`}
                {validVoucher.maxDiscount &&
                  validVoucher.discountType === 'PERCENTAGE' &&
                  ` (maks. ${FormatPrice(validVoucher.maxDiscount)})`}
              </div>
              {discountedAmount !== null && amount !== null && (
                <div className="text-right">
                  <div className="text-xs text-blue-300 line-through">
                    {FormatPrice(amount as number)}
                  </div>
                  <div className="text-sm font-medium text-green-400">
                    {FormatPrice(discountedAmount)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={expandedType || undefined}
        onValueChange={handleAccordionChange}
      >
        {paymentTypes.map((type) => (
          <div
            key={type}
            className={cn(!amount && 'opacity-60 pointer-events-none')}
          >
            <AccordionItem
              value={type}
              className="border border-blue-800 rounded-lg mb-4 overflow-hidden"
            >
              <AccordionTrigger
                className="px-4 py-4 bg-blue-900/50 hover:bg-blue-900/70 hover:no-underline text-blue-100 transition-all duration-200"
                disabled={!amount}
              >
                <div className="flex items-center gap-3">
                  {typeIcons[type] || (
                    <CreditCard className="h-5 w-5 text-blue-300" />
                  )}
                  <span className="font-medium">
                    {typeLabels[type] || type}
                  </span>
                  {displayAmount && <span>{FormatPrice(displayAmount)}</span>}
                  {!amount && (
                    <span className="ml-2 text-xs text-red-300 flex items-center gap-1">
                      <LockIcon className="h-3 w-3" />
                      Pilih Paket Dahulu
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-5 bg-blue-950/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedMethods[type].map((method) => {
                    const isValid = isAmountValid(method, amount);
                    return (
                      <div
                        key={method.id}
                        className={cn(
                          'cursor-pointer border border-blue-800 hover:border-blue-400 rounded-lg w-full h-24 overflow-hidden relative bg-blue-950/20 transition-all duration-200',
                          selectPayment?.code === method.code &&
                            'border-blue-400 bg-blue-900/30',
                          !isValid && 'opacity-60 pointer-events-none'
                        )}
                        onClick={() => isValid && handleSelectMethod(method)}
                      >
                        <div className="h-full flex flex-row items-center p-3">
                          <div className="flex-shrink-0 flex items-center justify-center mr-3">
                            <Image
                              width={300}
                              height={300}
                              src={method.images}
                              alt={method.name}
                              className="size-12 object-contain"
                            />
                          </div>
                          <div className="flex-grow space-y-1">
                            <p className="text-sm font-medium text-blue-100">
                              {method.name}
                            </p>
                            {method.keterangan && (
                              <p className="text-xs text-blue-300">
                                {method.keterangan}
                              </p>
                            )}
                          </div>
                          {selectPayment?.code === method.code && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="h-5 w-5 text-blue-400" />
                            </div>
                          )}
                          {!isValid && (
                            <div className="absolute top-2 right-2">
                              <span className="text-xs text-red-400">
                                Tidak Tersedia
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
      {paymentTypes.length > 0 &&
        !Object.values(groupedMethods).some((methods) =>
          methods.some((method) => isAmountValid(method, amount))
        ) && (
          <div className="text-red-400 text-sm mt-4">
            Maaf, jumlah pembayaran tidak sesuai dengan metode pembayaran yang
            tersedia.
          </div>
        )}
      {selectPayment && (
        <div className="transition-all duration-300 ease-in-out">
          <DialogPayment amount={discountedAmount || amount || 0} />
        </div>
      )}
    </section>
  );
}
