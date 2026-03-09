import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import nodemailer from 'nodemailer'
import { readPosts, writePosts, readNotifications, writeNotifications } from '@/lib/posts-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://baytino.com'

function getEmailTransporter() {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  if (!emailUser || !emailPass) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass.replace(/\s/g, '') },
  })
}

async function writeServerNotification(email: string, message: string, type: 'success' | 'error', link?: string) {
  try {
    const all = await readNotifications()
    if (!all[email]) all[email] = []
    all[email].unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link,
    })
    all[email] = all[email].slice(0, 50)
    await writeNotifications(all)
  } catch { /* ignore */ }
}

function getImageUrl(img: any): string {
  if (!img) return ''
  if (typeof img === 'string') return img
  return img.url || ''
}

function getLocationText(loc: any): string {
  if (!loc) return ''
  if (typeof loc === 'string') return loc
  return [loc.area, loc.city].filter(Boolean).join(', ')
}

async function sendApprovalEmail(post: any, postId?: string | null) {
  const transporter = getEmailTransporter()
  if (!transporter) {
    console.warn('⚠️ Email not configured — skipping approval email')
    return
  }

  const userName = post.userName || 'User'
  const postTitle = post.title || 'Your Post'
  const location = getLocationText(post.location)
  const firstImage = getImageUrl(post.images?.[0])
  const emailFrom = process.env.EMAIL_FROM || `"Baytino" <${process.env.EMAIL_USER}>`

  await transporter.sendMail({
    from: emailFrom,
    to: post.userEmail,
    subject: '✅ Your post has been approved — Baytino',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#219ebc,#1a7a91);padding:40px;text-align:center;">
                  <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:32px;">✅</div>
                  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Post Approved!</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Baytino — Student Housing Egypt</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="margin:0 0 6px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Hello, ${userName}!</p>
                  <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:700;">Your listing is now live on Baytino</h2>
                  <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                    Great news! Your post has been reviewed and approved by our admin team. It is now visible to all users on the platform.
                  </p>

                  <!-- Post Card -->
                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                    ${firstImage ? `<img src="${firstImage}" alt="" style="width:100%;height:200px;object-fit:cover;display:block;">` : ''}
                    <div style="padding:16px 20px;">
                      <p style="margin:0 0 4px;font-weight:700;color:#0f172a;font-size:16px;">${postTitle}</p>
                      ${location ? `<p style="margin:0;color:#64748b;font-size:14px;">📍 ${location}</p>` : ''}
                    </div>
                  </div>

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:28px;">
                        <a href="${postId ? `${APP_URL}/properties/${postId}` : `${APP_URL}/properties`}"
                           style="display:inline-block;background:linear-gradient(135deg,#219ebc,#1a7a91);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;box-shadow:0 4px 14px rgba(33,158,188,0.35);">
                          View Your Post
                        </a>
                      </td>
                    </tr>
                  </table>

                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;color:#166534;font-size:14px;">
                      🎉 <strong>Congratulations!</strong> Students and property seekers can now find and contact you directly.
                    </p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:13px;">© ${new Date().getFullYear()} Baytino. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}

async function sendRejectionEmail(post: any, reason: string) {
  const transporter = getEmailTransporter()
  if (!transporter) {
    console.warn('⚠️ Email not configured — skipping rejection email')
    return
  }

  const userName = post.userName || 'User'
  const postTitle = post.title || 'Your Post'
  const emailFrom = process.env.EMAIL_FROM || `"Baytino" <${process.env.EMAIL_USER}>`

  await transporter.sendMail({
    from: emailFrom,
    to: post.userEmail,
    subject: '❌ Your post was not approved — Baytino',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;">
                  <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:32px;">❌</div>
                  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Post Not Approved</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Baytino — Student Housing Egypt</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="margin:0 0 6px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Hello, ${userName}!</p>
                  <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:700;">We could not approve your post</h2>
                  <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                    Unfortunately, your listing <strong>"${postTitle}"</strong> was reviewed and could not be approved at this time.
                  </p>

                  <!-- Reason -->
                  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
                    <p style="margin:0 0 6px;font-weight:700;color:#dc2626;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Reason for rejection:</p>
                    <p style="margin:0;color:#7f1d1d;font-size:15px;line-height:1.6;">${reason}</p>
                  </div>

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:28px;">
                        <a href="${APP_URL}/post"
                           style="display:inline-block;background:linear-gradient(135deg,#219ebc,#1a7a91);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;box-shadow:0 4px 14px rgba(33,158,188,0.35);">
                          Submit a New Post
                        </a>
                      </td>
                    </tr>
                  </table>

                  <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;color:#854d0e;font-size:14px;">
                      💡 <strong>What can I do?</strong> Please address the reason above and submit a new listing. If you believe this is a mistake, contact us at <a href="mailto:support@baytino.com" style="color:#219ebc;">support@baytino.com</a>.
                    </p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:13px;">© ${new Date().getFullYear()} Baytino. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}

// POST - Approve or reject a pending post (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any).role
    if (role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, reason } = body // action: 'approve' | 'reject', reason?: string

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    }

    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json({ success: false, message: 'Rejection reason is required' }, { status: 400 })
    }

    const posts = await readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    const post = posts[postIndex]
    const adminId = (session.user as any).id || session.user.email
    const adminName = session.user.name || session.user.email || 'Admin'
    const now = new Date().toISOString()

    if (action === 'approve') {
      // 1. Forward the post to the external backend
      let backendId: string | null = null
      try {
        const externalRes = await fetch(`${API_URL}/api/properties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY
              ? { 'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY }
              : {}),
          },
          body: JSON.stringify({
            ...post,
            status: 'active',
            // Remove local-only fields
            id: undefined,
            approved_by: undefined,
            approved_by_name: undefined,
            approved_at: undefined,
            rejectionReason: undefined,
          }),
        })

        const externalData = await externalRes.json()
        if (externalData.success && externalData.property?._id) {
          backendId = externalData.property._id
          console.log('✅ Post forwarded to backend:', backendId)
        } else {
          console.warn('⚠️ Backend forwarding returned:', externalData)
        }
      } catch (err) {
        console.error('⚠️ Backend forwarding failed (continuing):', err)
      }

      // 2. Update local post status
      posts[postIndex] = {
        ...post,
        status: 'approved',
        approved_by: adminId,
        approved_by_name: adminName,
        approved_at: now,
        backendId,
        updatedAt: now,
      }
      await writePosts(posts)

      // 3. Send approval email (with direct post link)
      const postId = backendId || post.id
      try {
        await sendApprovalEmail(post, postId)
        console.log('📧 Approval email sent to:', post.userEmail)
      } catch (emailErr) {
        console.error('⚠️ Approval email failed:', emailErr)
      }

      // 4. Write in-app notification for the user
      if (post.userEmail) {
        await writeServerNotification(
          post.userEmail,
          `✅ Your post "${post.title}" has been approved and is now live!`,
          'success',
          `/properties/${postId}`
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Post approved and published',
        post: posts[postIndex],
      })
    } else {
      // Reject
      posts[postIndex] = {
        ...post,
        status: 'rejected',
        rejectionReason: reason,
        approved_by: null,
        approved_by_name: null,
        approved_at: null,
        updatedAt: now,
      }
      await writePosts(posts)

      // Send rejection email
      try {
        await sendRejectionEmail(post, reason)
        console.log('📧 Rejection email sent to:', post.userEmail)
      } catch (emailErr) {
        console.error('⚠️ Rejection email failed:', emailErr)
      }

      // Write in-app notification for the user
      if (post.userEmail) {
        await writeServerNotification(
          post.userEmail,
          `❌ Your post "${post.title}" was not approved. Reason: ${reason}`,
          'error',
          '/post'
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Post rejected',
        post: posts[postIndex],
      })
    }
  } catch (error) {
    console.error('Approve/reject error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
