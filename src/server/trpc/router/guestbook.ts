// src/server/trpc/router/guestbook.ts

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const guestbookRouter = router({
  postMessage: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.guestbook.create({
          data: {
            name: input.name,
            userId: ctx.session.user.id,
            message: input.message,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.guestbook.findMany({
        select: {
          id: true,
          name: true,
          message: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }),
  getOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.guestbook.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            name: true,
            message: true,
            user: true,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }),
  deleteMessage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.guestbook.delete({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }),
  updateMessage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.guestbook.update({
          where: {
            id: input.id,
          },
          data: {
            message: input.message,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }),
});
