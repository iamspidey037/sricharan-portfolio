// app/api/admin/sections/route.ts
// Admin API for sections: GET list (with tree), POST create

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import ActivityLog from '@/models/ActivityLog';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

// ── GET: List all sections (tree structure) ──────────────────
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const flat = searchParams.get('flat') === 'true';
    const status = searchParams.get('status');       // filter by status
    const visibility = searchParams.get('visibility');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};

    if (parentId === 'null' || parentId === '') {
      query.parentSection = null;
    } else if (parentId) {
      query.parentSection = parentId;
    }

    if (status) query.status = status;
    if (visibility) query.visibility = visibility;
    if (type) query.type = type;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const sections = await Section.find(query)
      .select('-content -versions')   // Exclude large fields in list view
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (flat) {
      return NextResponse.json({ success: true, data: sections });
    }

    // Build tree structure for root-level request
    if (!parentId || parentId === 'null') {
      const allSections = await Section.find({
        status: { $ne: 'trash' }
      })
        .select('-content -versions')
        .sort({ order: 1 })
        .lean();

      const tree = buildTree(allSections);
      return NextResponse.json({ success: true, data: tree });
    }

    return NextResponse.json({ success: true, data: sections });

  } catch (error) {
    console.error('[Sections/GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sections' }, { status: 500 });
  }
}

// ── POST: Create new section ─────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title, type = 'item', parentSection = null,
      visibility = 'private', status = 'draft',
      icon, description, content, techStack, tags,
      projectStatus, customFields, skillCategories,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(title.trim(), { lower: true, strict: true });
    const existingCount = await Section.countDocuments({
      slug: new RegExp(`^${slug}(-[0-9]+)?$`),
      parentSection: parentSection || null,
    });
    if (existingCount > 0) {
      slug = `${slug}-${nanoid(4)}`;
    }

    // Find the max order at this level to append at end
    const maxOrderDoc = await Section.findOne({ parentSection: parentSection || null })
      .sort({ order: -1 })
      .select('order');
    const order = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const section = await Section.create({
      title: title.trim(),
      slug,
      type,
      parentSection: parentSection || null,
      visibility,
      status,
      order,
      icon: icon || getDefaultIcon(type),
      description: description?.trim(),
      content,
      techStack: techStack || [],
      tags: tags || [],
      projectStatus,
      customFields: customFields || [],
      skillCategories: skillCategories || [],
    });

    // Log activity
    const adminId = request.headers.get('x-admin-id');
    await ActivityLog.create({
      action: 'create',
      targetType: 'section',
      targetId: section._id.toString(),
      targetTitle: section.title,
      details: `Created ${type} section "${title}"`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Section created', data: section },
      { status: 201 }
    );

  } catch (error) {
    console.error('[Sections/POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create section' }, { status: 500 });
  }
}

// ── Helper: Build tree from flat array ──────────────────────
function buildTree(sections: unknown[]): unknown[] {
  const map = new Map<string, unknown & { children: unknown[] }>();
  const roots: unknown[] = [];

  // First pass: create map
  for (const section of sections as Array<Record<string, unknown>>) {
    map.set(section._id.toString(), { ...section, children: [] });
  }

  // Second pass: build tree
  for (const section of sections as Array<Record<string, unknown>>) {
    const node = map.get(section._id.toString())!;
    if (!section.parentSection) {
      roots.push(node);
    } else {
      const parent = map.get(section.parentSection.toString());
      if (parent) {
        (parent as Record<string, unknown[]>).children.push(node);
      }
    }
  }

  // Sort children by order
  const sortChildren = (nodes: unknown[]) => {
    (nodes as Array<Record<string, unknown>>).sort((a, b) => (a.order as number) - (b.order as number));
    for (const node of nodes as Array<{ children: unknown[] }>) {
      if (node.children.length > 0) sortChildren(node.children);
    }
  };

  sortChildren(roots);
  return roots;
}

// ── Helper: Default icon per section type ───────────────────
function getDefaultIcon(type: string): string {
  const icons: Record<string, string> = {
    folder: '📁', item: '📄', page: '📃', gallery: '🖼️',
    timeline: '📅', list: '📋', hero: '🏠', about: '👤',
    skills: '🛠️', projects: '📂', internships: '💼',
    certifications: '📜', blog: '✍️', contact: '📬', custom: '⚙️',
  };
  return icons[type] || '📄';
}
