"use client";

import { useState } from "react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { AudioVisualizer } from "./components/AudioVisualizer"; // Adjust path if needed
// import { AudioVisualizer } from 'react-audio-visualize';
// import { Mic, PhoneOff } from "lucide-react"; // Example icons

export default function Home() {
  const { recording, startRecording, stopRecording, mediaStream, mediaRecorderRef } =
    useAudioRecorder();
  const [messages, setMessages] = useState<string[]>([]);

  return (
    <div className="bg-gradient-to-b from-red-600 to-red-800 text-white min-h-screen flex flex-col justify-center items-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-center">ResQ</h1>
      <h2 className="text-2xl font-bold mb-4 text-center">
        AI-Powered Emergency Call Center
      </h2>
      <p className="mb-8 text-center max-w-xl">
        Call to report emergencies, our AI will connect you to the nearest
        responders.
      </p>

      {!recording ? (
        <button
          onClick={startRecording}
          className="flex items-center justify-center bg-white text-red-700 w-24 h-24 rounded-full text-xl font-bold shadow-lg hover:bg-gray-200 transition-all duration-200"
        >
          Call
          {/* <Mic className="w-10 h-10" /> */}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* ✨ Use the library component here */}
          {mediaStream && <AudioVisualizer mediaStream={mediaStream} />}

          {/* The End Call Button */}
          <button
            onClick={stopRecording}
            className="flex items-center justify-center bg-gray-500 text-white w-24 h-24 rounded-full text-xl font-bold shadow-lg hover:bg-gray-700 transition-all duration-200"
          >
            {/* <PhoneOff className="w-10 h-10" /> */}
            End Call
          </button>
        </div>
      )}

      {/* Chatbox for LLM output */}
      <div className="bg-white text-black rounded-lg shadow-lg mt-8 p-4 w-full max-w-2xl h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">
            LLM results will appear here...
          </p>
        ) : (
          messages.map((msg, i) => (
            <p key={i} className="mb-2">
              {msg}
            </p>
          ))
        )}
      </div>
    </div>
  );
}