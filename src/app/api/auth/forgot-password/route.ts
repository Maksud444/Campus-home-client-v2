import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()

    const user = await db.collection('users').findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) {
      await client.close()
      return NextResponse.json({
        success: true,
        message: 'If this email exists, a reset link has been sent to your inbox.',
      })
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store token in MongoDB
    await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { resetToken: token, resetTokenExpiry: expiry } }
    )

    await client.close()

    // Build reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    // Send email
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    if (!emailUser || !emailPass) {
      console.error('❌ EMAIL_USER or EMAIL_PASS not configured')
      return NextResponse.json({
        success: false,
        message: 'Email service not configured. Please contact the administrator.',
      }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Baytino" <${emailUser}>`,
      to: email,
      subject: 'Password Reset Request - Baytino',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:40px 40px 32px;text-align:center;">
                      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                        <span style="font-size:28px;">🔐</span>
                      </div>
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Password Reset</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">Baytino Real Estate</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 8px;color:#64748b;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Hello,</p>
                      <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:700;">We received a password reset request</h2>
                      <p style="margin:0 0 28px;color:#475569;font-size:16px;line-height:1.6;">
                        Someone requested a password reset for your Baytino account associated with <strong style="color:#0f172a;">${email}</strong>.
                        If this was you, click the button below to set a new password.
                      </p>
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:8px 0 32px;">
                            <a href="${resetUrl}"
                               style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 40px;border-radius:12px;box-shadow:0 4px 16px rgba(37,99,235,0.35);">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <!-- Expiry Notice -->
                      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
                        <p style="margin:0;color:#854d0e;font-size:14px;">
                          ⏰ <strong>This link expires in 1 hour.</strong> If it expires, you can request a new one.
                        </p>
                      </div>
                      <!-- Security Note -->
                      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
                        <p style="margin:0;color:#166534;font-size:14px;">
                          🔒 <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </div>
                      <!-- Link fallback -->
                      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">If the button doesn't work, copy and paste this link:</p>
                      <p style="margin:0;word-break:break-all;">
                        <a href="${resetUrl}" style="color:#2563eb;font-size:13px;text-decoration:none;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                      <p style="margin:0;color:#94a3b8;font-size:13px;">
                        © ${new Date().getFullYear()} Baytino Real Estate. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log(`📧 Password reset email sent to: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, message: 'Server error. Please try again.' }, { status: 500 })
  }
}
