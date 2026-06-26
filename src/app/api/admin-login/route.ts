import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const correctEmail = process.env.ADMIN_EMAIL;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctEmail || !correctPassword) {
      return NextResponse.json(
        { error: "Admin credentials not configured on server." },
        { status: 500 }
      );
    }

    if (email !== correctEmail || password !== correctPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create a signed session token (simple HMAC-based approach)
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!sessionSecret) {
      return NextResponse.json(
        { error: "Session secret not configured on server." },
        { status: 500 }
      );
    }
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(sessionSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const timestamp = Date.now().toString();
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`admin-session:${timestamp}`)
    );
    const signatureHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const token = `${timestamp}.${signatureHex}`;

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie — cannot be read by JavaScript (DevTools safe)
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
