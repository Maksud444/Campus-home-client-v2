import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') || formData.get('video')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Determine if it's an image or video
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, message: 'Only images and videos are allowed' },
        { status: 400 }
      )
    }

    // Check file size
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `File size must be less than ${isImage ? '5MB' : '50MB'}` },
        { status: 400 }
      )
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', isImage ? 'images' : 'videos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = path.join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/${isImage ? 'images' : 'videos'}/${filename}`

    console.log(`✅ ${isImage ? 'Image' : 'Video'} uploaded:`, url)

    return NextResponse.json({
      success: true,
      url,
      message: `${isImage ? 'Image' : 'Video'} uploaded successfully`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
}