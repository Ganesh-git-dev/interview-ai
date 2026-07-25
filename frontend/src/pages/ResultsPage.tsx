import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import ScoreCard from '../components/reports/ScoreCard';
import DomainPerformance from '../components/reports/DomainPerformance';
import RoleReadiness from '../components/reports/RoleReadiness';
import LabRecommendations from '../components/reports/LabRecommendations';
import QuestionBreakdown from '../components/reports/QuestionBreakdown';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import type { ReportData } from '../types';

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, [sessionId]);

  const loadReport = async () => {
    try {
      const response = await api.get(`/api/session/${sessionId}/report`);
      setReport(response.data);
    } catch {
      setError('Failed to load report');
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
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Failed to load report</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <Button onClick={downloadPDF} variant="primary" size="sm">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <ScoreCard
          overallScore={report.overall_score}
          recommendation={report.recommendation}
        />

        <div className="grid md:grid-cols-2 gap-8 my-8">
          <DomainPerformance data={report.domain_scores} />
          <RoleReadiness data={report.role_readiness} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4 text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Key Strengths
            </h2>
            <ul className="space-y-2">
              {report.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{strength}</span>
                </li>
              ))}
              {report.strengths.length === 0 && (
                <p className="text-gray-400 text-sm">No strengths recorded</p>
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4 text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Areas for Improvement
            </h2>
            <ul className="space-y-2">
              {report.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{gap}</span>
                </li>
              ))}
              {report.gaps.length === 0 && (
                <p className="text-gray-400 text-sm">No areas identified</p>
              )}
            </ul>
          </motion.div>
        </div>

        <div className="mb-8">
          <LabRecommendations recommendations={report.recommendations} />
        </div>

        <QuestionBreakdown answers={report.answers} />
      </main>
    </motion.div>
  );
}
