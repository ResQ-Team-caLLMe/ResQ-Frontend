"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
// import { AudioVisualizer } from "./components/AudioVisualizer";
import { Chatbox, Message } from "./components/ChatBox";

export default function Home() {
  const { startRecording, stopRecording, mediaStream, transcript } =
    useAudioRecorder();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMicOn, setMicOn] = useState(false);
  const [inCall, setInCall] = useState(false);

  const lastUserMessageIdRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartCall = () => {
    setInCall(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date(),
        sender: "bot",
        name: "ResQ",
        text: "Hello! You've reached the ResQ AI assistant. Please state the nature of your emergency.",
      },
    ]);
    speak("Hello! You've reached the ResQ AI assistant. Please state the nature of your emergency.", () => {
      startRecording();
    });
  };

  const handleEndCall = () => {
    setInCall(false);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setMicOn(false);
    stopRecording();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date(),
        name: "system",
        sender: "system",
        text: "Call ended",
      },
    ]);
  };

  const speak = (text: string, onDone?: () => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.5;
      utterance.pitch = 1;

      utterance.onstart = () => {
        pauseMic(); // mute mic, but keep WebSocket alive
      };

      utterance.onend = () => {
        resumeMic(); // unmute mic
        if (onDone) onDone();
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Handles marking a transcript as "final" after silence
  const finalizeCurrentMessage = () => {
    if (lastUserMessageIdRef.current) {
      const currentMsg = messages.find(
        (m) => m.id === lastUserMessageIdRef.current
      );
      if (!currentMsg) return;

      const finalText = currentMsg.text;

      // Add bot reply
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          timestamp: new Date(),
          sender: "bot",
          name: "ResQ",
          text: `I heard you say: "${finalText}". How can I assist further?`,
        },
      ]);

      speak(`I heard you say: "${finalText}". How can I assist further?`);

      // Reset for the next utterance
      lastUserMessageIdRef.current = null;
    }
  };

  const pauseMic = () => {
    setMicOn(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.enabled = false);
    }
  };

  const resumeMic = () => {
    setMicOn(true);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.enabled = true);
    }
  };

  useEffect(() => {
    if (transcript?.text) {
      if (transcript.message_type === "PartialTranscript") {
        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          finalizeCurrentMessage();
        }, 2000); // 2 seconds of silence

        if (lastUserMessageIdRef.current) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === lastUserMessageIdRef.current
                ? { ...msg, text: transcript.text }
                : msg
            )
          );
        } else {
          const newId = Date.now();
          setMessages((prev) => [
            ...prev,
            {
              id: newId,
              timestamp: new Date(),
              sender: "user",
              name: "You",
              text: transcript.text,
            },
          ]);
          lastUserMessageIdRef.current = newId;
        }
      }
    }
  }, [transcript]);

  return (
    <div className="text-white min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">ResQ</h1>
        <h2 className="text-xl md:text-2xl font-light mb-6 text-center">
          AI-Powered Emergency Call Center
        </h2>

        {inCall ? (
          // <div className="w-full flex flex-col items-center">
          //   {/* {mediaStream && <AudioVisualizer mediaStream={mediaStream} />} */}
          // </div>

          <button
            onClick={handleEndCall}
            className={`flex items-center justify-center ${isMicOn ? "bg-green-600" : "bg-gray-500"} text-white w-28 h-28 rounded-full text-lg font-bold shadow-lg hover:bg-gray-700 cursor-pointer active:scale-95 transition-all duration-200`}
          >
            End
          </button>
        ) : (
          <button
            onClick={handleStartCall}
            className="flex items-center justify-center bg-red-700 text-white w-28 h-28 rounded-full text-lg font-bold shadow-lg hover:bg-gray-200 hover:text-red-700 cursor-pointer active:scale-95 transition-all duration-200"
          >
            Call
          </button>
        )}

        {messages.length > 0 && <Chatbox messages={messages} />}
      </div>
    </div>
  );
}
