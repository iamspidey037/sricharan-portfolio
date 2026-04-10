// app/api/public/sections/route.ts
// Public API — returns only PUBLIC sections (no auth required)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const featured = searchParams.get('featured') === 'true';
    const parentId = searchParams.get('parentId');

    const query: Record<string, unknown> = {
      visibility: 'public',
      status: 'published',
    };

    if (type) query.type = type;
    if (featured) query.isFeatured = true;
    if (parentId === 'null' || parentId === '') {
      query.parentSection = null;
    } else if (parentId) {
      query.parentSection = parentId;
    }

    const sections = await Section.find(query)
      .select('-versions -sharedLink -customFields')
      .sort({ isPinned: -1, order: 1 })
      .lean();

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('[Public/Sections]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sections' }, { status: 500 });
  }
}
