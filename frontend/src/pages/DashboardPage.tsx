import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Shield } from 'lucide-react';
import { useInterviewStore } from '../stores/interviewStore';
import Header from '../components/shared/Header';
import JDInput from '../components/dashboard/JDInput';
import QuickStart from '../components/dashboard/QuickStart';
import SessionCard from '../components/dashboard/SessionCard';
import api from '../services/api';

const sampleJD = `SOC Analyst - Security Operations Center

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
- Strong analytical and problem-solving skills`;

interface Session {
  id: number;
  role_title?: string;
  score?: number;
  date: string;
  status: string;
}

export default function DashboardPage() {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const createSession = useInterviewStore((s) => s.createSession);
  const startInterview = useInterviewStore((s) => s.startInterview);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await api.get('/api/sessions');
      setSessions(response.data || []);
    } catch {
      // Sessions endpoint may not exist yet
    } finally {
      setSessionsLoading(false);
    }
  };

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

  const handleViewSession = (id: number) => {
    navigate(`/results/${id}`);
  };

  const handleUseSample = () => {
    setJdText(sampleJD);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <JDInput onSubmit={handleStartInterview} loading={loading} error={error} />

            <QuickStart onUseSample={handleUseSample} />
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold">Recent Sessions</h2>
              </div>

              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onView={handleViewSession}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No sessions yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Complete an interview to see your history
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="font-semibold mb-2">Practice Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Speak clearly and at a moderate pace
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Use the STAR method for behavioural questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Include specific tools and techniques
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
