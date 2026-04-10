'use client';
// components/public/sections/EdgeAIShowcase.tsx
// Domain-specific showcase for Embedded AI / Edge AI / TinyML work

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Zap, Target, Clock, Database, Layers } from 'lucide-react';

const EDGE_AI_STACK = [
  {
    category: 'Hardware',
    color: '#00D4FF',
    items: ['ESP32 / ESP32-S3', 'STM32F4 / STM32H7', 'Raspberry Pi 4', 'NVIDIA Jetson Nano', 'Arduino Nano 33 BLE'],
  },
  {
    category: 'ML Frameworks',
    color: '#00FF88',
    items: ['TensorFlow Lite', 'Edge Impulse Studio', 'ONNX Runtime', 'OpenCV (ARM)', 'PyTorch Mobile'],
  },
  {
    category: 'Deployment',
    color: '#FF6B35',
    items: ['CMSIS-NN', 'ESP-IDF IDF', 'Arduino TFLite', 'FreeRTOS Tasks', 'Zephyr RTOS'],
  },
];

// Model comparison data
const MODEL_BENCHMARKS = [
  {
    model: 'Vibration Fault MLP',
    hardware: 'ESP32',
    accuracy: 95.4,
    sizeKB: 18,
    latencyMs: 12,
    framework: 'TFLite',
  },
  {
    model: 'Keyword Spotter CNN',
    hardware: 'Arduino Nano 33',
    accuracy: 91.2,
    sizeKB: 45,
    latencyMs: 35,
    framework: 'Edge Impulse',
  },
  {
    model: 'Image Classifier MobileNet',
    hardware: 'ESP32-S3',
    accuracy: 89.0,
    sizeKB: 156,
    latencyMs: 125,
    framework: 'TFLite',
  },
  {
    model: 'Anomaly Detector AE',
    hardware: 'STM32H7',
    accuracy: 93.8,
    sizeKB: 32,
    latencyMs: 8,
    framework: 'CMSIS-NN',
  },
];

// ── Animated metric card ──────────────────────────────────────
function MetricCard({
  icon: Icon,
  value,
  unit,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  unit: string;
  label: string;
  color: string;
}) {
  return (
    <div className="card p-4 text-center">
      <div
        className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="font-heading font-black text-xl" style={{ color }}>
        {value}
        <span className="text-sm font-mono ml-1 opacity-70">{unit}</span>
      </div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  );
}

// ── Model benchmark table row ────────────────────────────────
function BenchmarkRow({
  model,
  hardware,
  accuracy,
  sizeKB,
  latencyMs,
  framework,
}: typeof MODEL_BENCHMARKS[0]) {
  return (
    <tr className="border-b border-border hover:bg-surface-2 transition-colors">
      <td className="px-4 py-3 font-medium text-text-primary text-sm">{model}</td>
      <td className="px-4 py-3">
        <span className="tech-chip text-xs">{hardware}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden max-w-16">
            <div
              className="h-full bg-secondary rounded-full"
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <span className="text-sm font-mono text-secondary">{accuracy}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-primary">{sizeKB} KB</td>
      <td className="px-4 py-3 text-sm font-mono text-accent">{latencyMs} ms</td>
      <td className="px-4 py-3">
        <span className="text-xs text-text-muted">{framework}</span>
      </td>
    </tr>
  );
}

interface EdgeAIProps {
  data: Record<string, unknown> | null | undefined;
}

export default function EdgeAIShowcase({ data }: EdgeAIProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref}>
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        className="section-heading mb-8"
      >
        <h2 className="font-heading text-text-primary flex items-center gap-3">
          <span>🧠</span> Embedded AI · Edge AI Showcase
        </h2>
      </motion.div>

      {/* Intro */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ delay: 0.1 }}
        className="text-text-secondary mb-10 max-w-3xl text-base leading-relaxed"
      >
        I specialize in deploying machine learning models directly on microcontrollers and edge devices —
        no cloud dependency, ultra-low latency, and running on milliwatts.
        This is <span className="text-primary font-semibold">TinyML</span> and{' '}
        <span className="text-secondary font-semibold">Edge AI</span> — the future of intelligent hardware.
      </motion.p>

      {/* Summary metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        <MetricCard icon={Target} value="95.4" unit="%" label="Best Model Accuracy" color="#00FF88" />
        <MetricCard icon={Clock} value="8" unit="ms" label="Fastest Inference" color="#00D4FF" />
        <MetricCard icon={Database} value="18" unit="KB" label="Smallest Model" color="#FF6B35" />
        <MetricCard icon={Layers} value="4" label="AI Models Deployed" value="4+" unit="" color="#FFD60A" />
      </motion.div>

      {/* My Edge AI Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Cpu size={18} className="text-primary" /> My Edge AI Stack
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {EDGE_AI_STACK.map((layer) => (
            <div key={layer.category} className="card p-5">
              <div
                className="text-sm font-heading font-semibold mb-3 pb-2 border-b border-border"
                style={{ color: layer.color }}
              >
                {layer.category}
              </div>
              <ul className="space-y-2">
                {layer.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: layer.color }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Model Performance Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap size={18} className="text-secondary" /> Model Performance Dashboard
        </h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-2 border-b border-border">
                  {['Model', 'Hardware', 'Accuracy', 'Size', 'Latency', 'Framework'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-mono font-semibold text-text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODEL_BENCHMARKS.map((m) => (
                  <BenchmarkRow key={m.model} {...m} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2">
          * All models tested on actual hardware. Latency measured at room temperature.
        </p>
      </motion.div>
    </div>
  );
}
