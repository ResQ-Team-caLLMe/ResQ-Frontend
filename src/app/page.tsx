"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { Chatbox } from "./components/ChatBox";
import { Message } from "./components/ChatBox";

// A mock conversation flow to simulate a real call
const mockConversation: Omit<Message, "id" | "timestamp">[] = [
  { sender: "system", name: "System", text: "Connecting to ResQ call center..." },
  { sender: "bot", name: "ResQ", text: "Hello! You've reached the ResQ AI assistant. Please state the nature of your emergency." },
  { sender: "user", name: "You", text: "Hi, there's a fire in a building on Main Street." },
  { sender: "bot", name: "ResQ", text: "Understood. A building fire on Main Street. Can you provide the exact address or a nearby landmark?" },
  { sender: "user", name: "You", text: "It's right next to the city library, number 123." },
  { sender: "bot", name: "ResQ", text: "Thank you. I will forward the call to the fire department, please don't hang up the call." },
  { sender: "system", name: "System", text: "Analyzing location... Forwarding to the nearest Fire Department." },
  { sender: "bot", name: "Fire Department", text: "Help is on the way. Is anyone injured?" },
  { sender: "user", name: "You", text: "I don't think so, everyone seems to have gotten out." },
  { sender: "bot", name: "Fire Department", text: "That's good to hear. Please remain at a safe distance. We will be there shortly." },
];

export default function Home() {
  const { recording, startRecording, stopRecording, mediaStream } = useAudioRecorder();
  const [messages, setMessages] = useState<Message[]>([]);
  const chatboxRef = useRef<HTMLDivElement>(null);

  // Use a ref to store timeout IDs to clear them later
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  // Function to clear all scheduled timeouts
  const clearTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  // Main function to handle the conversation simulation
  const startConversation = () => {
    let currentMessageIndex = 0;

    const addNextMessage = () => {
      if (currentMessageIndex < mockConversation.length) {
        const nextMessage = {
          ...mockConversation[currentMessageIndex],
          id: Date.now() + currentMessageIndex,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, nextMessage]);
        currentMessageIndex++;

        // Schedule the next message and store its timeout ID
        const delay = 1500 + Math.random() * 1500;
        const timeoutId = setTimeout(addNextMessage, delay);
        timeoutIdsRef.current.push(timeoutId);
      }
    };

    // Start the conversation flow
    addNextMessage();
  };

  const handleStartCall = () => {
    startRecording();
    // Start the mock conversation after a brief delay
    const initialTimeoutId = setTimeout(startConversation, 1000);
    timeoutIdsRef.current.push(initialTimeoutId);
  };

  const handleEndCall = () => {
    setMessages((prev) => [...prev, { id: Date.now(), timestamp: new Date(), name: "system", sender: "system", text: "Call ended" }])
    stopRecording();
    // Stop any further messages from being added
    clearTimeouts();
  };

  // Effect to auto-scroll the chatbox
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect to clean up timeouts when the component unmounts
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

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
              className="flex items-center justify-center bg-gray-500 text-white w-20 h-20 rounded-full text-lg font-bold shadow-lg hover:bg-gray-700 cursor-pointer active:scale-95 transition-all duration-200"
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