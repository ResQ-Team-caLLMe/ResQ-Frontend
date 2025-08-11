"use client";

import { useState, useRef } from "react";

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  // 1. Add state to hold the MediaStream object
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  async function startRecording() {
    // Get the stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Store the stream in state
    setMediaStream(stream);

    // Continue with your existing logic
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const formData = new FormData();
        formData.append("audio", event.data, "chunk.wav");
        await fetch("/api/stream-audio", { method: "POST", body: formData });
      }
    };

    mediaRecorder.start(1000); // every 1s
    setRecording(true);
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // 3. Important: Stop the stream tracks to release the microphone
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setRecording(false);
    setMediaStream(null); // Clear the stream from state
  }

  // 4. Return the mediaStream along with the other values
  return {
    recording,
    startRecording,
    stopRecording,
    mediaStream,
    mediaRecorderRef, // <-- Add this
  };
}
