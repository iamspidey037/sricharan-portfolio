// app/api/admin/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import ContactMessage from '@/models/ContactMessage';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const isRead = searchParams.get('isRead');
    const isStarred = searchParams.get('isStarred');
    const isArchived = searchParams.get('isArchived');

    const query: Record<string, unknown> = {};
    if (isRead !== null && isRead !== '') query.isRead = isRead === 'true';
    if (isStarred === 'true') query.isStarred = true;
    if (isArchived === 'true') query.isArchived = true;
    else if (!isArchived) query.isArchived = { $ne: true };

    const [messages, total] = await Promise.all([
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(query),
    ]);

    const unreadCount = await ContactMessage.countDocuments({ isRead: false, isArchived: { $ne: true } });

    return NextResponse.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[Messages/GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}
