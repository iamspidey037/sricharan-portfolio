import { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import Section from "@/models/Section";
import Navbar from "@/components/public/layout/Navbar";
import Footer from "@/components/public/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Calendar, Cpu, Target, Zap, Database } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;
interface Props { params: { slug: string } }

async function getProject(slug: string) {
  try {
    await connectDB();
    return await Section.findOne({ slug, visibility: "public", status: "published" }).lean();
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "Project Not Found" };
  const p = project as Record<string, unknown>;
  return { title: String(p.title ?? ""), description: String(p.description ?? "") };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject(params.slug);
  if (!project) notFound();
  const p = project as Record<string, unknown>;

  const aiMetrics = p.aiMetrics as Record<string, unknown> | undefined;
  const externalLinks = (p.externalLinks as Array<{ label: string; url: string; type: string }>) || [];
  const techStack = (p.techStack as string[]) || [];
  const hardwareComponents = (p.hardwareComponents as string[]) || [];
  const keyLearnings = (p.keyLearnings as string[]) || [];
  const tags = (p.tags as string[]) || [];

  const icon = p.icon ? String(p.icon) : null;
  const title = String(p.title ?? "");
  const description = p.description ? String(p.description) : null;
  const content = p.content ? String(p.content) : null;
  const challenges = p.challenges ? String(p.challenges) : null;

  const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    completed:   { label: "✅ Completed",   cls: "badge-completed" },
    in_progress: { label: "🔄 In Progress", cls: "badge-in-progress" },
    planned:     { label: "📋 Planned",     cls: "badge-planned" },
    on_hold:     { label: "⏸️ On Hold",     cls: "badge-planned" },
  };
  const statusInfo = STATUS_MAP[String(p.projectStatus ?? "")] ?? null;

  return (
    <>
      <Navbar settings={null} />
      <main className="bg-circuit min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-content mx-auto">
          <Link href="/#projects" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm mb-8">
            <ArrowLeft size={15} /> Back to Projects
          </Link>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                {icon && <span className="text-3xl mb-3 block">{icon}</span>}
                <h1 className="font-heading font-black text-3xl text-text-primary mb-3">{title}</h1>
                {description && <p className="text-text-secondary text-lg">{description}</p>}
                <div className="flex flex-wrap gap-3 mt-4">
                  {statusInfo && (
                    <span className={`text-sm px-3 py-1 rounded-full font-mono font-medium ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  )}
                  {p.startDate && (
                    <span className="flex items-center gap-1.5 text-sm text-text-muted">
                      <Calendar size={13} />
                      {new Date(String(p.startDate)).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {aiMetrics && (
                <div className="card p-6">
                  <h3 className="font-heading font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Cpu size={16} className="text-primary" /> AI / ML Metrics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {aiMetrics.accuracy && (
                      <div className="card p-3 text-center">
                        <Target size={16} className="text-secondary mx-auto mb-1" />
                        <div className="text-xl font-heading font-black text-secondary">{Number(aiMetrics.accuracy)}%</div>
                        <div className="text-xs text-text-muted">Accuracy</div>
                      </div>
                    )}
                    {aiMetrics.inferenceTimeMs && (
                      <div className="card p-3 text-center">
                        <Zap size={16} className="text-primary mx-auto mb-1" />
                        <div className="text-xl font-heading font-black text-primary">{Number(aiMetrics.inferenceTimeMs)}ms</div>
                        <div className="text-xs text-text-muted">Inference</div>
                      </div>
                    )}
                    {aiMetrics.modelSizeKB && (
                      <div className="card p-3 text-center">
                        <Database size={16} className="text-accent mx-auto mb-1" />
                        <div className="text-xl font-heading font-black text-accent">{Number(aiMetrics.modelSizeKB)}KB</div>
                        <div className="text-xs text-text-muted">Model Size</div>
                      </div>
                    )}
                    {aiMetrics.f1Score && (
                      <div className="card p-3 text-center">
                        <Target size={16} className="text-warning mx-auto mb-1" />
                        <div className="text-xl font-heading font-black text-warning">{Number(aiMetrics.f1Score)}%</div>
                        <div className="text-xs text-text-muted">F1 Score</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {content && (
                <div className="card p-6">
                  <div className="prose prose-invert max-w-none text-text-secondary" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              )}

              {keyLearnings.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-heading font-bold text-text-primary mb-4">💡 Key Learnings</h3>
                  <ul className="space-y-2">
                    {keyLearnings.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                        <span className="text-secondary mt-0.5 flex-shrink-0">→</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {challenges && (
                <div className="card p-6">
                  <h3 className="font-heading font-bold text-text-primary mb-3">⚡ Challenges</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{challenges}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {externalLinks.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Links</h3>
                  <div className="space-y-2">
                    {externalLinks.map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                        {link.type === "github" ? <Github size={14} /> : <ExternalLink size={14} />}
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {techStack.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map(t => <span key={t} className="tech-chip">{t}</span>)}
                  </div>
                </div>
              )}
              {hardwareComponents.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Hardware</h3>
                  <ul className="space-y-1">
                    {hardwareComponents.map(h => (
                      <li key={h} className="text-sm text-text-secondary flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />{h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tags.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer settings={null} />
    </>
  );
}