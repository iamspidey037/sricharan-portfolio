// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import FileModel from '@/models/File';
import ContactMessage from '@/models/ContactMessage';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'stats') {
      const [
        totalSections, publishedSections, draftSections,
        totalFiles, storageResult, unreadMessages,
      ] = await Promise.all([
        Section.countDocuments({ status: { $ne: 'trash' } }),
        Section.countDocuments({ status: 'published' }),
        Section.countDocuments({ status: 'draft' }),
        FileModel.countDocuments(),
        FileModel.aggregate([{ $group: { _id: null, total: { $sum: '$fileSizeBytes' } } }]),
        ContactMessage.countDocuments({ isRead: false, isArchived: { $ne: true } }),
      ]);

      const storageMB = storageResult[0]?.total
        ? (storageResult[0].total / (1024 * 1024)).toFixed(1)
        : '0';

      return NextResponse.json({
        success: true,
        data: {
          totalSections, publishedSections, draftSections,
          totalFiles, storageMB: parseFloat(storageMB),
          unreadMessages, totalPageViews: 0,
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('[Analytics]', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
