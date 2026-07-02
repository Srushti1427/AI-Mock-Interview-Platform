import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { isAdmin } from "@/utils/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { AptitudeTest } from "@/utils/schema";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const adminEmail = url.searchParams.get("email");
    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const emailFilter = url.searchParams.get("userEmail") || "";

    const db = await connectToDatabase();

    const filter = {};
    if (emailFilter) filter.createdBy = { $regex: emailFilter, $options: "i" };

    const total = await db.collection(AptitudeTest).countDocuments(filter);
    const tests = await db
      .collection(AptitudeTest)
      .find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      tests: tests.map((t) => ({ ...t, _id: t._id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Admin aptitude error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
