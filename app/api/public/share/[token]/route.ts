// app/api/public/share/[token]/route.ts
// Public endpoint to access content via a secret shareable link

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import bcrypt from 'bcryptjs';

type Params = { params: { token: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const section = await Section.findOne({
      'sharedLink.token': params.token,
      visibility: 'shared',
      status: 'published',
    }).select('-versions');

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Link not found or has been revoked' },
        { status: 404 }
      );
    }

    // Check expiry
    if (section.sharedLink?.expiresAt && section.sharedLink.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This link has expired', code: 'EXPIRED' },
        { status: 410 }
      );
    }

    // If password-protected, require password in query
    if (section.sharedLink?.password) {
      return NextResponse.json(
        { success: false, error: 'Password required', code: 'PASSWORD_REQUIRED' },
        { status: 403 }
      );
    }

    // Increment view count
    await Section.findByIdAndUpdate(section._id, {
      $inc: { 'sharedLink.viewCount': 1 },
      $set: { 'sharedLink.lastAccessedAt': new Date() },
    });

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error('[Share/GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch shared content' }, { status: 500 });
  }
}

// POST — verify password for password-protected links
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { password } = await request.json();

    const section = await Section.findOne({
      'sharedLink.token': params.token,
      visibility: 'shared',
    }).select('+sharedLink.password -versions');

    if (!section) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    if (section.sharedLink?.expiresAt && section.sharedLink.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Link has expired', code: 'EXPIRED' }, { status: 410 });
    }

    if (!section.sharedLink?.password) {
      return NextResponse.json({ success: false, error: 'No password required' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, section.sharedLink.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    // Increment view count
    await Section.findByIdAndUpdate(section._id, {
      $inc: { 'sharedLink.viewCount': 1 },
      $set: { 'sharedLink.lastAccessedAt': new Date() },
    });

    // Return section without password hash
    const sectionObj = section.toObject();
    if (sectionObj.sharedLink) {
      delete (sectionObj.sharedLink as Record<string, unknown>).password;
    }

    return NextResponse.json({ success: true, data: sectionObj });
  } catch (error) {
    console.error('[Share/POST]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
