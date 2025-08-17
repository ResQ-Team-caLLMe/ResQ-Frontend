import { NextResponse } from "next/server";
import textToSpeech, { protos } from "@google-cloud/text-to-speech";

// Initialize client (works with either GOOGLE_APPLICATION_CREDENTIALS or credentials from env)
const client = new textToSpeech.TextToSpeechClient({
  // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  // OR for env-based:
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
        input: { text },
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" },
      };

    const [response] = await client.synthesizeSpeech(request);

    return NextResponse.json({
      audioContent: response.audioContent?.toString("base64"),
    });
  } catch (err) {
    console.error("TTS API error:", err);
    return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
  }
}
