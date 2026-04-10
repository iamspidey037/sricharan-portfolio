// app/api/admin/export/route.ts
// Full portfolio export as JSON backup

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import SiteSettings from '@/models/SiteSettings';
import FileModel from '@/models/File';

export async function GET() {
  try {
    await connectDB();

    const [sections, settings, files] = await Promise.all([
      Section.find({ status: { $ne: 'trash' } }).lean(),
      SiteSettings.findOne().select('-smtpPassEncrypted').lean(),
      FileModel.find().lean(),
    ]);

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sections,
      settings,
      files: files.map(f => ({
        ...f,
        // Don't include actual file data, just metadata + URL
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('[Export]', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
