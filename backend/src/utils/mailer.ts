import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

/**
 * Notifications e-mail (facultatives).
 *
 * Tant que les variables SMTP_* ne sont pas renseignées, l'envoi est simplement
 * ignoré et l'opération est tracée dans les logs : les formulaires continuent
 * d'enregistrer les demandes dans la base.
 */

let transporter: Transporter | null = null;
let initialised = false;

export function isMailConfigured(): boolean {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.password);
}

function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (transporter) return transporter;
  if (initialised) return null;
  initialised = true;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.password },
  });
  return transporter;
}

interface MailOptions {
  to?: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, html, replyTo }: MailOptions): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.info(`[mail] SMTP non configuré — e-mail « ${subject} » non envoyé.`);
    return false;
  }
  try {
    await transport.sendMail({
      from: env.smtp.from,
      to: to ?? env.smtp.to,
      subject,
      html,
      replyTo,
    });
    return true;
  } catch (error) {
    console.error('[mail] échec d’envoi :', (error as Error).message);
    return false;
  }
}

export function mailLayout(title: string, rows: { label: string; value: string }[], footer = ''): string {
  const body = rows
    .map(
      ({ label, value }) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#0A3478;white-space:nowrap;">${label}</td>` +
        `<td style="padding:8px 12px;color:#17243A;">${value}</td></tr>`
    )
    .join('');
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#F3F6FA;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0;">
      <div style="background:#062B63;padding:20px 24px;color:#fff;">
        <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#E6AD20;">ACES Global Services</p>
        <h1 style="margin:6px 0 0;font-size:20px;">${title}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${body}</table>
      ${footer ? `<div style="padding:16px 24px;background:#F3F6FA;color:#64748B;font-size:12px;">${footer}</div>` : ''}
    </div>
  </div>`;
}
