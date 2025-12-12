import { layout } from "./layout";

export type NewUserInvitePayload = {
  appName: string;
  loginUrl: string;
  email: string;
  name: string;
  tempPassword: string;
};

export function buildNewUserInviteEmail(p: NewUserInvitePayload) {
  const subject = `Your ${p.appName} account`;

  const text = `
Hi ${p.name},

An account has been created for you on ${p.appName}.

Login URL: ${p.loginUrl}
Username: ${p.email}
Temporary password: ${p.tempPassword}

You'll be asked to set a new password when you first sign in.

If you weren't expecting this email, please contact your administrator.
`.trim();

  const body = `
    <p style="font-size:14px;color:#111827;">Hi ${p.name},</p>
    <p style="font-size:14px;color:#111827;">
      An account has been created for you on ${p.appName}.
    </p>
    <p style="font-size:14px;color:#111827;">
      <strong>Login URL:</strong> <a href="${p.loginUrl}">${p.loginUrl}</a><br/>
      <strong>Username:</strong> ${p.email}<br/>
      <strong>Temporary password:</strong> <code style="background:#f3f4f6;padding:2px 4px;border-radius:4px;">${p.tempPassword}</code>
    </p>
    <p style="font-size:14px;color:#111827;">
      You'll be asked to set a new password when you first sign in.
    </p>
  `;

  const html = layout({ title: subject, body });

  return { subject, text, html };
}

