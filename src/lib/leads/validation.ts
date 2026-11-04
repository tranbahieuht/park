export const LEAD_SOURCES = ["hero_consultation", "sidebar_consultation", "contact_form", "pricing_calculator", "mobile_consultation", "popup", "residence_consultation", "header_consultation"] as const;

export interface LeadInput {
  name: string;
  phone: string;
  email: string;
  unit: string;
  language: "vi" | "en";
  source: typeof LEAD_SOURCES[number];
  consent: true;
  website: string;
  registeredAt: string;
}

export const validLeadPhone = (value: string) => /^\+?[0-9 () .-]+$/.test(value) && /^\d{9,15}$/.test(value.replace(/\D/g, ""));
export const validLeadEmail = (value: string) => value.length <= 254 && !/[\u0000-\u001f\u007f]/.test(value) && /^[^\s<>@,;"\\]+@[^\s<>@,;"\\]+\.[^\s<>@,;"\\]+$/.test(value);
const clean = (value: unknown, max: number) => typeof value === "string" && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);

export function leadFieldErrors(value: { name: string; phone: string; email: string; consent: boolean }) {
  return {
    name: !clean(value.name, 120) || value.name.trim().length < 2,
    phone: !clean(value.phone, 32) || !validLeadPhone(value.phone),
    email: !clean(value.email, 254) || (value.email.trim() !== "" && !validLeadEmail(value.email.trim())),
    consent: value.consent !== true,
  };
}
export type LeadFieldErrors = ReturnType<typeof leadFieldErrors>;

export function validateLead(value: unknown): LeadInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v: Record<string, unknown> = { ...value };
  if (v.email === undefined) v.email = "";
  if (v.unit === undefined) v.unit = "";
  if (!clean(v.name, 120) || (v.name as string).trim().length < 2 || !clean(v.phone, 32) || !validLeadPhone(v.phone as string)
    || !clean(v.email, 254) || ((v.email as string).trim() !== "" && !validLeadEmail((v.email as string).trim())) || !clean(v.unit, 100)
    || !clean(v.website, 200) || v.website !== "" || v.consent !== true
    || !["vi", "en"].includes(v.language as string) || !LEAD_SOURCES.includes(v.source as LeadInput["source"])
    || !clean(v.registeredAt, 40) || !/^\d{4}-\d{2}-\d{2}T/.test(v.registeredAt as string) || !Number.isFinite(Date.parse(v.registeredAt as string))) return null;
  return { name: (v.name as string).trim(), phone: (v.phone as string).trim(), email: (v.email as string).trim(),
    unit: (v.unit as string).trim(), language: v.language as LeadInput["language"], source: v.source as LeadInput["source"],
    consent: true, website: "", registeredAt: v.registeredAt as string };
}
