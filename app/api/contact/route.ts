import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email address" },
                { status: 400 }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Themed HTML email body matching portfolio's cyberpunk design
        const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #020817; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #020817; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header with gradient border -->
          <tr>
            <td style="background: linear-gradient(135deg, #00f5d4, #7209b7, #f72585); padding: 2px; border-radius: 8px 8px 0 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #0a0f1e; padding: 32px 40px; border-radius: 6px 6px 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 4px; color: #00f5d4; text-transform: uppercase; font-family: 'Courier New', monospace;">
                            &#9672; NEW MESSAGE RECEIVED
                          </p>
                          <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">
                            Contact Form <span style="color: #00f5d4;">Submission</span>
                          </h1>
                        </td>
                        <td align="right" valign="top">
                          <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(0, 245, 212, 0.1); border: 1px solid rgba(0, 245, 212, 0.3); text-align: center; line-height: 48px;">
                            <span style="font-size: 24px;">&#9993;</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background: linear-gradient(135deg, #00f5d4, #7209b7, #f72585); padding: 0 2px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #0a0f1e; padding: 32px 40px;">
                    
                    <!-- Sender Info Card -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(0, 245, 212, 0.05); border: 1px solid rgba(0, 245, 212, 0.15); border-radius: 6px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="44" valign="top">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #00f5d4, #7209b7); text-align: center; line-height: 40px; font-size: 18px; font-weight: bold; color: #020817;">
                                  ${name.charAt(0).toUpperCase()}
                                </div>
                              </td>
                              <td style="padding-left: 14px;">
                                <p style="margin: 0 0 2px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                                  ${name}
                                </p>
                                <a href="mailto:${email}" style="color: #00f5d4; font-size: 13px; font-family: 'Courier New', monospace; text-decoration: none;">
                                  ${email}
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Subject -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 6px 0; font-size: 10px; letter-spacing: 3px; color: #f72585; text-transform: uppercase; font-family: 'Courier New', monospace;">
                            SUBJECT
                          </p>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                            ${subject}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="height: 1px; background: linear-gradient(to right, #00f5d4, #7209b7, #f72585, transparent);"></td>
                      </tr>
                    </table>

                    <!-- Message -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0 0 10px 0; font-size: 10px; letter-spacing: 3px; color: #00f5d4; text-transform: uppercase; font-family: 'Courier New', monospace;">
                            MESSAGE
                          </p>
                          <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 20px 24px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #c8d0dc;">
                              ${message.replace(/\n/g, "<br>")}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #00f5d4, #7209b7, #f72585); padding: 0 2px 2px 2px; border-radius: 0 0 8px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #0a0f1e; padding: 24px 40px; border-radius: 0 0 6px 6px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px 0; font-size: 11px; color: rgba(255, 255, 255, 0.3); font-family: 'Courier New', monospace;">
                            Sent via Portfolio Contact Form
                          </p>
                          <p style="margin: 0; font-size: 11px; color: rgba(255, 255, 255, 0.2);">
                            &copy; ${new Date().getFullYear()} Md Sadmanur Islam Shishir
                          </p>
                        </td>
                        <td align="right" valign="middle">
                          <a href="mailto:${email}" style="display: inline-block; padding: 8px 20px; background: transparent; border: 1px solid #00f5d4; color: #00f5d4; font-size: 11px; font-family: 'Courier New', monospace; text-decoration: none; letter-spacing: 2px; border-radius: 4px;">
                            REPLY
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: process.env.EMAIL_USER,
            subject: `✦ Portfolio Contact: ${subject}`,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "Email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { message: "Failed to send email. Please try again later." },
            { status: 500 }
        );
    }
}
