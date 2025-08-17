"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Chatbox, Message } from "../components/ChatBox";
import { Box, Typography, Button, Toolbar, AppBar } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Hardcoded bot responses
const botResponses = [
    "**IMPORTANT: If the situation is safe or help has arrived, say 'SAFE' or 'ALL CLEAR'.**\n\nI understand this is an emergency. To assist you effectively, I need some important information.",
    "Where is the location of the incident?",
    "Okay, I have some understanding of the situation. Let me confirm a few more important details.",
    "What is the condition of the victim right now?",
    "Almost all information is complete. I will process the emergency assistance for you immediately.",
    "Is there still any danger in the surrounding area?",
    "Thank you for confirming. The emergency call has been safely completed. I hope everything goes well. Stay safe and don’t hesitate to reach us again if needed.",
];

export default function CallPage() {
    const router = useRouter();

    const goToHome = () => {
        router.push("/");
    };

    const goToDashboard = () => {
        router.push("/dashboard");
    };

    const { startRecording, stopRecording, mediaStream, transcript } =
        useAudioRecorder();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMicOn, setMicOn] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [userInput, setUserInput] = useState("");

    // State to track conversation flow
    const [conversationStep, setConversationStep] = useState(0);

    const lastUserMessageIdRef = useRef<number | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Helper to ONLY add a bot message to the chat UI
    const addBotMessage = (text: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random(), // Unique ID
                timestamp: new Date(),
                sender: "bot",
                name: "ResQ",
                text: text,
            },
        ]);
    };

    // This function adds all text first, then speaks
    const sendToLLM = async (text: string) => {
        // A 1.5-second delay happens BEFORE the bot's response
        setTimeout(() => {
            switch (conversationStep) {
                case 0: // 1st user input
                    addBotMessage(botResponses[0]);
                    addBotMessage(botResponses[1]);
                    speak(botResponses[0], () => {
                        speak(botResponses[1]);
                    });
                    break;
                case 1: // 2nd user input
                    addBotMessage(botResponses[2]);
                    addBotMessage(botResponses[3]);
                    speak(botResponses[2], () => {
                        speak(botResponses[3]);
                    });
                    break;
                case 2: // 3rd user input
                    addBotMessage(botResponses[4]);
                    addBotMessage(botResponses[5]);
                    speak(botResponses[4], () => {
                        speak(botResponses[5]);
                    });
                    break;
                case 3: // 4th user input (final response)
                    addBotMessage(botResponses[6]);
                    speak(botResponses[6], () => {
                        handleEndCall();
                    });
                    break;
                default:
                    console.warn("Conversation flow ended or step is out of bounds.");
                    break;
            }
            setConversationStep((prev) => prev + 1);
        }, 1500); // 1.5-second delay
    };

    const handleStartCall = () => {
        setConversationStep(0);
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
                    id: timestamp + 1,
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
        setConversationStep(0);
        setInCall(false);
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
        abortSpeak();
        const newId = Date.now();
        const text = userInput.trim();
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
        setUserInput("");
        sendToLLM(text);
    };

    // --- START: FIX FOR INFINITE LOOP ---

    // Define finalizeCurrentMessage with useCallback to prevent it from being recreated
    // on every render unless its dependencies (messages, conversationStep) change.
    const finalizeCurrentMessage = useCallback(() => {
        if (lastUserMessageIdRef.current) {
            const currentMsg = messages.find(
                (m) => m.id === lastUserMessageIdRef.current
            );
            if (!currentMsg) return;
            const finalText = currentMsg.text;
            lastUserMessageIdRef.current = null;
            sendToLLM(finalText);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, conversationStep]);

    // Create a ref to hold the latest version of the finalizeCurrentMessage callback.
    const finalizeCallbackRef = useRef(finalizeCurrentMessage);

    // This effect ensures the ref always has the most up-to-date version of the callback.
    useEffect(() => {
        finalizeCallbackRef.current = finalizeCurrentMessage;
    }, [finalizeCurrentMessage]);

    // --- END: FIX FOR INFINITE LOOP ---

    const speak = async (text: string, onDone?: () => void) => {
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (data.audioContent) {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
                const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
                audioRef.current = audio;
                audio.onplay = () => {
                    pauseMic();
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

    const abortSpeak = () => {
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            } catch (err) {
                console.warn("Abort speak error", err);
            }
            audioRef.current = null;
        }
    };

    const pauseMic = () => {
        setMicOn(false);
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => (track.enabled = false));
        }
    };

    const resumeMic = () => {
        setMicOn(true);
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => (track.enabled = true));
        }
    };

    // This is the main useEffect that now safely handles transcripts.
    useEffect(() => {
        if (transcript?.text) {
            if (transcript.message_type === "PartialTranscript") {
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                }
                silenceTimerRef.current = setTimeout(() => {
                    // Call the latest version of the function from the ref.
                    finalizeCallbackRef.current();
                }, 2000);

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
        // By only depending on `transcript`, this effect no longer causes an infinite loop.
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
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "none",
                }}
            >
                <Toolbar sx={{ position: "relative", minHeight: 64 }}>
                    <Box
                        sx={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                        }}
                        onClick={goToHome}
                    >
                        <Image
                            src="/logo_ResQ.png"
                            alt="ResQ Logo"
                            width={80}
                            height={80}
                            style={{
                                height: 80,
                                transform: "scale(1.5)",
                                transformOrigin: "center",
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            gap: 4,
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }}
                    >
                        <Button color="inherit" onClick={goToHome}>Back to Home</Button>
                        <Button color="inherit" onClick={goToDashboard}>Dashboard</Button>
                    </Box>
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
                                "&:hover": { bgcolor: "grey.700" },
                                transition: "all 0.2s",
                                ":active": { transform: "scale(0.95)" },
                            }}
                        >
                            End
                        </Button>
                        <Typography color={isMicOn ? "white" : "gray"}>
                            {isMicOn ? "You can talk now " : "You can talk after the mic turned green"}
                        </Typography>
                        <Box sx={{ display: "flex", my: 2, width: "100%", maxWidth: 600 }}>
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