"use client"

import { useState } from "react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";

export default function Home() {
  const { recording, startRecording, stopRecording } = useAudioRecorder();
  const [messages, setMessages] = useState<string[]>([]);

  return (
    <div className="bg-gradient-to-b from-red-600 to-red-800 text-white min-h-screen flex flex-col justify-center items-center p-8">
      <h1 className="text-4xl font-bold mb-4 text-center">ResQ</h1>
      <h2 className="text-2xl font-bold mb-4 text-center">AI-Powered Emergency Call Center</h2>
      <p className="mb-8 text-center max-w-xl">Call to report emergencies, our AI will connect you to the nearest responders.</p>
      {!recording ? (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 bg-white text-red-700 px-6 py-3 rounded-lg text-xl font-bold shadow-lg hover:bg-gray-200 cursor-pointer"
        >
          {/* <Phone className="w-6 h-6" /> */}
          Start Call
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg text-xl font-bold shadow-lg hover:bg-gray-700 cursor-pointer"
        >
          {/* <PhoneOff className="w-6 h-6" /> */}
          End Call
        </button>
      )}

      {/* Chatbox for LLM output */}
      <div className="bg-white text-black rounded-lg shadow-lg mt-8 p-4 w-full max-w-2xl h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">LLM results will appear here...</p>
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