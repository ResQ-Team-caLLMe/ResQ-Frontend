"use client";

import { useState, useRef } from "react";

export type Transcript = {
  text: string;
  message_type: "FinalTranscript";
};

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);

    recorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    recorderRef.current.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.text) {
        setTranscript({ text: data.text, message_type: "FinalTranscript" });
      } else {
        console.error("Transcription failed:", data.error);
      }
    };

    recorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    recorderRef.current?.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
  };

  return { recording, startRecording, stopRecording, mediaStream, transcript };
}
