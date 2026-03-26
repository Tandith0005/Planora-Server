import { z } from "zod";

const createCheckoutSchema = z.object({
  body: z.object({
    eventId: z.uuid("Invalid event ID format"),
  }),
});

export const PaymentValidation = {
  createCheckoutSchema,
};