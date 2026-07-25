import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, History, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useInterviewStore } from '../stores/interviewStore';

export default function DashboardPage() {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuthStore();
  const createSession = useInterviewStore((s) => s.createSession);
  const startInterview = useInterviewStore((s) => s.startInterview);
  const navigate = useNavigate();

  const handleStartInterview = async () => {
    if (!jdText.trim()) {
      setError('Please paste a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionId = await createSession(jdText);
      await startInterview(sessionId);
      navigate(`/interview/${sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">InterviewAI Pro</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* New Interview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
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

          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here...

Example:
We are looking for a SOC Analyst with experience in:
- SIEM tools (Splunk, Sentinel)
- Log analysis and alert triage
- Incident response procedures
- MITRE ATT&CK framework
- Sigma rules and detection engineering

Requirements:
- 2+ years experience in SOC environment
- CEH or similar certification preferred
- Strong analytical and communication skills"
            className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />

          <button
            onClick={handleStartInterview}
            disabled={loading || !jdText.trim()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing JD...
              </span>
            ) : (
              'Start Interview'
            )}
          </button>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
          <p className="text-blue-100 mb-4">
            Don't have a JD? Try our sample SOC Analyst position.
          </p>
          <button
            onClick={() => {
              setJdText(`SOC Analyst - Security Operations Center

Company: CyberShield Solutions
Location: Remote

Role Overview:
We are seeking a skilled SOC Analyst to join our Security Operations Center. You will monitor, detect, and respond to security incidents across our enterprise environment.

Key Responsibilities:
- Monitor SIEM dashboards and investigate security alerts
- Perform log analysis and threat hunting activities
- Respond to security incidents following established playbooks
- Document incidents and contribute to improvement processes
- Collaborate with senior analysts on complex investigations

Required Skills:
- Proficiency with SIEM tools (Splunk, Microsoft Sentinel, or similar)
- Understanding of Windows and Linux event logs
- Knowledge of MITRE ATT&CK framework
- Familiarity with network protocols and traffic analysis
- Basic understanding of malware analysis concepts
- Incident response procedures and documentation

Preferred Certifications:
- CompTIA Security+
- CEH (Certified Ethical Hacker)
- Splunk Certified Power User

Experience:
- 1-3 years in SOC or security operations role
- Hands-on experience with log analysis and alert triage
- Strong analytical and problem-solving skills`);
            }}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Use Sample JD
          </button>
        </motion.div>
      </main>
    </div>
  );
}
