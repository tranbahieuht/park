import "server-only";
import nodemailer from "nodemailer";
import { validLeadEmail, type LeadInput } from "./validation";

export function smtpConfig() {
  const e = process.env;
  const port = Number(e.SMTP_PORT);
  const secure = e.SMTP_SECURE === "true";
  const from = e.SMTP_FROM || "", to = e.LEAD_RECEIVER_EMAIL || "";
  if (!e.SMTP_HOST || /[\s\u0000-\u001f]/.test(e.SMTP_HOST) || !Number.isInteger(port) || port < 1 || port > 65535
    || !["true", "false"].includes(e.SMTP_SECURE || "") || !validLeadEmail(from) || !validLeadEmail(to)
    || !e.SMTP_USER || !e.SMTP_PASSWORD) throw new Error("SMTP configuration unavailable");
  return { host: e.SMTP_HOST, port, secure, auth: { user: e.SMTP_USER, pass: e.SMTP_PASSWORD }, from, to };
}

const escape = (text: string) => text.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function leadMessage(lead: LeadInput, receivedAt = new Date()) {
  const time = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(receivedAt);
  const rows = [ ["Họ và tên", lead.name], ["Số điện thoại", lead.phone], ["Email", lead.email || "—"],
    ["Loại căn quan tâm", lead.unit || "—"], ["Nguồn đăng ký", lead.source], ["Ngôn ngữ", lead.language], ["Thời gian", time] ];
  return {
    subject: "[Norton Park] Khách hàng đăng ký tư vấn mới",
    text: "NORTON PARK\nTHÔNG TIN KHÁCH HÀNG\n\n" + rows.map(([key, value]) => `${key}: ${value}`).join("\n"),
    html: '<!doctype html><html lang="vi"><body style="margin:0;padding:24px;background:#FBFAF6;font-family:Arial,sans-serif;color:#333"><div style="max-width:600px;margin:auto;background:#fff;padding:28px;border:1px solid #ddd"><h1 style="font-size:22px;color:#5D614F">Norton Park</h1><h2 style="font-size:16px">THÔNG TIN KHÁCH HÀNG</h2><table style="width:100%;border-collapse:collapse">'
      + rows.map(([key, value]) => `<tr><th align="left" style="padding:10px;border-bottom:1px solid #eee;vertical-align:top">${escape(key)}</th><td style="padding:10px;border-bottom:1px solid #eee;overflow-wrap:anywhere">${escape(value)}</td></tr>`).join("") + "</table></div></body></html>",
  };
}

export async function sendLead(lead: LeadInput) {
  const { from, to, ...smtp } = smtpConfig();
  const transport = nodemailer.createTransport({ ...smtp, requireTLS: !smtp.secure,
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000,
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false });
  try {
    const result = await transport.sendMail({ from: { name: "Norton Park", address: from }, to: { address: to, name: "" },
      ...(lead.email ? { replyTo: { address: lead.email, name: "" } } : {}), ...leadMessage(lead) });
    if (!result.accepted?.length || result.rejected?.length) throw new Error("SMTP did not accept recipient");
  } finally { transport.close(); }
}
