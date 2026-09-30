import "server-only";
import nodemailer from "nodemailer";

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.MAIL_FROM
  );
}

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let cachedTransporter: Transporter | null = null;

/**
 * Gmail SMTP via Nodemailer: smtp.gmail.com:587 with STARTTLS required
 * (secure: false + requireTLS: true -- NOT the implicit-TLS 465 config).
 * Auth uses a Google Account App Password, not the account password itself.
 * Returns null when SMTP isn't configured so callers can fall back to a
 * preview-only path instead of throwing.
 */
export function getMailTransport(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return cachedTransporter;
}

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export type SendMailResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: "not_configured" };

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const transport = getMailTransport();
  if (!transport) {
    return { sent: false, reason: "not_configured" };
  }
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return { sent: true, messageId: info.messageId };
}
