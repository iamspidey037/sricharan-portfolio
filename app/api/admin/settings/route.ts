// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    if (!settings) {
      const newSettings = await SiteSettings.create({});
      return NextResponse.json({ success: true, data: newSettings });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('[Settings/GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    delete body._id;
    delete body.__v;
    delete body.smtpPassEncrypted;

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('[Settings/PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
