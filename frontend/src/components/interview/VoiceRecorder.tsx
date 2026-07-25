import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, Send } from 'lucide-react';
import LiveCaptions from './LiveCaptions';

interface VoiceRecorderProps {
  isRecording: boolean;
  transcription: string;
  interimTranscript: string;
  isAISpeaking: boolean;
  isEvaluating: boolean;
  onToggleRecording: () => void;
  onSubmit: () => void;
}

export default function VoiceRecorder({
  isRecording,
  transcription,
  interimTranscript,
  isAISpeaking,
  isEvaluating,
  onToggleRecording,
  onSubmit,
}: VoiceRecorderProps) {
  const hasText = transcription.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Live Captions */}
      {(isRecording || transcription) && (
        <LiveCaptions finalTranscript={transcription} interimTranscript={interimTranscript} />
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
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
          <>
            {/* Mic Toggle */}
            <button
              onClick={onToggleRecording}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-600 shadow-lg shadow-red-600/30'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
              {isRecording && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </button>

            {/* Submit Button */}
            {hasText && !isRecording && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onSubmit}
                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all shadow-lg shadow-blue-600/30"
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
