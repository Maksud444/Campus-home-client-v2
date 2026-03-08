import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let file: File | null = null
    try {
      const formData = await request.formData()
      file = formData.get('file') as File | null
    } catch (e: any) {
      return NextResponse.json({ error: `Failed to parse upload: ${e?.message}` }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Only video files are allowed' }, { status: 400 })
    }

    const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200 MB
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Video must be less than 200MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'webm'
    const key = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    let buffer: Buffer
    try {
      buffer = Buffer.from(await file.arrayBuffer())
    } catch (e: any) {
      return NextResponse.json({ error: `Failed to read file: ${e?.message}` }, { status: 500 })
    }

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      ContentType: file.type,
      Body: buffer,
    })

    await r2.send(command)

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ url: publicUrl })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}
