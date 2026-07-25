import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface JDInputProps {
  onSubmit: (jdText: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

export default function JDInput({ onSubmit, loading, error }: JDInputProps) {
  const [jdText, setJdText] = useState('');

  const handleSubmit = async () => {
    if (!jdText.trim()) return;
    await onSubmit(jdText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Plus className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">Start New Interview</h2>
      </div>

      <p className="text-gray-600 mb-4">
        Paste a cybersecurity job description and we'll generate tailored interview questions.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <Textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder={`Paste the job description here...\n\nExample:\nWe are looking for a SOC Analyst with experience in:\n- SIEM tools (Splunk, Sentinel)\n- Log analysis and alert triage\n- Incident response procedures`}
        className="h-48"
      />

      <div className="mt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading || !jdText.trim()}
          loading={loading}
          size="lg"
        >
          {loading ? 'Analyzing JD...' : 'Start Interview'}
        </Button>
      </div>
    </motion.div>
  );
}
