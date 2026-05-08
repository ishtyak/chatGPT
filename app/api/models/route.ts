import { NextResponse } from "next/server";

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    const backendUrl =
      process.env.BACKEND_URL || "http://localhost:4000";
    const res = await fetch(`${backendUrl}/api/models`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch models from backend" },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: "Backend unreachable" },
      { status: 503 },
    );
  }
}
