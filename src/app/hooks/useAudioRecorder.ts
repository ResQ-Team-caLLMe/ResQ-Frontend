"use client";

import { useState, useRef, useEffect } from "react";

export type Transcript = {
  text: string;
  message_type: "PartialTranscript" | "FinalTranscript";
};

export function useAudioRecorder() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Convert Float32 -> PCM16
  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const startRecording = async () => {
    setTranscript(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      const websocket_url = `${process.env.NEXT_PUBLIC_STT_WS_URL}` || "ws://localhost:3001"
      socketRef.current = new WebSocket(websocket_url);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected!");

        // Create 16kHz AudioContext
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });

        // Get mic input
        const source = audioContextRef.current.createMediaStreamSource(stream);

        // Create processor node
        processorRef.current = audioContextRef.current.createScriptProcessor(
          4096,
          1,
          1
        );

        source.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

        // On audio buffer available
        processorRef.current.onaudioprocess = (e) => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            const float32Data = e.inputBuffer.getChannelData(0);
            const pcm16Buffer = floatTo16BitPCM(float32Data);
            socketRef.current.send(pcm16Buffer);
          }
        };
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "transcript") {
          // console.log("Transcript received:", data); // log in browser
          setTranscript(data as Transcript);
        } else if (data.type === "error") {
          console.error("Server error:", data.message);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket disconnected.");
      };
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send("terminate");
      socketRef.current.close();
    }
    mediaStream?.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    mediaStream,
    transcript,
  };
}
