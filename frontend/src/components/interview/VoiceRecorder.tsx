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
  onDone: () => void;
}

export default function VoiceRecorder({
  isRecording,
  transcription,
  interimTranscript,
  isAISpeaking,
  isEvaluating,
  onToggleRecording,
  onDone,
}: VoiceRecorderProps) {
  const showMic = !isAISpeaking && !isEvaluating;

  return (
    <div className="space-y-3">
      {/* Live Captions */}
      {(isRecording || transcription) && (
        <LiveCaptions finalTranscript={transcription} interimTranscript={interimTranscript} />
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {showMic && (
          <button
            onClick={onToggleRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Speaking
              </>
            )}
          </button>
        )}

        {isRecording && (
          <button
            onClick={onDone}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Done Speaking
          </button>
        )}

        {isAISpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600/20 text-purple-300"
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
        )}

        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600/20 text-yellow-300"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Evaluating...
          </motion.div>
        )}
      </div>

      {/* Recording pulse */}
      {isRecording && (
        <div className="flex justify-center">
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  );
}
