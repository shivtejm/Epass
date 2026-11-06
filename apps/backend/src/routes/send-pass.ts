import { Router, Request, Response } from 'express';
import { Resend } from 'resend';
import { supabaseAdmin } from '../lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPassRouter = Router();

sendPassRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { passId } = req.body;

    if (!passId) {
      res.status(400).json({ error: 'passId is required' });
      return;
    }

    // Fetch the pass with event details
    const { data: pass, error: passError } = await supabaseAdmin
      .from('passes')
      .select('*, events(title, date, location, event_code, price)')
      .eq('id', passId)
      .single();

    if (passError || !pass) {
      res.status(404).json({ error: 'Pass not found' });
      return;
    }

    const event = pass.events;
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    // Generate QR Code URL using a free API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pass.qr_data)}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#050505;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;color:#fff;font-weight:bold;font-size:14px;">EP</td>
                      <td style="padding-left:10px;color:#fff;font-weight:bold;font-size:18px;">EPass</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Success Banner -->
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <div style="background:linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05));border:1px solid rgba(34,197,94,0.3);border-radius:16px;padding:16px 24px;display:inline-block;">
                    <span style="color:#4ade80;font-size:15px;font-weight:600;">✓ Your Pass Has Been Approved!</span>
                  </div>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="color:#fff;font-size:22px;font-weight:bold;text-align:center;padding-bottom:8px;">
                  You're going, ${pass.attendee_name}! 🎉
                </td>
              </tr>
              <tr>
                <td style="color:#888;font-size:14px;text-align:center;padding-bottom:32px;">
                  Your payment has been verified and your digital pass is ready.
                </td>
              </tr>

              <!-- Pass Card -->
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;overflow:hidden;">
                    
                    <!-- Pass Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#f8f8f8,#f0f0f0);padding:16px 24px;border-bottom:1px solid #eee;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <span style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:8px;display:inline-block;width:28px;height:28px;text-align:center;line-height:28px;color:#fff;font-size:10px;font-weight:bold;vertical-align:middle;">EP</span>
                              <span style="font-weight:bold;font-size:14px;color:#111;vertical-align:middle;margin-left:8px;">EPass</span>
                            </td>
                            <td align="right">
                              <span style="background:#f0f0f0;border:1px solid #ddd;border-radius:6px;padding:4px 10px;font-family:monospace;font-size:11px;color:#666;">${pass.pass_number}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Pass Body -->
                    <tr>
                      <td style="padding:32px 24px;text-align:center;">
                        <div style="font-size:22px;font-weight:bold;color:#111;margin-bottom:4px;">${event.title}</div>
                        <div style="font-size:13px;color:#666;margin-bottom:4px;">${formattedDate}</div>
                        <div style="font-size:13px;color:#888;margin-bottom:24px;">${formattedTime} · ${event.location}</div>
                        
                        <!-- QR Code -->
                        <div style="background:#fff;border:2px solid #f0f0f0;border-radius:16px;display:inline-block;padding:16px;margin-bottom:16px;">
                          <img src="${qrUrl}" alt="QR Code" width="200" height="200" style="display:block;border-radius:8px;" />
                        </div>
                        
                        <div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:3px;margin-top:8px;">Admit One</div>
                      </td>
                    </tr>

                    <!-- Pass Footer -->
                    <tr>
                      <td style="background:#fafafa;padding:16px 24px;border-top:1px dashed #ddd;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:50%;">
                              <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Attendee</div>
                              <div style="font-size:13px;color:#333;font-weight:600;margin-top:2px;">${pass.attendee_name}</div>
                            </td>
                            <td style="width:50%;text-align:right;">
                              <div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Amount Paid</div>
                              <div style="font-size:13px;color:#333;font-weight:600;margin-top:2px;">₹${event.price}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- UTR Reference -->
              <tr>
                <td style="padding-top:24px;text-align:center;">
                  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;display:inline-block;">
                    <span style="color:#888;font-size:11px;">UTR: </span>
                    <span style="color:#ddd;font-family:monospace;font-size:13px;">${pass.utr_number || 'N/A'}</span>
                  </div>
                </td>
              </tr>

              <!-- Instructions -->
              <tr>
                <td style="padding-top:32px;text-align:center;">
                  <div style="color:#888;font-size:12px;line-height:1.6;">
                    <strong style="color:#ccc;">📱 How to use your pass:</strong><br>
                    Show the QR code above at the event entrance.<br>
                    Save this email or screenshot the QR code for quick access.
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding-top:40px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);margin-top:32px;">
                  <div style="color:#555;font-size:11px;padding-top:20px;">
                    © 2026 EPass — Premium Event Ticketing
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'EPass <onboarding@resend.dev>',
      to: pass.attendee_email,
      subject: `🎫 Your EPass for "${event.title}" is Ready!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      res.status(500).json({ error: 'Failed to send email: ' + emailError.message });
      return;
    }

    res.json({ success: true, emailId: emailData?.id });
  } catch (err: any) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});
