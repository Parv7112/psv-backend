import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

function safe(value) {
  if (typeof value !== "string") return "N/A";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "N/A";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendLeadNotificationEmail(lead) {
  const subject = `New lead: ${safe(lead.service)} - ${safe(lead.name)}`;
  const text = [
    "New contact form submission",
    "",
    `Name: ${safe(lead.name)}`,
    `Email: ${safe(lead.email)}`,
    `Phone: ${safe(lead.phone)}`,
    `Company: ${safe(lead.company)}`,
    `Service: ${safe(lead.service)}`,
    `Budget: ${safe(lead.budget)}`,
    `Source: ${safe(lead.source)}`,
    "",
    "Message:",
    safe(lead.message),
    "",
    `Submitted at: ${new Date().toISOString()}`,
  ].join("\n");

  const html = `
    <h2>New contact form submission</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
      <tbody>
        <tr><td style="padding: 6px; font-weight: 600;">Name</td><td style="padding: 6px;">${escapeHtml(safe(lead.name))}</td></tr>
        <tr><td style="padding: 6px; font-weight: 600;">Email</td><td style="padding: 6px;">${escapeHtml(safe(lead.email))}</td></tr>
        <tr><td style="padding: 6px; font-weight: 600;">Phone</td><td style="padding: 6px;">${escapeHtml(safe(lead.phone))}</td></tr>
        <tr><td style="padding: 6px; font-weight: 600;">Company</td><td style="padding: 6px;">${escapeHtml(safe(lead.company))}</td></tr>
        <tr><td style="padding: 6px; font-weight: 600;">Service</td><td style="padding: 6px;">${escapeHtml(safe(lead.service))}</td></tr>
        <tr><td style="padding: 6px; font-weight: 600;">Budget</td><td style="padding: 6px;">${escapeHtml(safe(lead.budget))}</td></tr>
        <tr><td style="padding: 6px; font-weight: 600;">Source</td><td style="padding: 6px;">${escapeHtml(safe(lead.source))}</td></tr>
      </tbody>
    </table>
    <h3 style="margin-top: 18px;">Message</h3>
    <p style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(safe(lead.message))}</p>
  `;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: env.HR_EMAIL_TO,
    replyTo: safe(lead.email) !== "N/A" ? lead.email : undefined,
    subject,
    text,
    html,
  });
}

