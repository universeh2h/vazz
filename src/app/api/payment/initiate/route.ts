import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';
import {
  DUITKU_BASE_URL,
  DUITKU_CALLBACK_URL,
  DUITKU_EXPIRY_PERIOD,
  DUITKU_MERCHANT_CODE,
  DUITKU_RETURN_URL,
  DUITKU_API_KEY,
} from '../types';
import {
  sendAdminNotification,
  sendCustomerNotification,
} from '@/lib/whatsapp-message';
import { Prisma } from '@prisma/client';

export type RequestPayment = {
  noWa: string;
  layanan: string;
  paymentCode: string;
  accountId: string;
  serverId: string;
  voucherCode?: string;
  game: string;
  typeTransaksi: string;
  nickname: string;
};

export async function POST(req: NextRequest) {
  try {
    // Dapatkan body dari request
    const body = await req.json();

    const session = await auth();
    const {
      layanan,
      paymentCode,
      noWa,
      voucherCode,
      serverId,
      typeTransaksi,
      game,
      nickname,
      accountId,
    }: RequestPayment = body;

    console.log(body);

    // Validasi input
    if (!paymentCode || !layanan || !noWa) {
      return NextResponse.json(
        {
          statusCode: '400',
          statusMessage: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY) {
      console.error('Missing Duitku configuration');
      return NextResponse.json(
        {
          statusCode: '500',
          statusMessage: 'Server configuration error',
        },
        { status: 500 }
      );
    }

    // Generate merchant order ID
    const randomStr = Math.random().toString(36).substring(2, 8);
    const merchantOrderId = 'ORD-' + Date.now() + '-' + randomStr;

    // Start a Prisma transaction
    return await prisma.$transaction(
      async (tx) => {
        // Fetch the service details
        const productDetails = await tx.layanan.findFirst({
          where: { layanan },
        });

        if (!productDetails) {
          return NextResponse.json(
            { statusCode: 404, message: 'Product NotFound' },
            { status: 404 }
          );
        }

        // Get category details for voucher validation
        const categoryDetails = await tx.categories.findFirst({
          where: { id: parseInt(productDetails.kategoriId) },
        });

        if (!categoryDetails) {
          return NextResponse.json(
            { statusCode: 404, message: 'Category NotFound' },
            { status: 404 }
          );
        }

        // Base price calculation
        let price: number;
        let discountAmount = 0;
        let appliedVoucherId: number | null = null;

        if (
          productDetails.isFlashSale &&
          productDetails.expiredFlashSale &&
          new Date(productDetails.expiredFlashSale) > new Date()
        ) {
          price = productDetails.hargaFlashSale || 0;
        } else if (session?.user?.role === 'Platinum') {
          price = productDetails.hargaPlatinum;
        } else {
          price = productDetails.harga;
        }

        // Apply voucher if provided
        if (voucherCode) {
          const voucher = await tx.voucher.findFirst({
            where: {
              code: voucherCode,
              isActive: true,
              expiryDate: { gt: new Date() },
              startDate: { lte: new Date() },
            },
            include: {
              categories: true,
            },
          });

          if (voucher) {
            // Check if usage limit is reached
            if (
              voucher.usageLimit &&
              voucher.usageCount >= voucher.usageLimit
            ) {
              return NextResponse.json(
                { statusCode: 400, message: 'Voucher usage limit reached' },
                { status: 400 }
              );
            }

            // Check if minimum purchase requirement is met
            if (voucher.minPurchase && price < voucher.minPurchase) {
              return NextResponse.json(
                {
                  statusCode: 400,
                  message: `Minimum purchase of ${voucher.minPurchase} required for this voucher`,
                },
                { status: 400 }
              );
            }

            // Check if voucher is applicable to this category
            const isApplicable =
              voucher.isForAllCategories ||
              voucher.categories.some(
                (vc) => vc.categoryId === categoryDetails.id
              );

            if (isApplicable) {
              if (voucher.discountType === 'PERCENTAGE') {
                // Apply percentage discount
                discountAmount = (price * voucher.discountValue) / 100;
                if (voucher.maxDiscount) {
                  discountAmount = Math.min(
                    discountAmount,
                    voucher.maxDiscount
                  );
                }
              } else {
                discountAmount = voucher.discountValue;
              }

              price = Math.max(0, price - discountAmount);
              appliedVoucherId = voucher.id;
            } else {
              return NextResponse.json(
                {
                  statusCode: 400,
                  message: 'Voucher not applicable to this product category',
                },
                { status: 400 }
              );
            }
          } else {
            return NextResponse.json(
              { statusCode: 400, message: 'Invalid or expired voucher code' },
              { status: 400 }
            );
          }
        }

        const paymentAmount = price;

        // Check deposit availability if user is logged in
        if (session?.user?.id) {
          const checkDeposit = await CheckAvaibilityDeposit(
            tx,
            session.user.id,
            paymentAmount
          );
          if (!checkDeposit.status) {
            return NextResponse.json(
              { message: 'Saldo Anda Tidak mencukupi' },
              { status: 400 }
            );
          }
        }

        // Create transaction record
        const transactionData = {
          merchantOrderId,
          transactionType: 'Top up',
          originalAmount: productDetails.harga,
          discountAmount,
          finalAmount: paymentAmount,
          paymentStatus: 'PENDING',
          paymentCode,
          noWa,
        };

        // Add userId only if a user is logged in
        if (session?.user?.id) {
          // Check if user exists first
          const userExists = await tx.users.findUnique({
            where: { id: session.user.id },
          });

          if (userExists) {
            Object.assign(transactionData, { userId: session.user.id });
          }
        }

        if (appliedVoucherId) {
          Object.assign(transactionData, { voucherId: appliedVoucherId });
        }

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: transactionData,
        });

        const layanans = await tx.layanan.findFirst({
          where: {
            layanan,
          },
        });

        // Create pembelian record
        await tx.pembelian.create({
          data: {
            game,
            harga: paymentAmount,
            layanan,
            order_id: merchantOrderId,
            profit: productDetails.profit,
            status: 'PENDING',
            tipe_transaksi: typeTransaksi,
            username: session?.user?.username || 'Guest',
            user_id: session?.user.id,
            zone: serverId,
            provider_order_id: layanans?.providerId,
            nickname,
            accountID: accountId,
            transaction_id: transaction.id,
            ref_id: null,
          },
        });

        // If voucher is applied, increment its usage count
        if (appliedVoucherId) {
          await tx.voucher.update({
            where: { id: appliedVoucherId },
            data: { usageCount: { increment: 1 } },
          });
        }

        // Generate signature for Duitku
        const signature = crypto
          .createHash('md5')
          .update(
            DUITKU_MERCHANT_CODE +
              merchantOrderId +
              paymentAmount +
              DUITKU_API_KEY
          )
          .digest('hex');

        const payload = {
          merchantCode: DUITKU_MERCHANT_CODE,
          paymentAmount: paymentAmount,
          merchantOrderId: merchantOrderId,
          productDetails: layanan,
          paymentMethod: paymentCode,
          customerVaName: 'vazzuniverse',
          phoneNumber: noWa,
          returnUrl: `${DUITKU_RETURN_URL}`,
          callbackUrl: DUITKU_CALLBACK_URL,
          signature: signature,
          expiryPeriod: DUITKU_EXPIRY_PERIOD,
        };

        const methodName = await tx.methods.findFirst({
          where: {
            code: paymentCode,
          },
        });

        console.log('Sending payload to Duitku:', payload);

        try {
          const response = await axios.post(
            `${DUITKU_BASE_URL}/api/merchant/v2/inquiry`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          console.log('Duitku API response:', response.data);
          const data = response.data;

          // Check for valid response
          if (!data.statusCode) {
            return NextResponse.json(
              {
                success: false,
                message: 'Invalid response from API: ' + JSON.stringify(data),
              },
              { status: 500 }
            );
          }

          // Check for error status
          if (data.statusCode !== '00') {
            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: 'FAILED',
                statusMessage: data.statusMessage,
              },
            });

            return NextResponse.json(
              {
                statusCode: data.statusCode,
                statusMessage: data.statusMessage,
              },
              { status: 400 }
            );
          }

          // Update transaction with payment reference
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentReference: data.reference,
              paymentUrl: data.paymentUrl,
            },
          });

          // Update pembelian with reference ID
          await tx.pembelian.update({
            where: { order_id: merchantOrderId },
            data: { ref_id: data.reference },
          });

          // Send notifications outside the transaction to avoid rollback if notification fails
          setTimeout(async () => {
            try {
              await sendAdminNotification({
                orderData: {
                  amount: paymentAmount,
                  link: data.paymentUrl,
                  productName: layanan,
                  status: 'PENDING',
                  customerName: session?.user?.name || 'GUEST',
                  method: methodName?.name,
                  orderId: transaction.merchantOrderId,
                  whatsapp: process.env.NOMOR_WA_ADMIN,
                },
              });

              await sendCustomerNotification({
                orderData: {
                  amount: paymentAmount,
                  link: data.paymentUrl,
                  productName: layanan,
                  status: 'PENDING',
                  method: methodName?.name,
                  orderId: transaction.merchantOrderId,
                  whatsapp: noWa,
                },
              });
            } catch (notificationError) {
              console.error('Notification error:', notificationError);
            }
          }, 0);

          return NextResponse.json({
            paymentUrl: data.paymentUrl,
            reference: data.reference,
            statusCode: data.statusCode,
            statusMessage: data.statusMessage,
            merchantOrderId: merchantOrderId,
            transactionId: transaction.id,
          });
        } catch (apiError: any) {
          console.error('Duitku API error:', apiError.message);
          console.error('Response data:', apiError.response?.data);

          // Update transaction status to failed
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: 'FAILED',
              statusMessage:
                apiError.response?.data?.message || 'Payment gateway error',
            },
          });

          return NextResponse.json(
            {
              statusCode: apiError.response?.status || '500',
              statusMessage:
                apiError.response?.data?.message || 'Payment gateway error',
            },
            { status: apiError.response?.status || 500 }
          );
        }
      },
      {
        maxWait: 5000, // 5s maximum wait time
        timeout: 10000, // 10s timeout
      }
    );
  } catch (error) {
    console.error('Transaction processing error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Modified to use transaction
async function CheckAvaibilityDeposit(
  tx: Prisma.TransactionClient,
  userid: string,
  amount: number
) {
  try {
    const check = await tx.users.findFirst({
      where: {
        id: userid,
      },
    });

    if (!check) {
      return {
        status: false,
      };
    }

    if (check.balance < amount) {
      return {
        status: false,
      };
    }

    return {
      status: true,
    };
  } catch (error) {
    return {
      error: error,
      status: false,
    };
  }
}
