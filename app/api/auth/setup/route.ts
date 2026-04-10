// app/api/auth/setup/route.ts
// First-time setup: creates the admin account and default site settings.
// This route becomes DISABLED after an admin account exists.

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongoose';
import Admin from '@/models/Admin';
import SiteSettings from '@/models/SiteSettings';

// Password strength validation
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

// GET: Check if setup is needed
export async function GET() {
  try {
    await connectDB();
    const adminCount = await Admin.countDocuments();
    return NextResponse.json({
      success: true,
      data: { setupNeeded: adminCount === 0 },
    });
  } catch (error) {
    console.error('[Setup/GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// POST: Create first admin account
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Security: Prevent creating multiple admins via this endpoint
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Setup already completed. Admin account exists.' },
        { status: 403 }
      );
    }

    let body: {
      username?: string;
      password?: string;
      email?: string;
      displayName?: string;
      siteTitle?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { username, password, email, displayName, siteTitle } = body;

    // Validate required fields
    if (!username || !password || !email) {
      return NextResponse.json(
        { success: false, error: 'Username, password, and email are required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_]{3,30}$/.test(username.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Username must be 3-30 characters, only letters, numbers, underscores' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: passwordCheck.message },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Hash password with 12 salt rounds (OWASP recommended)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await Admin.create({
      username: username.toLowerCase(),
      passwordHash,
      email: email.toLowerCase(),
      displayName: displayName || 'Sri Charan',
    });

    // Create default site settings
    const settingsCount = await SiteSettings.countDocuments();
    if (settingsCount === 0) {
      await SiteSettings.create({
        siteTitle: siteTitle || 'Sri Charan | ECE & Embedded AI',
        contactEmail: email.toLowerCase(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully! You can now log in.',
      data: {
        username: admin.username,
        displayName: admin.displayName,
      },
    });

  } catch (error: unknown) {
    console.error('[Setup/POST] Error:', error);
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
