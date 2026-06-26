import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const [timestamp, signatureHex] = sessionCookie.value.split(".");
    if (!timestamp || !signatureHex) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify the signature
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!sessionSecret) {
      return NextResponse.json({ authenticated: false }, { status: 500 });
    }
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(sessionSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`admin-session:${timestamp}`)
    );
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signatureHex !== expectedHex) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check if session has expired (8 hours)
    const sessionAge = Date.now() - parseInt(timestamp, 10);
    if (sessionAge > 8 * 60 * 60 * 1000) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
