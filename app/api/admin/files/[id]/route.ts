// app/api/admin/files/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import FileModel from '@/models/File';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const file = await FileModel.findById(params.id);
    if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: file });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const body = await request.json();
    delete body._id;
    const file = await FileModel.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: file });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const file = await FileModel.findById(params.id);
    if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    await FileModel.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'File deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
