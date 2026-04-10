'use client';
// components/public/sections/ProjectsSection.tsx
// Projects with nested group navigation, filter/search, and card grid

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3X3, List, ExternalLink, Github, Cpu, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ── Sample project data ─────────────────────────────────────
const SAMPLE_PROJECTS = [
  {
    id: '1',
    title: 'Spidey — AI Voice Assistant Robot',
    slug: 'spidey-ai-robot',
    group: 'Personal Projects',
    description:
      'ESP32-based AI voice assistant robot using INMP441 microphone, Groq Whisper STT, LLaMA LLM, and PlayAI TTS. Features OLED facial expressions and WiFi Flask server pipeline.',
    techStack: ['ESP32', 'Python', 'Flask', 'Groq API', 'I2S', 'OLED'],
    projectStatus: 'completed',
    isFeatured: true,
    coverImageUrl: '/images/projects/spidey.jpg',
    externalLinks: [
      { type: 'github', url: 'https://github.com/sricharan/spidey', label: 'GitHub' },
    ],
  },
  {
    id: '2',
    title: 'TinyML Vibration Fault Detector',
    slug: 'tinyml-vibration-fault',
    group: 'Edge AI / TinyML Projects',
    description:
      'Real-time vibration fault detection on ESP32 using ADXL345 accelerometer and Edge Impulse TFLite model. Detects normal/fault conditions at 95.4% accuracy.',
    techStack: ['ESP32', 'TFLite', 'Edge Impulse', 'ADXL345', 'FreeRTOS'],
    projectStatus: 'completed',
    isFeatured: true,
    coverImageUrl: '/images/projects/vibration.jpg',
    aiMetrics: {
      accuracy: 95.4,
      modelSizeKB: 18,
      inferenceTimeMs: 12,
      targetHardware: 'ESP32',
      framework: 'TensorFlow Lite',
    },
  },
  {
    id: '3',
    title: 'Smart Sensor Node — STM32',
    slug: 'smart-sensor-stm32',
    group: 'Emertxe Internship Projects',
    description:
      'Multi-sensor IoT node on STM32F4 with temperature, humidity, and gas sensors. Data transmitted over MQTT to cloud dashboard with real-time visualization.',
    techStack: ['STM32F4', 'FreeRTOS', 'MQTT', 'I2C', 'SPI', 'DHT22'],
    projectStatus: 'completed',
    isFeatured: false,
    coverImageUrl: '/images/projects/sensor-node.jpg',
  },
  {
    id: '4',
    title: 'Unauthorized Device Surveillance',
    slug: 'wifi-ble-surveillance',
    group: 'Academic Projects',
    description:
      'ESP32-based system to detect unauthorized WiFi/BLE devices in restricted areas. Live web dashboard showing device MAC addresses, signal strength, and timestamps.',
    techStack: ['ESP32', 'WiFi Scanner', 'BLE', 'Web Dashboard', 'SPIFFS'],
    projectStatus: 'completed',
    isFeatured: false,
    coverImageUrl: '/images/projects/surveillance.jpg',
  },
  {
    id: '5',
    title: 'Edge AI Image Classifier',
    slug: 'edge-ai-image-classifier',
    group: 'Edge AI / TinyML Projects',
    description:
      'MobileNetV2-based image classifier deployed on ESP32-S3 with camera module. Classifies 10 categories at 8fps with 89% accuracy using PSRAM optimization.',
    techStack: ['ESP32-S3', 'MobileNetV2', 'TFLite', 'OV2640 Camera', 'PSRAM'],
    projectStatus: 'in_progress',
    isFeatured: true,
    coverImageUrl: '/images/projects/edge-classifier.jpg',
    aiMetrics: {
      accuracy: 89,
      modelSizeKB: 156,
      inferenceTimeMs: 125,
      targetHardware: 'ESP32-S3',
      framework: 'TensorFlow Lite',
    },
  },
  {
    id: '6',
    title: 'Autonomous Drone — F450',
    slug: 'autonomous-drone-f450',
    group: 'Personal Projects',
    description:
      'F450 quadcopter with Pixhawk 2.4.8 + Raspberry Pi 4 for autonomous waypoint navigation. DroneKit Python for mission planning, real-time obstacle detection via ultrasonic sensors.',
    techStack: ['Pixhawk', 'Raspberry Pi 4', 'DroneKit', 'MAVLink', 'Python', 'F450'],
    projectStatus: 'in_progress',
    isFeatured: false,
    coverImageUrl: '/images/projects/drone.jpg',
  },
];

const GROUPS = ['All', ...Array.from(new Set(SAMPLE_PROJECTS.map((p) => p.group)))];

