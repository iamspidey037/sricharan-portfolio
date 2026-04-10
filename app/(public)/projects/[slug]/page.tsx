// app/(public)/projects/[slug]/page.tsx
// Individual project detail page

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import Navbar from '@/components/public/layout/Navbar';
import Footer from '@/components/public/layout/Footer';
import SiteSettings from '@/models/SiteSettings';
import { ArrowLeft, Github, ExternalLink, Cpu, Clock, Users, Tag } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

type Props = { params: { slug: string } };

async function getProject(slug: string) {
  await connectDB();
  return Section.findOne({
    slug,
    visibility: 'public',
    status: 'published',
  })
    .select('-versions -sharedLink')
    .lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: 'Project Not Found' };
  const p = project as Record<string, unknown>;
  return {
    title: p.title as string,
    description: (p.metaDescription as string) || (p.description as string),
    openGraph: { images: p.ogImageUrl ? [p.ogImageUrl as string] : [] },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const [project, settings] = await Promise.all([
    getProject(params.slug),
    connectDB().then(() => SiteSettings.findOne().lean()),
  ]);

  if (!project) notFound();
  const p = project as Record<string, unknown>;
  const aiMetrics = p.aiMetrics as Record<string, unknown> | undefined;
  const externalLinks = p.externalLinks as Array<{label: string; url: string; type: string}> | undefined;
  const teamMembers = p.teamMembers as Array<{name: string; role: string; linkedinUrl?: string}> | undefined;

  return (
    <>
      <Navbar settings={settings as Record<string, unknown>} />
      <main className="bg-circuit min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-content mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/#projects" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Projects
            </Link>
            <span>/</span>
            <span className="text-text-primary">{p.title as string}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {p.icon && <span className="text-3xl">{p.icon as string}</span>}
                  {p.projectStatus && (
                    <span className={`text-xs px-3 py-1 rounded-full font-mono font-medium
                      ${p.projectStatus === 'completed' ? 'badge-completed' :
                        p.projectStatus === 'in_progress' ? 'badge-in-progress' : 'badge-planned'}`}>
                      {p.projectStatus === 'completed' ? '✅ Completed' :
                       p.projectStatus === 'in_progress' ? '🔄 In Progress' : '📋 Planned'}
                    </span>
                  )}
                  {aiMetrics && (
                    <span className="text-xs px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-mono flex items-center gap-1">
                      <Cpu size={10} /> AI/ML Project
                    </span>
                  )}
                </div>
                <h1 className="font-heading font-black text-3xl md:text-4xl text-text-primary mb-3">
                  {p.title as string}
                </h1>
                {p.description && (
                  <p className="text-text-secondary text-lg leading-relaxed">{p.description as string}</p>
                )}
              </div>

              {/* AI Metrics */}
              {aiMetrics && (
                <div className="card p-5">
                  <h2 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Cpu size={16} className="text-accent" /> AI/ML Performance Metrics
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Accuracy', value: `${aiMetrics.accuracy}%`, color: '#00FF88' },
                      { label: 'Model Size', value: `${aiMetrics.modelSizeKB}KB`, color: '#00D4FF' },
                      { label: 'Inference', value: `${aiMetrics.inferenceTimeMs}ms`, color: '#FF6B35' },
                      { label: 'Framework', value: aiMetrics.framework as string, color: '#FFD60A' },
                    ].filter(m => m.value && m.value !== 'undefinedms' && m.value !== 'undefined%').map(m => (
                      <div key={m.label} className="text-center p-3 bg-surface-2 rounded-lg">
                        <div className="text-lg font-heading font-bold" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-xs text-text-muted mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {aiMetrics.targetHardware && (
                    <p className="text-xs text-text-muted mt-3">
                      🎯 Target hardware: <span className="text-primary font-mono">{aiMetrics.targetHardware as string}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Rich text content */}
              {p.content && (
                <div
                  className="card p-6 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: p.content as string }}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Tech stack */}
              {Array.isArray(p.techStack) && (p.techStack as string[]).length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-primary" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.techStack as string[]).map(t => (
                      <span key={t} className="tech-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* External links */}
              {externalLinks && externalLinks.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary mb-3">Links</h3>
                  <div className="space-y-2">
                    {externalLinks.map(link => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                        {link.type === 'github' ? <Github size={14} /> : <ExternalLink size={14} />}
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Team */}
              {teamMembers && teamMembers.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Users size={14} className="text-secondary" /> Team
                  </h3>
                  <div className="space-y-2">
                    {teamMembers.map(m => (
                      <div key={m.name} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="text-sm text-text-primary">{m.name}</p>
                          <p className="text-xs text-text-muted">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(p.tags) && (p.tags as string[]).length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.tags as string[]).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings as Record<string, unknown>} />
    </>
  );
}
