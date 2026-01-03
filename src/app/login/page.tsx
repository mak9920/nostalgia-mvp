"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email) return;

    setLoading(true);
    setError(null);

 const redirectTo = `${window.location.origin}/auth/callback?next=/create`;


    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) setError(error.message);
    else setSent(true);

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1200px at 80% 20%, #1e2a78 0%, #0b1020 45%, #000 100%)",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 28,
          borderRadius: 20,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
          Erwecke Fotos zum Leben
        </h1>

        <p style={{ marginTop: 10, color: "rgba(255,255,255,0.75)" }}>
          Lade ein Foto hoch und erhalte ein realistisches Video mit sanfter,
          natürlicher Bewegung.
        </p>

        {!sent ? (
          <>
            <label
              style={{
                display: "block",
                marginTop: 18,
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Deine E-Mail Adresse
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              type="email"
              style={{
                width: "100%",
                marginTop: 6,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                outline: "none",
                fontSize: 14,
              }}
            />

            <button
              onClick={handleLogin}
              disabled={loading || !email}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "#fff",
                color: "#000",
                fontWeight: 700,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Sende Magic Link …" : "Kostenlos starten"}
            </button>

            <p
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
              }}
            >
              Kein Passwort · Kein Abo · Abmeldung jederzeit
            </p>

            {error && (
              <p style={{ marginTop: 10, color: "#ff8a8a", fontSize: 13 }}>
                {error}
              </p>
            )}
          </>
        ) : (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 15 }}>✉️ Wir haben dir einen Login-Link gesendet.</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              Öffne deine E-Mails und klicke auf den Link, um fortzufahren.
            </p>
          </div>
        )}

        <div
          style={{
            marginTop: 22,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
          }}
        >
          🔒 Sicherer Login · Keine Weitergabe deiner Daten
        </div>
      </div>
    </main>
  );
}