type ProjectStatus = 'completed' | 'in_progress' | 'planned' | 'on_hold';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; class: string }> = {
  completed:   { label: '✅ Completed',    class: 'badge-completed' },
  in_progress: { label: '🔄 In Progress',  class: 'badge-in-progress' },
  planned:     { label: '📋 Planned',      class: 'badge-planned' },
  on_hold:     { label: '⏸️ On Hold',      class: 'badge-planned' },
};

// ── Project Card ─────────────────────────────────────────────
function ProjectCard({ project }: { project: typeof SAMPLE_PROJECTS[0] }) {
  const status = STATUS_CONFIG[project.projectStatus as ProjectStatus];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="card flex flex-col h-full overflow-hidden group"
    >
      {/* Cover image */}
      <div className="relative h-44 bg-surface-2 overflow-hidden flex-shrink-0">
        <Image
          src={project.coverImageUrl || '/images/project-placeholder.jpg'}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
          }}
        />
        {/* Overlay with links */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent opacity-0
                        group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3 gap-2">
          {project.externalLinks?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-surface/90 flex items-center justify-center
                         text-primary hover:bg-primary hover:text-surface transition-colors"
              aria-label={link.label}
            >
              {link.type === 'github' ? <Github size={14} /> : <ExternalLink size={14} />}
            </a>
          ))}
        </div>
        {/* Status badge */}
        {status && (
          <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-mono font-medium ${status.class}`}>
            {status.label}
          </div>
        )}
        {/* AI metrics badge */}
        {(project as Record<string, unknown>).aiMetrics && (
          <div className="absolute top-3 right-3 bg-accent/20 border border-accent/40
                          text-accent text-xs px-2 py-1 rounded-full font-mono font-medium flex items-center gap-1">
            <Cpu size={10} /> AI
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Group label */}
        <span className="text-xs text-text-muted font-mono mb-2 flex items-center gap-1">
          <Tag size={10} /> {project.group}
        </span>

        <h3 className="font-heading font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">
          {project.description}
        </p>

        {/* AI Metrics if available */}
        {(project as Record<string, unknown>).aiMetrics && (
          <div className="flex gap-3 mb-3 text-xs font-mono">
            <span className="text-secondary">
              🎯 {((project as Record<string, unknown>).aiMetrics as Record<string, unknown>).accuracy as number}% acc
            </span>
            <span className="text-primary">
              ⚡ {((project as Record<string, unknown>).aiMetrics as Record<string, unknown>).inferenceTimeMs as number}ms
            </span>
            <span className="text-accent">
              💾 {((project as Record<string, unknown>).aiMetrics as Record<string, unknown>).modelSizeKB as number}KB
            </span>
          </div>
        )}

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="tech-chip">{tech}</span>
          ))}
          {project.techStack.length > 4 && (
            <span className="tech-chip">+{project.techStack.length - 4}</span>
          )}
        </div>

        {/* View button */}
        <Link
          href={`/projects/${project.slug}`}
          className="btn-secondary text-sm mt-auto text-center"
        >
          View Details →
        </Link>
      </div>
    </motion.article>
  );
}

// ── Main Section ─────────────────────────────────────────────
interface ProjectsProps {
  data: Record<string, unknown> | null | undefined;
}

export default function ProjectsSection({ data }: ProjectsProps) {
  const [activeGroup, setActiveGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const projects = SAMPLE_PROJECTS;

  const filtered = projects.filter((p) => {
    const matchGroup = activeGroup === 'All' || p.group === activeGroup;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchGroup && matchSearch;
  });

  return (
    <div>
      {/* Section heading */}
      <div className="section-heading mb-8">
        <h2 className="font-heading text-text-primary flex items-center gap-3">
          <span>📂</span> Projects
        </h2>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
            aria-label="Search projects"
          />
        </div>

        {/* View mode */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-surface' : 'text-text-muted hover:text-text-primary'}`}
            aria-label="Grid view" aria-pressed={viewMode === 'grid'}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-surface' : 'text-text-muted hover:text-text-primary'}`}
            aria-label="List view" aria-pressed={viewMode === 'list'}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Group filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Project groups">
        {GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            role="tab"
            aria-selected={activeGroup === group}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${activeGroup === group
                ? 'bg-primary text-surface font-semibold'
                : 'border border-border text-text-secondary hover:border-primary hover:text-primary'
              }`}
          >
            {group}
            <span className="ml-2 text-xs opacity-70">
              {group === 'All'
                ? projects.length
                : projects.filter((p) => p.group === group).length}
            </span>
          </button>
        ))}
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <p className="text-4xl mb-4">🔍</p>
          <p>No projects found matching your criteria.</p>
        </div>
      ) : (
        <motion.div
          layout
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Show all link */}
      {projects.length > 6 && (
        <div className="text-center mt-10">
          <Link href="/projects" className="btn-secondary">
            View All Projects →
          </Link>
        </div>
      )}
    </div>
  );
}
