"use client";

import { useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";

// Define and export the structure for a single message
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

    // Effect to auto-scroll the chatbox
    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTo({
                top: chatboxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <>
            {/* Global styles for a custom scrollbar */}
            <style jsx global>{`
                /* For Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.7) transparent;
                }

                /* For Chrome, Safari, and other WebKit browsers */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                /* Make the thumb transparent by default */
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    border-radius: 20px;
                    border: 3px solid transparent;
                }

                /* On hover, make the thumb visible */
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                }

                /* Optional: Darken thumb when dragging */
                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background-color: rgba(156, 163, 175, 0.7);
                }
            `}</style>

            <div
                ref={chatboxRef}
                className="custom-scrollbar bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg my-6 p-4 w-full h-80 overflow-y-auto flex flex-col gap-4"
            >
                {/* Spacer to push content to the bottom */}
                <div className="flex-grow" />
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        // CHANGE 1: Use items-end to align avatar to the bottom of the bubble
                        className={`flex items-end gap-3 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                            }`}
                    >
                        {/* Icon and Name Column (Bot, System, User) */}
                        {msg.sender !== "system" && (
                            <div className="flex flex-col items-center flex-shrink-0 w-16 text-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${msg.sender === "bot" ? "bg-red-500" : "bg-blue-500"
                                        }`}
                                >
                                    {msg.sender === "bot" ? <Bot size={20} /> : <User size={20} />}
                                </div>
                                {/* CHANGE 2: Allow name to wrap */}
                                <p className="text-xs text-gray-300 break-words">{msg.name}</p>
                            </div>
                        )}

                        {/* Message Bubble, Text, and Timestamp */}
                        <div className={`flex flex-col w-full ${msg.sender === 'system' ? 'items-center' : ''}`}>
                            <div
                                className={`rounded-lg px-3 py-2 text-white shadow ${msg.sender === "user"
                                    ? "bg-blue-600 rounded-br-none self-end" // Added self-end to align bubble
                                    : msg.sender === "bot"
                                        ? "bg-gray-700 rounded-bl-none self-start" // Added self-start to align bubble
                                        : "bg-transparent text-yellow-300 italic text-center w-full p-0"
                                    }`}
                            >
                                <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                            </div>
                            {msg.sender !== "system" && (
                                // CHANGE: Conditionally align the timestamp
                                <p className={`mt-1 text-xs text-gray-400 ${msg.sender === "user" ? "self-end" : "self-start"
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};