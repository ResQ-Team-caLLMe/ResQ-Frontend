"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Chatbox, Message } from "../components/ChatBox";
import { Box, Typography, Button, Toolbar, AppBar } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const goToHome = () => {
        router.push("/");
    };

    const { startRecording, stopRecording, mediaStream, transcript } =
        useAudioRecorder();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMicOn, setMicOn] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [userInput, setUserInput] = useState("");

    const lastUserMessageIdRef = useRef<number | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleStartCall = () => {
        setInCall(true);
        setMessages((prev) => {
            const timestamp = Date.now();
            return [
                ...prev,
                {
                    id: timestamp,
                    timestamp: new Date(),
                    name: "system",
                    sender: "system",
                    text: "Call started",
                },
                {
                    id: timestamp + 1, // ensure unique
                    timestamp: new Date(),
                    sender: "bot",
                    name: "ResQ",
                    text: "Hello! You've reached the ResQ AI assistant. Please state the nature of your emergency.",
                },
            ];
        });
        speak("Hello! You've reached the ResQ AI assistant. Please state the nature of your emergency.", () => {
            startRecording();
        });
    };

    const handleEndCall = () => {
        setInCall(false);

        // Stop any currently playing audio safely
        if (audioRef.current) {
            try {
                audioRef.current.pause();
            } catch (err) {
                console.warn("Audio already stopped or invalid state", err);
            }
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

    const handleSendText = () => {
        if (!userInput.trim()) return;

        const newId = Date.now();
        const text = userInput.trim();

        // Add user message
        setMessages((prev) => [
            ...prev,
            {
                id: newId,
                timestamp: new Date(),
                sender: "user",
                name: "You",
                text,
            },
        ]);

        lastUserMessageIdRef.current = newId;
        setUserInput(""); // clear input

        // Bot responds
        const botReply = `I heard you say: "${text}". How can I assist further?`;
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now() + 1,
                timestamp: new Date(),
                sender: "bot",
                name: "ResQ",
                text: botReply,
            },
        ]);

        speak(botReply);
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
                    resumeMic();
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
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)", // semi-transparent black
                    backdropFilter: "blur(12px)",          // blur effect
                    WebkitBackdropFilter: "blur(12px)",    // Safari support
                    borderBottom: "1px solid rgba(255,255,255,0.1)", // subtle line
                    boxShadow: "none",
                }}
            >
                <Toolbar sx={{ position: "relative" }}>
                    {/* Left */}
                    <Box>
                        <Typography
                            sx={{ cursor: "pointer" }}
                            onClick={goToHome}
                            variant="h6"
                            fontWeight="bold"
                        >
                            ResQ
                        </Typography>
                    </Box>

                    {/* Middle - centered nav */}
                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            gap: 4,
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        <Button color="inherit" onClick={goToHome}>Home</Button>
                        <Button color="inherit" onClick={goToHome}>Dashboard</Button>
                    </Box>

                    {/* Right */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" sx={{ borderRadius: 4 }}>Request Demo</Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    width: "100%",
                    maxWidth: 600,
                    mx: "auto",
                    mt: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: 300, mb: 2, textAlign: "center" }}
                >
                    {inCall ? "Click end to terminate the call" : "Press call to connect"}
                </Typography>

                {inCall ? (
                    <>
                        <Button
                            onClick={handleEndCall}
                            variant="contained"
                            sx={{
                                bgcolor: isMicOn ? "success.main" : "grey.500",
                                width: 100,
                                height: 100,
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
                        <Typography color={isMicOn ? "white" : "gray"}>
                            {isMicOn ? "You can talk now " : "You can talk after the mic turned green"}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                my: 2,
                                width: "100%",
                                maxWidth: 600,
                            }}
                        >
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type your message here..."
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    fontSize: "1rem",
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSendText();
                                }}
                                disabled={!inCall}
                            />
                            <Button
                                onClick={handleSendText}
                                variant="contained"
                                sx={{ ml: 1, bgColor: "blue-500" }}
                                disabled={!inCall}
                            >
                                Send
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Button
                        onClick={handleStartCall}
                        variant="contained"
                        sx={{
                            bgcolor: "error.main",
                            color: "white",
                            width: 100,
                            height: 100,
                            mb: 2,
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
