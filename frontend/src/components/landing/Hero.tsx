import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="gradient-bg text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Shield className="w-7 h-7" />
          InterviewAI Pro
        </div>
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

      <div className="container mx-auto px-6 py-20 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-8"
        >
          <Shield className="w-4 h-4" />
          BrewingSec CyberDev Summit 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          Ace Your Cybersecurity
          <br />
          Interview
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
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition inline-block"
          >
            Start Interview Practice
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition inline-block border border-white/20"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
