"use client";

import { useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
import { Box, Typography, Avatar, Card, Stack } from "@mui/material";

export interface Message {
    id: number;
    sender: "user" | "bot" | "system";
    name: string;
    text: string;
    timestamp: Date;
}

interface ChatboxProps {
    messages: Message[];
}

export const Chatbox = ({ messages }: ChatboxProps) => {
    const chatboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTo({
                top: chatboxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <Box
            ref={chatboxRef}
            sx={{
                width: "100%",
                height: 330,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.1)", // main frosted background
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
            }}
        >
            <Box sx={{ flexGrow: 1 }} /> {/* spacer to push messages to bottom */}
            {messages.map((msg) => {
                const isUser = msg.sender === "user";
                const isBot = msg.sender === "bot";

                return (
                    <Stack
                        key={msg.id}
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-end"
                        justifyContent={isUser ? "flex-end" : "flex-start"}
                        sx={{ width: "100%" }}
                    >
                        {/* Avatar for bot/user */}
                        {msg.sender !== "system" && !isUser && (
                            <Stack alignItems="center" spacing={0.5} sx={{ width: 56, flexShrink: 0 }}>
                                <Avatar
                                    sx={{ width: 32, height: 32, bgcolor: isBot ? "error.main" : "primary.main" }}
                                >
                                    {isBot ? <Bot size={20} /> : <User size={20} />}
                                </Avatar>
                                <Typography variant="caption" sx={{ color: "gray.300", textAlign: "center" }}>
                                    {msg.name}
                                </Typography>
                            </Stack>
                        )}

                        {/* Message bubble */}
                        <Box sx={{ display: "flex", flexDirection: "column", maxWidth: "85%" }}>
                            <Card
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    bgcolor: isUser ? "primary.main" : isBot ? "grey.800" : "transparent",
                                    color: msg.sender === "system" ? "yellow" : "white",
                                    borderRadius: 2,
                                    borderTopRightRadius: isUser ? 0 : 8,
                                    borderBottomLeftRadius: isBot ? 0 : 8,
                                    textAlign: msg.sender === "system" ? "center" : "left",
                                    fontStyle: msg.sender === "system" ? "italic" : "normal",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                }}
                            >
                                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                    {msg.text}
                                </Typography>
                            </Card>

                            {msg.sender !== "system" && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.5,
                                        color: "gray.400",
                                        alignSelf: isUser ? "flex-end" : "flex-start",
                                    }}
                                >
                                    {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Typography>
                            )}
                        </Box>

                        {/* Avatar on right for user */}
                        {isUser && (
                            <Stack alignItems="center" spacing={0.5} sx={{ width: 56, flexShrink: 0 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                    <User size={20} />
                                </Avatar>
                                <Typography variant="caption" sx={{ color: "gray.300", textAlign: "center" }}>
                                    {msg.name}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                );
            })}
        </Box>
    );
};
