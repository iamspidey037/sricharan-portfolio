// app/api/admin/sections/[id]/reorder/route.ts
// Reorder sections via drag-and-drop

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';

type Params = { params: { id: string } };

// PUT /api/admin/sections/:id/reorder
// Body: { orderedIds: string[] } — all sibling IDs in new order
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderedIds array is required' },
        { status: 400 }
      );
    }

    // Bulk update order values
    const updates = orderedIds.map((id: string, index: number) =>
      Section.findByIdAndUpdate(id, { order: index }, { new: false })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('[Section/Reorder]', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder' }, { status: 500 });
  }
}
