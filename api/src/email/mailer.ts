// ------------------------------------------------------------
// src/email/mailer.ts
// ------------------------------------------------------------

import nodemailer from "nodemailer";
import { env } from "../config/env";

export const mailer = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "false",
    ...(env.SMTP_USER 
        ? {
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        }
        : {}),
});

export type MailOptions = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
};

export async function sendMail(options: MailOptions) {
    if (!env.SMTP_ENABLE) {
        console.warn("SMTP is disabled. Email not sent.");
        return;
    }

    return mailer.sendMail({
        from: env.MAIL_FROM,
        ...options,
    });
}
