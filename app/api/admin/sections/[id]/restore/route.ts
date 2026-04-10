// app/api/admin/sections/[id]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import ActivityLog from '@/models/ActivityLog';

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const section = await Section.findOneAndUpdate(
      { _id: params.id, status: 'trash' },
      {
        $set: { status: 'draft' },
        $unset: { deletedAt: 1 },
      },
      { new: true }
    );

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found in trash' },
        { status: 404 }
      );
    }

    await ActivityLog.create({
      action: 'restore',
      targetType: 'section',
      targetId: section._id.toString(),
      targetTitle: section.title,
      details: `Restored from trash`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error('[Restore]', error);
    return NextResponse.json({ success: false, error: 'Failed to restore' }, { status: 500 });
  }
}
