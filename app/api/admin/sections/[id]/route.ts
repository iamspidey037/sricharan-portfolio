// app/api/admin/sections/[id]/route.ts
// GET single section, PUT update, DELETE (soft)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import ActivityLog from '@/models/ActivityLog';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

type Params = { params: { id: string } };

// ── GET single section ───────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const section = await Section.findById(params.id);
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error('[Section/GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch section' }, { status: 500 });
  }
}

// ── PUT update section ───────────────────────────────────────
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const body = await request.json();

    const section = await Section.findById(params.id);
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    // Save version snapshot before updating (if content changed)
    if (body.content && body.content !== section.content) {
      const versions = section.versions || [];
      versions.push({
        versionNumber: (section.currentVersion || 1),
        content: section.content || '',
        savedAt: new Date(),
        note: 'Auto-saved before edit',
      });
      // Keep last 20
      if (versions.length > 20) versions.splice(0, versions.length - 20);
      body.versions = versions;
      body.currentVersion = (section.currentVersion || 1) + 1;
      body.lastAutoSaveAt = new Date();
    }

    // Prevent direct override of critical fields
    delete body._id;
    delete body.slug; // Slug changes separately to avoid broken links
    delete body.createdAt;

    // Handle publish status change
    if (body.status === 'published' && !section.publishedAt) {
      body.publishedAt = new Date();
    }

    const updated = await Section.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      action: 'edit',
      targetType: 'section',
      targetId: params.id,
      targetTitle: updated?.title,
      details: `Updated section "${updated?.title}"`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Section/PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update section' }, { status: 500 });
  }
}

// ── DELETE section (soft delete → trash) ────────────────────
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const section = await Section.findById(params.id);
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    if (permanent) {
      // Permanent delete — also delete all children recursively
      await deleteRecursive(params.id);
    } else {
      // Soft delete — move to trash
      await Section.findByIdAndUpdate(params.id, {
        status: 'trash',
        deletedAt: new Date(),
      });
    }

    await ActivityLog.create({
      action: 'delete',
      targetType: 'section',
      targetId: params.id,
      targetTitle: section.title,
      details: permanent ? 'Permanently deleted' : 'Moved to trash',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: permanent ? 'Permanently deleted' : 'Moved to trash',
    });
  } catch (error) {
    console.error('[Section/DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete section' }, { status: 500 });
  }
}

// ── Helper: Recursive delete all children ───────────────────
async function deleteRecursive(sectionId: string): Promise<void> {
  const children = await Section.find({ parentSection: sectionId }).select('_id');
  for (const child of children) {
    await deleteRecursive(child._id.toString());
  }
  await Section.findByIdAndDelete(sectionId);
}
