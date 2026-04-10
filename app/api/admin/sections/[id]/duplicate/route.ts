// app/api/admin/sections/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

type Params = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const original = await Section.findById(params.id).lean();
    if (!original) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    // Create a duplicate with modified title and new slug
    const newTitle = `${(original as Record<string, unknown>).title} (Copy)`;
    const baseSlug = slugify(newTitle, { lower: true, strict: true });
    const newSlug = `${baseSlug}-${nanoid(4)}`;

    const { _id, createdAt, updatedAt, sharedLink, ...rest } = original as Record<string, unknown>;

    const duplicate = await Section.create({
      ...rest,
      title: newTitle,
      slug: newSlug,
      status: 'draft',
      visibility: 'private',
      isPinned: false,
      isFeatured: false,
      versions: [],
      currentVersion: 1,
      order: ((rest.order as number) || 0) + 1,
    });

    return NextResponse.json({ success: true, data: duplicate }, { status: 201 });
  } catch (error) {
    console.error('[Duplicate]', error);
    return NextResponse.json({ success: false, error: 'Failed to duplicate' }, { status: 500 });
  }
}
