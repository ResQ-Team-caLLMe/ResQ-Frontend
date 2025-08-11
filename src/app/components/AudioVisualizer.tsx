"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    mediaStream: MediaStream;
    barColor?: string;
    barWidth?: number;
}

export const AudioVisualizer = ({
    mediaStream,
    barColor = "#ffffff",
    barWidth = 2,
}: AudioVisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!mediaStream || !canvasRef.current) return;

        const audioContext = new window.AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        let animationFrameId: number;

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            // 1. Clear the canvas completely before each frame
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            // Set line style
            canvasCtx.lineWidth = barWidth;
            canvasCtx.strokeStyle = barColor;
            canvasCtx.beginPath();

            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                // 2. New logic to draw from the center
                // dataArray values are 0-255. 128 is the center (silence).
                const v = (dataArray[i] - 128) / 128.0; // Waveform values from -1.0 to 1.0
                const y = (canvas.height / 2) + (v * canvas.height / 2);

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            source.disconnect();
            audioContext.close();
        };
    }, [mediaStream, barColor, barWidth]);

    return <canvas ref={canvasRef} width="300" height="60" />;
};
