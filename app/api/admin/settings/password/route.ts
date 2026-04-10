// app/api/admin/settings/password/route.ts
// Change admin password endpoint

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';

function validatePasswordStrength(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) && /[a-z]/.test(password) &&
    /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const adminId = request.headers.get('x-admin-id');
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both passwords are required' }, { status: 400 });
    }

    if (!validatePasswordStrength(newPassword)) {
      return NextResponse.json({ success: false, error: 'New password does not meet strength requirements' }, { status: 400 });
    }

    const admin = await Admin.findById(adminId).select('+passwordHash');
    if (!admin) return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    await ActivityLog.create({
      action: 'setting_change',
      targetType: 'admin',
      targetTitle: 'Password changed',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[Password/POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 });
  }
}
