import { motion } from 'framer-motion';
import { Mic, Brain, FileText, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Paste Job Description',
    desc: 'AI extracts skills, experience requirements, and certifications',
  },
  {
    icon: Brain,
    title: 'AI Generates Questions',
    desc: 'Tailored technical and scenario-based questions for your role',
  },
  {
    icon: Mic,
    title: 'Voice Interview',
    desc: 'Answer naturally with speech-to-text or type your responses',
  },
  {
    icon: BarChart3,
    title: 'Get Feedback',
    desc: 'Detailed scores, strengths, gaps, and lab recommendations',
  },
];

const stats = [
  { label: 'Roles Covered', value: '50+' },
  { label: 'Question Types', value: '4' },
  { label: 'AI Models', value: '3' },
  { label: 'PWNDORA Labs', value: '100+' },
];

export default function Features() {
  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-600 text-center mb-12 max-w-xl mx-auto"
          >
            Four simple steps to ace your next cybersecurity interview
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
