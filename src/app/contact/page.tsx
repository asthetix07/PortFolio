"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Column, Heading, Text, Input, Button } from "@once-ui-system/core";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <Column fillWidth maxWidth="s" padding="xl" gap="m" align="center" horizontal="center" s={{ padding: "m" }}>
      <Heading variant="heading-strong-xl" align="center" marginBottom="s">
        Contact Me
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-medium" align="center" marginBottom="l">
        Have a question or want to work together? Send me a message!
      </Text>

      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="custom-form-group">
          <label className="custom-label" htmlFor="name">Name</label>
          <Input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Your name"
          />
        </div>

        <div className="custom-form-group">
          <label className="custom-label" htmlFor="email">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="custom-form-group">
          <label className="custom-label" htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            required
            placeholder="What's on your mind?"
            className="custom-textarea"
            rows={5}
          />
        </div>

        <Button
          id="submit-btn"
          type="submit"
          disabled={status === "sending"}
          fillWidth
          size="m"
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </Button>

        {status === "success" && (
          <Text variant="body-default-s" onBackground="brand-medium" align="center" style={{ color: "var(--brand-on-background-medium)" }}>
            Message sent successfully! I'll get back to you soon.
          </Text>
        )}
        {status === "error" && (
          <Text variant="body-default-s" onBackground="accent-medium" align="center" style={{ color: "var(--accent-on-background-medium)" }}>
            Something went wrong. Please try again.
          </Text>
        )}
      </form>
    </Column>
  );
}
