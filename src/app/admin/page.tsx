"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Column, Heading, Text, Input, Button } from "@once-ui-system/core";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Credentials are sent to the server and validated server-side
      // They are NEVER included in the client JS bundle
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Server has set an httpOnly cookie — no localStorage needed
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Column fillWidth vertical="center" horizontal="center" align="center" padding="m" style={{ minHeight: "60vh" }}>
      <Column
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
        padding="xl"
        maxWidth="xs"
        fillWidth
        gap="m"
        shadow="l"
      >
        <Column gap="xs" align="center" horizontal="center">
          <Heading variant="heading-strong-l" align="center">
            Admin Login
          </Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
            Only you should know these credentials.
          </Text>
        </Column>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="custom-form-group">
            <label className="custom-label" htmlFor="admin-email">Email</label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@mysite.com"
            />
          </div>

          <div className="custom-form-group">
            <label className="custom-label" htmlFor="admin-password">Password</label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <Text variant="body-default-s" style={{ color: "var(--accent-on-background-medium)" }} align="center">
              {error}
            </Text>
          )}

          <Button type="submit" fillWidth size="m" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Column>
    </Column>
  );
}
