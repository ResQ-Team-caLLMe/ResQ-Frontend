import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/v1/conversational/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 500 });
  }
}
