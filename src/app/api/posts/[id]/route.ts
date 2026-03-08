import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json')
const NOTIF_FILE = path.join(process.cwd(), 'data', 'notifications.json')
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://baytino.com'

function readPosts() {
  try {
    if (!fs.existsSync(POSTS_FILE)) return []
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'))
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

function writePosts(posts: any[]) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))
  } catch (error) {
    console.error('Error writing posts:', error)
  }
}

function writeServerNotification(email: string, message: string, type: 'success' | 'error' | 'info', link?: string) {
  try {
    let all: Record<string, any[]> = {}
    try { all = JSON.parse(fs.readFileSync(NOTIF_FILE, 'utf-8')) } catch { /* empty */ }
    if (!all[email]) all[email] = []
    all[email].unshift({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      message, type, read: false, createdAt: new Date().toISOString(), link,
    })
    all[email] = all[email].slice(0, 50)
    const dir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(NOTIF_FILE, JSON.stringify(all, null, 2))
  } catch { /* ignore */ }
}

async function sendDeleteEmail(post: any) {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  if (!emailUser || !emailPass || !post.userEmail) return
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass.replace(/\s/g, '') },
    })
    const emailFrom = process.env.EMAIL_FROM || `"Baytino" <${emailUser}>`
    const userName = post.userName || 'User'
    const postTitle = post.title || 'Your Post'
    await transporter.sendMail({
      from: emailFrom,
      to: post.userEmail,
      subject: '🗑️ Your post has been deleted — Baytino',
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
                <tr><td style="background:linear-gradient(135deg,#64748b,#475569);padding:40px;text-align:center;">
                  <div style="font-size:40px;margin-bottom:12px;">🗑️</div>
                  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Post Deleted</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Baytino — Student Housing Egypt</p>
                </td></tr>
                <tr><td style="padding:36px 40px;">
                  <p style="margin:0 0 6px;color:#64748b;font-size:13px;text-transform:uppercase;font-weight:600;">Hello, ${userName}!</p>
                  <p style="margin:0 0 16px;color:#0f172a;font-size:17px;font-weight:700;">Your post has been deleted</p>
                  <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                    Your listing <strong>"${postTitle}"</strong> has been removed from Baytino.
                    If you believe this was a mistake, please contact us at
                    <a href="mailto:support@baytino.com" style="color:#219ebc;">support@baytino.com</a>.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding-bottom:24px;">
                      <a href="${APP_URL}/post" style="display:inline-block;background:linear-gradient(135deg,#219ebc,#1a7a91);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;">
                        Post Again
                      </a>
                    </td></tr>
                  </table>
                </td></tr>
                <tr><td style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:13px;">© ${new Date().getFullYear()} Baytino. All rights reserved.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      `,
    })
    console.log('📧 Delete email sent to:', post.userEmail)
  } catch (err) {
    console.error('⚠️ Delete email failed:', err)
  }
}

// GET - Get single post and increment view
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    posts[postIndex].views = (posts[postIndex].views || 0) + 1
    writePosts(posts)

    return NextResponse.json({ success: true, post: posts[postIndex] })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch post' }, { status: 500 })
  }
}

// PUT - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    if (posts[postIndex].userEmail !== session.user.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Not your post' }, { status: 403 })
    }

    posts[postIndex] = { ...posts[postIndex], ...body, updatedAt: new Date().toISOString() }
    writePosts(posts)

    return NextResponse.json({ success: true, message: 'Post updated successfully', post: posts[postIndex] })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ success: false, message: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    const isAdmin = (session.user as any).role === 'admin'
    if (posts[postIndex].userEmail !== session.user.email && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Not your post' }, { status: 403 })
    }

    const deletedPost = posts[postIndex]

    // Delete post
    posts.splice(postIndex, 1)
    writePosts(posts)

    console.log('✅ Post deleted:', params.id)

    // Notify the post owner (only if deleted by admin, not by the owner themselves)
    if (isAdmin && deletedPost.userEmail && deletedPost.userEmail !== session.user.email) {
      writeServerNotification(
        deletedPost.userEmail,
        `🗑️ Your post "${deletedPost.title}" has been deleted by admin.`,
        'error',
        '/post'
      )
      sendDeleteEmail(deletedPost).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete post' }, { status: 500 })
  }
}
