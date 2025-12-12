export function layout(opts: { title: string; body: string }) {
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${opts.title}</title>
    </head>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f3f4f6; padding:24px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
        <tr>
          <td>
            <h1 style="font-size:20px;margin:0 0 16px 0;">${opts.title}</h1>
            ${opts.body}
            <p style="font-size:12px;color:#6b7280;margin-top:24px;">
              This email was sent by AutoBk Controller.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

