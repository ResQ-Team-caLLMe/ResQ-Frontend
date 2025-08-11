import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioBlob = formData.get("audio") as File;
  const buffer = Buffer.from(await audioBlob.arrayBuffer());

  // 🔹 TODO: send buffer to Whisper/Deepgram/etc. for STT
  console.log("Received audio chunk:", buffer.length, "bytes");

  return NextResponse.json({ success: true });
}
