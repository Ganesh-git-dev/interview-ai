import { motion } from 'framer-motion';
import { Mic, MicOff, Clock } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  transcription: string;
  onToggleRecording: () => void;
  onTranscriptionChange: (text: string) => void;
}

export default function VoiceRecorder({
  isRecording,
  transcription,
  onToggleRecording,
  onTranscriptionChange,
}: VoiceRecorderProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">Your Answer</span>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Speak or type your answer</span>
        </div>
      </div>

      <textarea
        value={transcription}
        onChange={(e) => onTranscriptionChange(e.target.value)}
        placeholder="Your answer will appear here as you speak, or type directly..."
        className="w-full h-32 bg-transparent text-white placeholder-gray-500 resize-none outline-none"
      />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={onToggleRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Recording
            </>
          )}
        </button>

        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-red-400 text-sm">Recording...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
