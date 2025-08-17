"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
// import { AudioVisualizer } from "./components/AudioVisualizer";
import { Chatbox, Message } from "../components/ChatBox";
import { Box, Typography, Button } from "@mui/material";

export default function Home() {
    const { startRecording, stopRecording, mediaStream, transcript } =
        useAudioRecorder();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMicOn, setMicOn] = useState(false);
    const [inCall, setInCall] = useState(false);

    const lastUserMessageIdRef = useRef<number | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
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

    const speak = async (text: string, onDone?: () => void) => {
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();
            if (data.audioContent) {
                // Stop previous audio if any
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }

                const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
                audioRef.current = audio;

                audio.onplay = () => {
                    pauseMic(); // mute mic
                };

                audio.onended = () => {
                    resumeMic(); // unmute mic
                    audioRef.current = null;
                    if (onDone) onDone();
                };

                await audio.play();
            }
        } catch (err) {
            console.error("TTS error:", err);
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
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: { xs: 2, sm: 4 },
                fontFamily: "sans-serif",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 600,
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}
                >
                    ResQ
                </Typography>
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: 300, mb: 3, textAlign: "center" }}
                >
                    AI-Powered Emergency Call Center
                </Typography>

                {inCall ? (
                    <>
                        <Button
                            onClick={handleEndCall}
                            variant="contained"
                            sx={{
                                bgcolor: isMicOn ? "success.main" : "grey.500",
                                width: 112,
                                height: 112,
                                borderRadius: "50%",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                mb: 1,
                                boxShadow: 3,
                                "&:hover": {
                                    bgcolor: "grey.700",
                                },
                                transition: "all 0.2s",
                                ":active": {
                                    transform: "scale(0.95)",
                                },
                            }}
                        >
                            End
                        </Button>
                        <Typography>
                            {isMicOn ? "You can talk now " : "You can talk after the mic turned green"}
                        </Typography>
                    </>
                ) : (
                    <Button
                        onClick={handleStartCall}
                        variant="contained"
                        sx={{
                            bgcolor: "error.main",
                            color: "white",
                            width: 112,
                            height: 112,
                            borderRadius: "50%",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            boxShadow: 3,
                            "&:hover": {
                                bgcolor: "grey.200",
                                color: "error.main",
                            },
                            transition: "all 0.2s",
                            ":active": {
                                transform: "scale(0.95)",
                            },
                        }}
                    >
                        Call
                    </Button>
                )}

                {messages.length > 0 && <Chatbox messages={messages} />}
            </Box>
        </Box>
    );
}
