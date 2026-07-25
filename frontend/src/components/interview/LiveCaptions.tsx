import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCaptionsProps {
  finalTranscript: string;
  interimTranscript: string;
}

export default function LiveCaptions({ finalTranscript, interimTranscript }: LiveCaptionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [finalTranscript, interimTranscript]);

  const words = finalTranscript.split(' ').filter(Boolean);
  const lastLine = words.slice(-15).join(' ');
  const earlierLines = words.slice(0, -15).join(' ');

  return (
    <div
      ref={scrollRef}
      className="w-full max-h-24 overflow-y-auto px-4 py-2 bg-black/5 rounded-lg"
    >
      {earlierLines && (
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          {earlierLines}
        </p>
      )}
      <p className="text-base text-gray-800 text-center leading-relaxed font-medium">
        {lastLine}
      </p>
      <AnimatePresence>
        {interimTranscript && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-base text-blue-600/70 text-center leading-relaxed italic"
          >
            {interimTranscript}
          </motion.p>
        )}
      </AnimatePresence>
      {!finalTranscript && !interimTranscript && (
        <p className="text-sm text-gray-300 text-center italic">
          Listening...
        </p>
      )}
    </div>
  );
}
