"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceOrderProps {
  onOrderRecognized: (text: string) => void;
}

export function VoiceOrder({ onOrderRecognized }: VoiceOrderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          setIsProcessing(true);
          setTimeout(() => {
            onOrderRecognized(transcript);
            setIsProcessing(false);
            setTranscript("");
            setIsListening(false);
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsProcessing(false);
        
        // Network errors are often false positives with Web Speech API
        // Only show alerts for actual permission issues
        if (event.error === "not-allowed") {
          alert("Microphone access was denied. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          // No speech detected, just stop listening
          setIsListening(false);
        }
        // For network and other errors, silently retry or just stop
        // These are often temporary or false positives
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onOrderRecognized]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        disabled={isProcessing}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? "bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse"
            : isProcessing
            ? "bg-[#E8FF00] text-black"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>

      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded-xl text-sm text-white whitespace-nowrap max-w-xs"
        >
          {transcript}
        </motion.div>
      )}

      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[#E8FF00] text-black text-xs font-bold rounded-lg whitespace-nowrap"
        >
          Listening...
        </motion.div>
      )}
    </div>
  );
}
