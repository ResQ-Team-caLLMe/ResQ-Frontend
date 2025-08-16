// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export async function POST(req: NextRequest) {
  try {
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload file buffer directly to AssemblyAI
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadUrl = await client.files.upload(buffer);

    // Run transcription
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      // Set to "id" for Indonesian, "en" for English, or omit for auto-detect
      language_detection: true,
    });

    return NextResponse.json({ text: transcript.text });
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
