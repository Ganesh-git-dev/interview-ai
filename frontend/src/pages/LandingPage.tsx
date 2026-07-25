import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Brain, FileText, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">InterviewAI Pro</div>
          <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 hover:opacity-80 transition">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Ace Your Cybersecurity Interview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto"
          >
            AI-powered mock interviews tailored to your target role.
            Practice with voice, get real-time feedback, and track your progress.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition inline-block"
            >
              Start Interview Practice
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: FileText, title: 'Paste Job Description', desc: 'AI extracts skills and requirements' },
              { icon: Brain, title: 'AI Generates Questions', desc: 'Tailored to your target role' },
              { icon: Mic, title: 'Voice Interview', desc: 'Answer naturally with speech-to-text' },
              { icon: BarChart3, title: 'Get Feedback', desc: 'Detailed scores and recommendations' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            InterviewAI Pro | BrewingSec CyberDev Summit 2026 | PS: BSCDS26-AICR-01
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Powered by PWNDORA | BlackPerl DFIR
          </p>
        </div>
      </footer>
    </div>
  );
}
