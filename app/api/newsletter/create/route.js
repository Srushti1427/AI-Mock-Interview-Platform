import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Newsletter } from "@/utils/schema";

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    const resp = await db.collection(Newsletter).insertOne(body);

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Forward the message to the admin email invisibly
    try {
      await fetch('https://formsubmit.co/ajax/srushtishivanwar24@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': origin
        },
        body: JSON.stringify({
          name: body.newName,
          email: body.newEmail,
          message: body.newMessage,
          _subject: `New Message from ${body.newName}`
        })
      });
    } catch (emailErr) {
      console.error('Failed to send email notification:', emailErr);
    }

    return NextResponse.json({ success: !!resp.acknowledged });
  } catch (err) {
    console.error('Newsletter create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
