import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Download, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface ReportData {
  session_id: number;
  overall_score: number;
  recommendation: string;
  technical_average: number;
  communication_average: number;
  strengths: string[];
  gaps: string[];
  domain_scores: Record<string, number>;
  role_readiness: Record<string, number>;
  recommendations: Array<{
    lab_name: string;
    lab_domain: string;
    priority: string;
    reason: string;
    estimated_hours: number;
  }>;
  answers: Array<{
    question_id: number;
    technical_score: number;
    completeness_score: number;
    communication_score: number;
    overall_score: number;
    strengths: string[];
    gaps: string[];
    feedback_text: string;
  }>;
}

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [sessionId]);

  const loadReport = async () => {
    try {
      const response = await api.get(`/api/session/${sessionId}/report`);
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get(`/api/session/${sessionId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interview-report-${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Failed to load report</p>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = Object.entries(report.domain_scores).map(([domain, score]) => ({
    domain,
    score,
    fullMark: 100,
  }));

  // Prepare role readiness data
  const roleData = Object.entries(report.role_readiness).map(([role, percentage]) => ({
    role: role.replace(' Analyst', '').replace(' Tester', ''),
    percentage,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Interview Results</h1>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4">
              <span className="text-4xl font-bold">{report.overall_score.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              {report.recommendation === 'Hire' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : report.recommendation === 'Consider' ? (
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <span className="text-xl font-semibold">{report.recommendation}</span>
            </div>
            <p className="text-gray-600">
              {report.recommendation === 'Hire'
                ? 'Strong candidate! You demonstrated excellent skills.'
                : report.recommendation === 'Consider'
                ? 'Good potential with some areas for improvement.'
                : 'Keep practicing! Focus on the recommended labs below.'}
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Domain Scores Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Domain Performance</h2>
            <RadarChart width={400} height={300} data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </motion.div>

          {/* Role Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Role Readiness</h2>
            <BarChart width={400} height={300} data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </motion.div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4 text-green-600">Key Strengths</h2>
            <ul className="space-y-2">
              {report.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4 text-yellow-600">Areas for Improvement</h2>
            <ul className="space-y-2">
              {report.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{gap}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* PWNDORA Lab Recommendations */}
        {report.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Recommended PWNDORA Labs</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{rec.lab_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm mb-2">{rec.reason}</p>
                  <p className="text-blue-200 text-xs">{rec.estimated_hours} hours estimated</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Question-by-Question Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Detailed Question Results</h2>
          <div className="space-y-4">
            {report.answers.map((answer, i) => (
              <div key={i} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Question {i + 1}</span>
                  <span className={`text-lg font-bold ${
                    answer.overall_score >= 70 ? 'text-green-600' :
                    answer.overall_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {answer.overall_score}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                  <span>Technical: {answer.technical_score}</span>
                  <span>Completeness: {answer.completeness_score}</span>
                  <span>Communication: {answer.communication_score}</span>
                </div>
                <p className="text-sm text-gray-600">{answer.feedback_text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
