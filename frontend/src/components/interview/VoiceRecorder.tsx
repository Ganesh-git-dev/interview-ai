import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import LiveCaptions from './LiveCaptions';

interface VoiceRecorderProps {
  isRecording: boolean;
  transcription: string;
  interimTranscript: string;
  isAISpeaking: boolean;
  isEvaluating: boolean;
  onToggleRecording: () => void;
}

export default function VoiceRecorder({
  isRecording,
  transcription,
  interimTranscript,
  isAISpeaking,
  isEvaluating,
  onToggleRecording,
}: VoiceRecorderProps) {
  return (
    <div className="space-y-3">
      {/* Live Captions */}
      {(isRecording || transcription) && (
        <LiveCaptions finalTranscript={transcription} interimTranscript={interimTranscript} />
      )}

      {/* Mic Toggle */}
      <div className="flex items-center justify-center">
        {isEvaluating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-600/20 text-yellow-300"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Evaluating...
          </motion.div>
        ) : isAISpeaking ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600/20 text-purple-300"
          >
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="w-1.5 h-4 bg-purple-400 rounded-full" />
              <span className="w-1.5 h-6 bg-purple-400 rounded-full" />
              <span className="w-1.5 h-3 bg-purple-400 rounded-full" />
              <span className="w-1.5 h-5 bg-purple-400 rounded-full" />
            </motion.div>
            AI is speaking...
          </motion.div>
        ) : (
          <button
            onClick={onToggleRecording}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 shadow-lg shadow-red-600/30'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
            {isRecording && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-red-500"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
