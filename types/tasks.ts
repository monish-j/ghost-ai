import { z } from "zod";

export const AiStatusPayloadSchema = z.object({
  text: z.string().optional(),
});

export type AiStatusPayload = z.infer<typeof AiStatusPayloadSchema>;

export const AiChatMessageSchema = z.object({
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>;
