// app/api/admin/settings/export/route.ts
// Export entire portfolio as JSON backup

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await connectDB();

    const [sections, settings] = await Promise.all([
      Section.find({ status: { $ne: 'trash' } }).lean(),
      SiteSettings.findOne().lean(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      sections,
      settings,
    };

    const json = JSON.stringify(backup, null, 2);
    const bytes = Buffer.from(json, 'utf-8');

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="portfolio-backup-${Date.now()}.json"`,
        'Content-Length': bytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('[Export]', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
