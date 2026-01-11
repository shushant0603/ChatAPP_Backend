import { z } from "zod";

/**
 * Send friend request
 */
export const sendRequestSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1),
  }),
});

/**
 * Accept friend request
 */
export const acceptRequestSchema = z.object({
  body: z.object({
    requestId: z.string().min(1),
  }),
});

/**
 * Reject / delete friend request
 */
export const rejectRequestSchema = z.object({
  body: z.object({
    requestId: z.string().min(1),
  }),
});
