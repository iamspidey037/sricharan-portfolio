// app/api/admin/sections/[id]/share/route.ts
// Generate / revoke shareable secret links for SHARED visibility sections

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

type Params = { params: { id: string } };

// POST — generate or refresh share link
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const body = await request.json();
    const { password, expiresInDays } = body;

    const section = await Section.findById(params.id);
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    // Generate unique token
    const token = nanoid(32);

    const sharedLink: Record<string, unknown> = {
      token,
      viewCount: 0,
      createdAt: new Date(),
    };

    if (password) {
      sharedLink.password = await bcrypt.hash(password, 10);
    }

    if (expiresInDays) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(expiresInDays));
      sharedLink.expiresAt = expiry;
    }

    section.sharedLink = sharedLink as typeof section.sharedLink;
    section.visibility = 'shared';
    await section.save();

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${token}`;

    return NextResponse.json({
      success: true,
      data: {
        token,
        shareUrl,
        expiresAt: sharedLink.expiresAt || null,
        hasPassword: !!password,
      },
    });
  } catch (error) {
    console.error('[Share/POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to generate share link' }, { status: 500 });
  }
}

// DELETE — revoke share link
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    await Section.findByIdAndUpdate(params.id, {
      $unset: { sharedLink: 1 },
    });
    return NextResponse.json({ success: true, message: 'Share link revoked' });
  } catch (error) {
    console.error('[Share/DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to revoke share link' }, { status: 500 });
  }
}
