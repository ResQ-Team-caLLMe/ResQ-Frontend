"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { Chatbox, Message } from "./components/ChatBox";

export default function Home() {
  const { recording, startRecording, stopRecording, mediaStream, transcript, flush } =
    useAudioRecorder();
  const [messages, setMessages] = useState<Message[]>([]);

  // ---- silence detection here ----
  useEffect(() => {
    if (!recording || !mediaStream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const buf = new Uint8Array(analyser.frequencyBinCount);
    let rafId = 0;
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    let isFlushing = false;

    const check = () => {
      analyser.getByteTimeDomainData(buf);
      const rms =
        Math.sqrt(buf.reduce((acc, v) => acc + Math.pow(v - 128, 2), 0) / buf.length) /
        128;

      if (rms < 0.02) {
        if (!silenceTimer) {
          silenceTimer = setTimeout(async () => {
            if (!isFlushing) {
              isFlushing = true;
              await flush(); // ask the hook to package & send current audio
              isFlushing = false;
            }
            silenceTimer = null;
          }, 1000);
        }
      } else if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }

      rafId = requestAnimationFrame(check);
    };

    check();

    return () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      cancelAnimationFrame(rafId);
      audioContext.close();
    };
  }, [recording, mediaStream, flush]);
  // --------------------------------

  const handleStartCall = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date(),
        sender: "bot",
        name: "ResQ",
        text:
          "Hello! You've reached the ResQ AI assistant. Please state the nature of your emergency.",
      },
    ]);
    startRecording();
  };

  const handleEndCall = () => {
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

  // whenever a transcript arrives from a flush, append it to chat
  useEffect(() => {
    if (!transcript?.text) return;
    const id = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id,
        timestamp: new Date(),
        sender: "user",
        name: "You",
        text: transcript.text,
      },
      {
        id: id + 1,
        timestamp: new Date(),
        sender: "bot",
        name: "ResQ",
        text: `I heard you say: "${transcript.text}". How can I assist further?`,
      },
    ]);
  }, [transcript]);

  return (
    <div className="text-white min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">ResQ</h1>
        <h2 className="text-xl md:text-2xl font-light mb-6 text-center">
          AI-Powered Emergency Call Center
        </h2>

        {!recording ? (
          <button
            onClick={handleStartCall}
            className="flex items-center justify-center bg-red-700 text-white w-28 h-28 rounded-full text-2xl font-bold shadow-lg hover:bg-gray-200 hover:text-red-700 cursor-pointer active:scale-95 transition-all duration-200"
          >
            Call
          </button>
        ) : (
          <div className="w-full flex flex-col items-center">
            {mediaStream && <AudioVisualizer mediaStream={mediaStream} />}
            <button
              onClick={handleEndCall}
              className="flex items-center justify-center bg-gray-500 text-white w-20 h-20 rounded-full text-lg font-bold shadow-lg hover:bg-gray-700 cursor-pointer active:scale-95 transition-all duration-200 mt-4"
            >
              End
            </button>
          </div>
        )}

        {messages.length > 0 && <Chatbox messages={messages} />}
      </div>
    </div>
  );
}
