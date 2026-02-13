/**
 * Input Validation Schemas
 * Using Zod for runtime type checking and validation
 */

import { z } from "zod";

/**
 * Extract plain text from HTML for length validation.
 * Strips HTML tags without decoding entities.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^<>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// Ticket/Case creation validation
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must not exceed 200 characters")
    .trim(),
  description: z
    .string()
    .max(50000, "Description is too large")
    .trim()
    .refine(
      (val) => htmlToPlainText(val).length >= 10,
      "Description must be at least 10 characters",
    )
    .refine(
      (val) => htmlToPlainText(val).length <= 5000,
      "Description must not exceed 5000 characters",
    ),
  priority: z
    .enum(["low", "normal", "high", "urgent"])
    .optional()
    .default("normal"),
});

// Message/Comment validation
export const createMessageSchema = z.object({
  content: z
    .string()
    .max(50000, "Message is too large")
    .trim()
    .refine(
      (val) => htmlToPlainText(val).length >= 1,
      "Message cannot be empty",
    )
    .refine(
      (val) => htmlToPlainText(val).length <= 5000,
      "Message must not exceed 5000 characters",
    ),
});

// Ticket status update validation
export const updateTicketStatusSchema = z.object({
  status: z.enum(["new", "open", "pending", "solved", "closed"]),
});

// End-user can only set open, solved, or closed
export const updateTicketStatusEndUserSchema = z.object({
  status: z.enum(["open", "solved", "closed"], {
    message: "End-users can only set status to 'open', 'solved', or 'closed'",
  }),
});

// Ticket ID parameter validation
export const ticketIdSchema = z.string().regex(/^\d+$/, "Invalid ticket ID");

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(content: string): string {
  return content
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize input
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Invalid input" };
  }
}
