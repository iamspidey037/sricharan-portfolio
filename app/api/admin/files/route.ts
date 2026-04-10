// app/api/admin/files/route.ts
// File upload and listing API
// Supports Cloudinary (images/video) and local storage (code files, docs)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import FileModel from '@/models/File';
import { nanoid } from 'nanoid';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types (extensive list for ECE portfolio)
const ALLOWED_TYPES: Record<string, string> = {
  // Images
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/bmp': 'bmp',
  // Documents
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt', 'text/csv': 'csv',
  // Code files
  'text/x-c': 'c', 'text/x-c++src': 'cpp', 'text/x-python': 'py',
  'application/x-arduino': 'ino', 'text/javascript': 'js',
  'application/json': 'json', 'text/yaml': 'yaml', 'text/xml': 'xml',
  'application/x-sh': 'sh', 'text/markdown': 'md',
  // Archives
  'application/zip': 'zip', 'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z', 'application/gzip': 'gz',
  // Video
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  // Audio
  'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg',
};

// Determine storage provider per file type
function getStorageProvider(mimeType: string): 'cloudinary' | 'local' {
  if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
    return process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local';
  }
  return 'local'; // Code files, PDFs, docs → local or secure storage
}

// ── GET: List files ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const fileType = searchParams.get('fileType');
    const visibility = searchParams.get('visibility');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = {};
    if (sectionId) query.parentSectionId = sectionId;
    if (fileType) query.fileType = fileType;
    if (visibility) query.visibility = visibility;

    const [files, total] = await Promise.all([
      FileModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      FileModel.countDocuments(query),
    ]);

    // Storage stats
    const storageResult = await FileModel.aggregate([
      { $group: { _id: null, totalBytes: { $sum: '$fileSizeBytes' } } }
    ]);
    const totalStorageBytes = storageResult[0]?.totalBytes || 0;

    return NextResponse.json({
      success: true,
      data: files,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      storageStats: {
        totalBytes: totalStorageBytes,
        totalMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
      },
    });
  } catch (error) {
    console.error('[Files/GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch files' }, { status: 500 });
  }
}

// ── POST: Upload file ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sectionId = formData.get('sectionId') as string;
    const visibility = (formData.get('visibility') as string) || 'private';
    const caption = formData.get('caption') as string;
    const altText = formData.get('altText') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type (check MIME type, not just extension)
    const mimeType = file.type || 'application/octet-stream';
    const extension = ALLOWED_TYPES[mimeType];

    // For text/* types, also check extension
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['c', 'cpp', 'h', 'py', 'ino', 'v', 'vhd', 'vhdl',
      's', 'asm', 'ts', 'json', 'xml', 'yaml', 'yml', 'sh', 'm', 'ipynb',
      'md', 'txt', 'csv', 'kicad_pcb', 'brd', 'sch', 'stl', 'step'];

    if (!extension && !allowedExtensions.includes(originalExtension)) {
      return NextResponse.json(
        { success: false, error: `File type "${mimeType}" is not allowed` },
        { status: 400 }
      );
    }

    const fileExtension = extension || originalExtension;
    const storageProvider = getStorageProvider(mimeType);

    // Generate unique filename
    const uniqueId = nanoid(12);
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uniqueId}_${sanitizedOriginalName}`;

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let fileUrl = '';
    let thumbnailUrl = '';
    let cloudinaryPublicId = '';

    if (storageProvider === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, fileName, mimeType);
      fileUrl = result.secure_url;
      thumbnailUrl = result.thumbnail_url || '';
      cloudinaryPublicId = result.public_id;
    } else {
      // Save to local /uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;

      // Generate thumbnail URL for images
      if (mimeType.startsWith('image/')) {
        thumbnailUrl = fileUrl; // Same for local
      }
    }

    // Save file record to DB
    const fileRecord = await FileModel.create({
      fileName,
      originalName: file.name,
      fileType: fileExtension,
      mimeType,
      fileSizeBytes: file.size,
      url: fileUrl,
      thumbnailUrl: thumbnailUrl || undefined,
      storageProvider,
      cloudinaryPublicId: cloudinaryPublicId || undefined,
      parentSectionId: sectionId || undefined,
      visibility,
      caption: caption || undefined,
      altText: altText || undefined,
    });

    return NextResponse.json(
      { success: true, message: 'File uploaded successfully', data: fileRecord },
      { status: 201 }
    );

  } catch (error) {
    console.error('[Files/POST]', error);
    return NextResponse.json({ success: false, error: 'File upload failed' }, { status: 500 });
  }
}

// ── Cloudinary upload helper ────────────────────────────────
async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ secure_url: string; thumbnail_url?: string; public_id: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const formData = new FormData();
  const blob = new Blob([buffer], { type: mimeType });
  formData.append('file', blob, fileName);
  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'portfolio_uploads');
  formData.append('folder', 'portfolio');

  const resourceType = mimeType.startsWith('video/') ? 'video' : 'image';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, { method: 'POST', body: formData });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    secure_url: result.secure_url,
    thumbnail_url: result.eager?.[0]?.secure_url,
    public_id: result.public_id,
  };
}
