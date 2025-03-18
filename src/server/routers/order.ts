import { publicProcedure, router } from '../trpc';
import { Digiflazz } from '@/lib/digiflazz';
import { TRPCError } from '@trpc/server';
import { auth } from '../../../auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const order = router({
  createManual: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        layananId: z.string(),
        userId: z.string(),
        serverId: z.string().optional(),
        whatsapp: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await auth();
        const username = process.env.DIGI_USERNAME as string;
        const DIGI_API_KEY = process.env.DIGI_API_KEY as string;
        const digi = new Digiflazz(username, DIGI_API_KEY);

        if (user?.user.role !== 'Admin') {
          return {
            status: false,
            message: 'failed to create',
            statusCode: 401,
          };
        }
        const layanan = await ctx.prisma.layanan.findUnique({
          where: { id: parseInt(input.layananId) },
        });

        if (!layanan) {
          return {
            status: false,
            message: 'layanan tidak tersedia',
            statusCode: 404,
          };
        }
        const digiTrans = await digi.TopUp({
          productCode: layanan.providerId,
          whatsapp: input.whatsapp,
          userId: input.userId,
          serverId: input.serverId,
        });

        //   pesanan manual
        return await ctx.prisma.transaction.create({
          data: {
            categoryId: parseInt(input.categoryId),
            finalAmount: layanan.harga,
            layananId: parseInt(input.layananId),
            noWa: input.whatsapp,
            paymentCode: 'MANUAL',
            transactionType: 'MANUAL',
            originalAmount: layanan.harga,
            paymentStatus: digiTrans?.data.status as string,
            userId: user?.user.id,
            merchantOrderId: digiTrans?.data.ref_id as string,
            statusMessage: digiTrans?.data.status,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error('error : ', error.message);
          return {
            status: false,
            message: error,
            statusCode: 400,
          };
        }
        return {
          status: false,
          message: 'Internal Server Error',
          statusCode: 500,
        };
      }
    }),
  getAllTransaction: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        paymentCode: z.string().optional(),
        status: z.string().optional(),
        page: z.number(),
        perPage: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.TransactionWhereInput = {};
        const take = input.perPage;
        const skip = (input.page - 1) * take;

        // Add payment code filter
        if (input?.paymentCode) {
          where.paymentCode = input.paymentCode;
        }

        // Add search filter
        if (input.search) {
          where.OR = [
            { noWa: { contains: input.search } },
            { paymentCode: { contains: input.search } },
            { paymentReference: { contains: input.search } },
          ];
        }

        // Add status filter directly (assuming paymentStatus is a field on the transaction model)
        if (input?.status) {
          where.paymentStatus = input.status;
        }

        // Get data with pagination
        const data = await ctx.prisma.transaction.findMany({
          where,
          skip,
          take,
          orderBy: {
            createdAt: 'desc', // Changed to desc to show newest first
          },
        });

        // Get total count for pagination
        const totalCount = await ctx.prisma.transaction.count({
          where,
        });

        return {
          status: true,
          data: data,
          meta: {
            total: totalCount,
            page: input.page,
            perPage: take,
            totalPages: Math.ceil(totalCount / take),
          },
          statusCode: 200,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error('error : ', error.message);
          return {
            status: false,
            message: error,
            statusCode: 400,
          };
        }
        return {
          status: false,
          message: 'Internal Server Error',
          statusCode: 500,
        };
      }
    }),
});
