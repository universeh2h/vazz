import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DUITKU_MERCHANT_CODE } from '../types';
import { getStatusMessage } from '../helpers';
import { v4 as uuidv4 } from 'uuid';
import { Digiflazz } from '@/lib/digiflazz';
import { DIGI_KEY, DIGI_USERNAME } from '@/constants';

export async function POST(req: NextRequest) {
  try {
    // Get callback data from Duitku
    let callbackData;
    const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_KEY);

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      callbackData = await req.json();
    } else {
      const formData = await req.formData();
      callbackData = Object.fromEntries(formData.entries());

      if (callbackData.amount) {
        callbackData.amount = callbackData.amount.toString();
      }
    }

    console.log('called callback request');
    console.log('Received callback data:', callbackData);

    // Extract important fields
    const {
      merchantCode,
      merchantOrderId,
      amount,
      signature,
      resultCode,
      reference,
      productDetails,
      phoneNumber,
    } = callbackData;

    // Validate required fields
    if (
      !merchantCode ||
      !merchantOrderId ||
      !amount ||
      !signature ||
      !resultCode
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate merchantCode
    if (merchantCode !== DUITKU_MERCHANT_CODE) {
      console.error('Invalid merchant code:', merchantCode);
      return NextResponse.json(
        { success: false, message: 'Invalid merchant code' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { merchantOrderId },
    });

    if (!transaction) {
      console.error('Transaction not found:', merchantOrderId);
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    const depositIdMatch = merchantOrderId.match(/^DEP-(\d+)-/);
    const orderTopUp = merchantOrderId.match(/^ORD-(\d+)-/);
    const depositId = depositIdMatch ? parseInt(depositIdMatch[1]) : null;

    let paymentStatus = 'PENDING';
    if (resultCode === '00' || resultCode === '0') {
      paymentStatus = 'PAID';
    } else if (resultCode === '01') {
      paymentStatus = 'PENDING';
    } else {
      paymentStatus = 'FAILED';
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { merchantOrderId },
      data: {
        paymentStatus,
        paymentReference: reference || transaction.paymentReference,
        statusMessage: getStatusMessage(resultCode),
        updatedAt: new Date(),
      },
    });

    // Update deposit status
    if (depositId) {
      await prisma.deposits.update({
        where: { id: depositId },
        data: { status: paymentStatus },
      });
      if (paymentStatus === 'SUCCESS') {
        const deposit = await prisma.deposits.findUnique({
          where: { id: depositId },
        });

        if (deposit) {
          await prisma.users.update({
            where: { id: deposit.userId },
            data: {
              balance: {
                increment: deposit.amount,
              },
            },
          });
        }
      }
    }

    if (orderTopUp) {
      let userId;

      if (transaction.userId) {
        // Use existing user ID if it exists
        userId = transaction.userId;
      } else {
        // Create a new guest user if needed
        const guestUser = await prisma.users.create({
          data: {
            id: `guest_${uuidv4()}`,
            name: 'Guest User',
            username: `guest_${merchantOrderId}`,
            role: 'Member',
            password: 'Password',
            whatsapp: '08267328221',
            balance: 0,
          },
        });
        userId = guestUser.id;
      }

      // Now create the invoice with a valid user ID
      await prisma.invoices.create({
        data: {
          invoiceNumber: `INV-${merchantOrderId}`,
          transactionId: transaction.id,
          userId,
          subtotal: transaction.originalAmount,
          discountAmount: transaction.discountAmount,
          totalAmount: transaction.finalAmount,
          status: 'PAID',
          dueDate: new Date(),
          paymentDate: new Date(),
          termsAndConditions: 'Standard terms and conditions apply.',
        },
      });

      const pembelian = await prisma.pembelian.findFirst({
        where: {
          order_id: transaction.merchantOrderId,
        },
      });
      const layanan = await prisma.layanan.findFirst({
        where: {
          layanan: productDetails,
        },
      });

      await digiflazz.TopUp({
        productCode: layanan?.providerId as string,
        userId: pembelian?.user_id as string,
        whatsapp: phoneNumber,
        serverId: pembelian?.zone as string,
      });
    }

    // Return success response to Duitku
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback processing error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing callback',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
