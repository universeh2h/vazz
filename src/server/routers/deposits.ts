import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { auth } from '../../../auth';

export const Deposits = router({
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        perPage: z.number().default(10),
        search: z.string().optional().default(''),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.DepositsWhereInput = {};
        const take = input.perPage;
        const skip = (input.page - 1) * take;

        if (input.search) {
          where.username = {
            contains: input.search,
          };
        }

        const totalCount = await ctx.prisma.deposits.count({
          where,
        });

        const totalPages = Math.ceil(totalCount / take);
        const hasNextPage = input.page < totalPages;
        const hasPreviousPage = input.page > 1;

        const data = await ctx.prisma.deposits.findMany({
          where,
          take,
          skip,
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          data,
          pagination: {
            totalCount,
            totalPages,
            currentPage: input.page,
            hasNextPage,
            hasPreviousPage,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error('error : ', error.message);
        }
        throw new Error(`Internal Server Erorr`);
      }
    }),
  getByUsername: publicProcedure.query(async ({ ctx }) => {
    try {
      const session = await auth();
      if (!session) {
        return {
          status: false,
          message: 'Unauthorized',
          statusCode: 401,
        };
      }
      const data = await ctx.prisma.deposits.findMany({
        where: {
          username: session?.user.username,
        },
      });

      return {
        data,
        status: true,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error('error : ', error.message);
        return {
          status: false,
          message: error.message,
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
