// lib/db/seed.ts
// Run with: npm run seed
// Seeds the database with sample Embedded AI / ECE portfolio data

import { connectDB, disconnectDB } from './mongoose';
import Section from '../../models/Section';
import SiteSettings from '../../models/SiteSettings';

async function seed() {
  console.log('🌱 Starting database seed...');
  await connectDB();

  // Clear existing sections (be careful in production!)
  const existing = await Section.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Found ${existing} existing sections. Skipping seed to avoid duplicates.`);
    console.log('   To re-seed, manually clear the sections collection first.');
    await disconnectDB();
    return;
  }

  // ── Site Settings ────────────────────────────────────────
  const settingsCount = await SiteSettings.countDocuments();
  if (settingsCount === 0) {
    await SiteSettings.create({
      siteTitle: 'Sri Charan | ECE & Embedded AI',
      tagline: 'Building Intelligence at the Edge',
      contactEmail: 'sricharan@example.com',
      githubUsername: 'sricharan',
      metaTitle: 'Sri Charan — ECE Student | Embedded AI & Edge AI Developer',
      metaDescription: 'Personal portfolio of Sri Charan, ECE student at KITS Karimnagar. Projects in Embedded AI, TinyML, Edge AI, ESP32, STM32, FreeRTOS.',
    });
    console.log('✅ Site settings created');
  }

  // ── Helper to create section ─────────────────────────────
  async function createSection(data: Record<string, unknown>, parentId?: string) {
    const { default: slugify } = await import('slugify');
    const { nanoid } = await import('nanoid');
    let slug = slugify(data.title as string, { lower: true, strict: true });
    const exists = await Section.findOne({ slug });
    if (exists) slug = `${slug}-${nanoid(4)}`;
    return Section.create({ ...data, slug, parentSection: parentId || null });
  }

  // ── Top-level sections ───────────────────────────────────

  // Hero
  const hero = await createSection({
    title: 'Hero', type: 'hero', visibility: 'public', status: 'published',
    order: 0, icon: '🏠',
    description: 'Sri Charan — ECE Student | Embedded AI · Edge AI Developer',
    content: JSON.stringify({
      taglines: [
        'Building Intelligence at the Edge',
        'Bridging Hardware and AI',
        'Embedded Systems × Machine Learning',
        'TinyML on STM32 & ESP32',
        'From Silicon to Smart Systems',
      ],
    }),
  });

  // About
  const about = await createSection({
    title: 'About Me', type: 'about', visibility: 'public', status: 'published',
    order: 1, icon: '👤',
    description: 'ECE student passionate about Embedded AI and Edge computing',
    content: '<p>I\'m Sri Charan, a final-year Electronics and Communication Engineering student at KITS Karimnagar, Telangana. I build intelligent embedded systems — from AI voice robots to TinyML classifiers running on microcontrollers.</p>',
    educationEntries: [
      { institution: 'KITS Karimnagar', degree: 'B.Tech', branch: 'Electronics and Communication Engineering', startYear: 2021, endYear: 2025, cgpa: '7.8', order: 0 },
    ],
    tags: ['about', 'education', 'profile'],
  });

  // Skills
  const skills = await createSection({
    title: 'Skills', type: 'skills', visibility: 'public', status: 'published',
    order: 2, icon: '🛠️',
    skillCategories: [
      {
        name: 'Programming Languages', icon: 'code', order: 0,
        skills: [
          { name: 'C / Embedded C', proficiency: 92, order: 0 },
          { name: 'Python', proficiency: 85, order: 1 },
          { name: 'C++', proficiency: 78, order: 2 },
        ],
      },
      {
        name: 'Embedded Platforms', icon: 'cpu', order: 1,
        skills: [
          { name: 'ESP32', proficiency: 90, order: 0 },
          { name: 'STM32', proficiency: 82, order: 1 },
          { name: 'Arduino', proficiency: 95, order: 2 },
        ],
      },
    ],
  });

  // Projects top-level folder
  const projectsFolder = await createSection({
    title: 'Projects', type: 'projects', visibility: 'public', status: 'published',
    order: 3, icon: '📂',
    description: 'All my embedded AI and electronics projects',
  });

  // Project groups
  const personalGroup = await createSection({
    title: 'Personal Projects', type: 'folder', visibility: 'public', status: 'published',
    order: 0, icon: '🔧', isFeatured: false,
  }, (projectsFolder as Record<string, unknown>)._id?.toString());

  const edgeAIGroup = await createSection({
    title: 'Edge AI / TinyML Projects', type: 'folder', visibility: 'public', status: 'published',
    order: 1, icon: '🧠', isFeatured: true,
  }, (projectsFolder as Record<string, unknown>)._id?.toString());

  const academicGroup = await createSection({
    title: 'Academic Projects', type: 'folder', visibility: 'public', status: 'published',
    order: 2, icon: '🎓',
  }, (projectsFolder as Record<string, unknown>)._id?.toString());

  // Individual projects
  await createSection({
    title: 'Spidey — AI Voice Assistant Robot',
    type: 'item', visibility: 'public', status: 'published',
    order: 0, icon: '🤖', isFeatured: true, isPinned: true,
    projectStatus: 'completed',
    description: 'ESP32-based AI voice assistant robot using INMP441, Groq Whisper STT, LLaMA LLM, and PlayAI TTS',
    content: '<h2>Overview</h2><p>Spidey is a real-time AI voice assistant robot built on ESP32 DevKit V1. It uses an INMP441 MEMS microphone for audio capture (I2S), streams audio to a Python Flask server running Groq Whisper STT → LLaMA 3.1 LLM → Groq PlayAI TTS pipeline, and plays back responses through a PAM8403 amplifier. An SSD1306 OLED displays animated facial expressions matching the TTS emotion.</p><h2>Key Technical Highlights</h2><ul><li>I2S audio capture with 16kHz sampling and bit-shift calibration (>>11)</li><li>State machine architecture: IDLE → LISTENING → PROCESSING → SPEAKING</li><li>Energy-based VAD (replaces webrtcvad for Python 3.14 compatibility)</li><li>Butterworth bandpass filter (300Hz–3400Hz) for voice isolation</li><li>Base64 binary audio transmission (replaces JSON for lower latency)</li><li>Fritz-PlayAI TTS voice with ffmpeg atempo for emotion-matched speed</li></ul>',
    techStack: ['ESP32', 'INMP441', 'PAM8403', 'SSD1306', 'Python', 'Flask', 'Groq API', 'I2S', 'FreeRTOS'],
    hardwareComponents: ['ESP32 DevKit V1', 'INMP441 MEMS Mic', 'PAM8403 Amplifier', 'SSD1306 0.96" OLED', '3W 4Ω Speaker'],
    externalLinks: [{ label: 'GitHub', url: 'https://github.com/sricharan/spidey', type: 'github' }],
    tags: ['esp32', 'ai', 'voice', 'robot', 'i2s', 'groq', 'flask'],
    teamMembers: [
      { name: 'M. Vyshnavi', role: 'Hardware Design' },
      { name: 'A. Poojitha', role: 'Software Testing' },
      { name: 'CH. Abhinay', role: 'Server Development' },
      { name: 'V. Nithish', role: 'Documentation' },
    ],
  }, (personalGroup as Record<string, unknown>)._id?.toString());

  await createSection({
    title: 'TinyML Vibration Fault Detector',
    type: 'item', visibility: 'public', status: 'published',
    order: 0, icon: '📊', isFeatured: true,
    projectStatus: 'completed',
    description: 'Real-time vibration fault detection on ESP32 using ADXL345 and TFLite model (95.4% accuracy, 12ms inference)',
    techStack: ['ESP32', 'ADXL345', 'TensorFlow Lite', 'Edge Impulse', 'FreeRTOS', 'I2C'],
    aiMetrics: {
      modelName: 'Vibration Fault MLP',
      accuracy: 95.4, precision: 94.8, recall: 95.1, f1Score: 94.9,
      modelSizeKB: 18, inferenceTimeMs: 12,
      targetHardware: 'ESP32 (240MHz)', framework: 'TensorFlow Lite',
      optimizationNotes: 'INT8 quantization, CMSIS-NN acceleration',
    },
    tags: ['tinyml', 'esp32', 'fault-detection', 'edge-impulse', 'accelerometer'],
  }, (edgeAIGroup as Record<string, unknown>)._id?.toString());

  await createSection({
    title: 'Edge AI Image Classifier',
    type: 'item', visibility: 'public', status: 'published',
    order: 1, icon: '👁️', isFeatured: true,
    projectStatus: 'in_progress',
    description: 'MobileNetV2-based image classifier on ESP32-S3 with OV2640 camera — 89% accuracy at 8fps',
    techStack: ['ESP32-S3', 'MobileNetV2', 'TFLite', 'OV2640', 'PSRAM'],
    aiMetrics: { modelName: 'MobileNetV2 (10-class)', accuracy: 89.0, modelSizeKB: 156, inferenceTimeMs: 125, targetHardware: 'ESP32-S3', framework: 'TFLite' },
    tags: ['edge-ai', 'image-classification', 'esp32-s3', 'mobilenet'],
  }, (edgeAIGroup as Record<string, unknown>)._id?.toString());

  await createSection({
    title: 'Unauthorized Device Surveillance',
    type: 'item', visibility: 'public', status: 'published',
    order: 0, icon: '🔍',
    projectStatus: 'completed',
    description: 'ESP32 WiFi/BLE scanner detecting unauthorized devices in restricted areas with live web dashboard',
    techStack: ['ESP32', 'WiFi Scanner', 'BLE', 'Web Dashboard', 'SPIFFS', 'JavaScript'],
    tags: ['esp32', 'security', 'iot', 'wifi', 'ble'],
  }, (academicGroup as Record<string, unknown>)._id?.toString());

  // Certifications
  const certs = await createSection({
    title: 'Certifications', type: 'certifications', visibility: 'public', status: 'published',
    order: 4, icon: '📜',
  });

  await createSection({
    title: 'Embedded Machine Learning — Edge Impulse', type: 'item',
    visibility: 'public', status: 'published', order: 0, icon: '🏆',
    customFields: [
      { fieldName: 'Issuing Organization', fieldType: 'text', fieldValue: 'Edge Impulse', isRequired: false, isPublic: true, order: 0 },
      { fieldName: 'Issue Date', fieldType: 'date', fieldValue: '2024-08-15', isRequired: false, isPublic: true, order: 1 },
      { fieldName: 'Verification URL', fieldType: 'url', fieldValue: 'https://edgeimpulse.com/certificates', isRequired: false, isPublic: true, order: 2 },
    ],
    tags: ['certification', 'tinyml', 'edge-impulse'],
  }, (certs as Record<string, unknown>)._id?.toString());

  // Blog
  await createSection({
    title: 'Blog', type: 'blog', visibility: 'public', status: 'published',
    order: 5, icon: '✍️',
    description: 'Technical articles on Embedded AI, TinyML, and IoT',
  });

  // Contact
  await createSection({
    title: 'Contact', type: 'contact', visibility: 'public', status: 'published',
    order: 6, icon: '📬',
    description: 'Get in touch for collaboration, internships, or questions',
  });

  console.log('✅ Sample data seeded successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/admin/setup');
  console.log('   3. Create your admin account');
  console.log('   4. Login at: http://localhost:3000/admin/login');
  console.log('   5. View portfolio: http://localhost:3000');
  console.log('');

  await disconnectDB();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
