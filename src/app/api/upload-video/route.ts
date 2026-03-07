import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename, contentType, fileSize } = await request.json()

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 })
  }

  if (!contentType.startsWith('video/')) {
    return NextResponse.json({ error: 'Only video files are allowed' }, { status: 400 })
  }

  const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500 MB
  if (fileSize && fileSize > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: 'Video must be less than 500MB' }, { status: 400 })
  }

  const ext = filename.split('.').pop()?.toLowerCase() || 'mp4'
  const key = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
  const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ presignedUrl, publicUrl })
}
