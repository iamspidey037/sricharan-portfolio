// app/page.tsx
// Main portfolio homepage — renders all public sections in order.
// Uses server-side data fetching for SEO, then hydrates with React on client.

import { Metadata } from 'next';
import { connectDB } from '@/lib/db/mongoose';
import Section from '@/models/Section';
import SiteSettings from '@/models/SiteSettings';
import Navbar from '@/components/public/layout/Navbar';
import Footer from '@/components/public/layout/Footer';
import HeroSection from '@/components/public/sections/HeroSection';
import AboutSection from '@/components/public/sections/AboutSection';
import SkillsSection from '@/components/public/sections/SkillsSection';
import ProjectsSection from '@/components/public/sections/ProjectsSection';
import InternshipsSection from '@/components/public/sections/InternshipsSection';
import CertificationsSection from '@/components/public/sections/CertificationsSection';
import BlogSection from '@/components/public/sections/BlogSection';
import ContactSection from '@/components/public/sections/ContactSection';
import TimelineSection from '@/components/public/sections/TimelineSection';
import EdgeAIShowcase from '@/components/public/sections/EdgeAIShowcase';
import BackToTop from '@/components/shared/BackToTop';

// Re-generate this page at most once per 60 seconds (ISR)
export const revalidate = 60;

// ── Fetch data server-side ───────────────────────────────────
async function getPortfolioData() {
  try {
    await connectDB();

    const [settings, sections] = await Promise.all([
      SiteSettings.findOne().lean(),
      Section.find({
        visibility: 'public',
        status: 'published',
        parentSection: null,
      })
        .select('-versions -sharedLink')
        .sort({ order: 1 })
        .lean(),
    ]);

    return { settings, sections };
  } catch (error) {
    console.error('[Home] Data fetch error:', error);
    return { settings: null, sections: [] };
  }
}

// ── Dynamic SEO metadata ─────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    return {
      title: settings?.metaTitle || 'Sri Charan | ECE · Embedded AI · Edge AI',
      description: settings?.metaDescription,
      openGraph: { images: settings?.ogImageUrl ? [settings.ogImageUrl] : [] },
    };
  } catch {
    return {};
  }
}

// ── Page component ───────────────────────────────────────────
export default async function HomePage() {
  const { settings, sections } = await getPortfolioData();

  // Build section map by type for easy lookup
  const sectionMap = new Map(
    (sections as Array<{ type: string } & Record<string, unknown>>).map((s) => [s.type, s])
  );

  const heroData = sectionMap.get('hero');
  const aboutData = sectionMap.get('about');
  const skillsData = sectionMap.get('skills');
  const projectsData = sectionMap.get('projects');
  const internshipsData = sectionMap.get('internships');
  const certificationsData = sectionMap.get('certifications');
  const edgeAIData = sectionMap.get('custom'); // Edge AI showcase
  const blogData = sectionMap.get('blog');
  const contactData = sectionMap.get('contact');

  return (
    <>
      {/* Skip navigation for screen readers */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Navbar settings={settings} />

      <main
        id="main-content"
        className="relative bg-circuit"
      >
        {/* ── Hero Section ── */}
        <section id="hero">
          <HeroSection data={heroData} settings={settings} />
        </section>

        {/* ── About Me ── */}
        <section id="about" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <AboutSection data={aboutData} />
          </div>
        </section>

        {/* ── Skills ── */}
        <section id="skills" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <SkillsSection data={skillsData} />
          </div>
        </section>

        {/* ── Edge AI Showcase (domain-specific) ── */}
        <section id="edge-ai" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <EdgeAIShowcase data={edgeAIData} />
          </div>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <ProjectsSection data={projectsData} />
          </div>
        </section>

        {/* ── Experience Timeline ── */}
        <section id="timeline" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <TimelineSection sections={sections as Record<string, unknown>[]} />
          </div>
        </section>

        {/* ── Internships ── */}
        <section id="internships" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <InternshipsSection data={internshipsData} />
          </div>
        </section>

        {/* ── Certifications ── */}
        <section id="certifications" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <CertificationsSection data={certificationsData} />
          </div>
        </section>

        {/* ── Blog ── */}
        <section id="blog" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <BlogSection data={blogData} />
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="py-20 px-4">
          <div className="max-w-content mx-auto">
            <ContactSection data={contactData} settings={settings} />
          </div>
        </section>
      </main>

      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
