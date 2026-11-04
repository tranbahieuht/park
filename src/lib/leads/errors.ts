import "server-only";

export type DeliveryReason = "SMTP_CONFIGURATION" | "SMTP_AUTH" | "SMTP_TIMEOUT" | "SMTP_REJECTED" | "SMTP_UNAVAILABLE";
export class LeadDeliveryError extends Error {
  constructor(public reason: DeliveryReason) { super(reason); }
}

/** Provider messages can contain credentials or addresses; never return or log them. */
export function deliveryError(error: unknown): LeadDeliveryError {
  if (error instanceof LeadDeliveryError) return error;
  const code = error && typeof error === "object" && "code" in error ? error.code : null;
  return new LeadDeliveryError(code === "EAUTH" ? "SMTP_AUTH" : code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT" ? "SMTP_TIMEOUT" : code === "EENVELOPE" ? "SMTP_REJECTED" : "SMTP_UNAVAILABLE");
}
