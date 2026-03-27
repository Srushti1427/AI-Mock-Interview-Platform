import { transcribeAudio } from "@/utils/GeminiAIModal";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { base64Audio, interviewId, userEmail } = await req.json();

    if (!base64Audio) {
      return new Response(JSON.stringify({ error: "No audio provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${interviewId || "anon"}_${Date.now()}.webm`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Audio, "base64"));

    const transcription = await transcribeAudio(base64Audio, "audio/webm");

    return new Response(
      JSON.stringify({ transcription, filePath: `/uploads/${filename}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
