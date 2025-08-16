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

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    chunksRef.current = [];

    // gather small chunks continuously (every 1s)
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    recorder.start(1000); // 1s timeslice

    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    recorderRef.current?.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
  };

  // called by the page when silence >= 2s
  const flush = async (): Promise<void> => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    // ensure the latest buffered audio is flushed from MediaRecorder
    await new Promise<void>((resolve) => {
      const handler = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
        recorder.removeEventListener("dataavailable", handler);
        resolve();
      };
      recorder.addEventListener("dataavailable", handler, { once: true });
      try {
        recorder.requestData();
      } catch {
        resolve(); // some browsers might not support requestData
      }
    });

    if (chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = []; // reset for the next utterance

    const formData = new FormData();
    formData.append("file", blob, "utterance.webm");

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.text) {
        setTranscript({ text: data.text, message_type: "FinalTranscript" });
      }
    } catch (err) {
      // keep the app alive even if one flush fails
      console.error("Transcription failed:", err);
    }
  };

  return { recording, startRecording, stopRecording, mediaStream, transcript, flush };
}
