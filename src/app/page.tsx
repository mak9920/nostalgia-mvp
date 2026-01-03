import Link from "next/link";

export default function Home() {
  return (
    <main style={styles.page}>
      {/* Background glow */}
      <div style={styles.bgGlow} aria-hidden="true" />

      {/* Top bar */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoMark} />
          <div>
            <div style={styles.brandName}>Photo Reel</div>
            <div style={styles.brandTag}>Make memories move</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <a href="#how" style={styles.navLink}>So funktioniert’s</a>
          <a href="#pricing" style={styles.navLink}>Preis</a>
          <a href="#faq" style={styles.navLink}>FAQ</a>
          <Link href="/create" style={styles.navCta}>Jetzt starten</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            <span>In Minuten zum Video</span>
          </div>

          <h1 style={styles.h1}>
            Erwecke Fotos zum Leben – <span style={styles.h1Accent}>als kurzes Video</span>
          </h1>

          <p style={styles.lead}>
            Lade ein Foto hoch und erhalte ein MP4 mit sanfter Bewegung. Perfekt als Geschenk,
            Erinnerung oder für Social Media.
          </p>

          <div style={styles.heroCtas}>
            <Link href="/create" style={styles.primaryCta}>
              Foto hochladen
              <span style={{ opacity: 0.8, marginLeft: 10 }}>→</span>
            </Link>
            <a href="#pricing" style={styles.secondaryCta}>
              Preis ansehen
            </a>
          </div>

          <div style={styles.trustRow}>
            <div style={styles.trustItem}>
              <div style={styles.trustIcon}>⚡</div>
              <div>
                <div style={styles.trustTitle}>Sofort als MP4</div>
                <div style={styles.trustText}>Abspielen & downloaden</div>
              </div>
            </div>
            <div style={styles.trustItem}>
              <div style={styles.trustIcon}>🔒</div>
              <div>
                <div style={styles.trustTitle}>Privat</div>
                <div style={styles.trustText}>Dein Foto bleibt bei dir</div>
              </div>
            </div>
            <div style={styles.trustItem}>
              <div style={styles.trustIcon}>✨</div>
              <div>
                <div style={styles.trustTitle}>Einfach</div>
                <div style={styles.trustText}>1 Foto, 1 Klick</div>
              </div>
            </div>
          </div>

          {/* Social proof strip */}
          <div style={styles.socialProof}>
            <div style={styles.socialTitle}>Beliebt für</div>
            <div style={styles.socialPills}>
              <span style={styles.pill}>🎁 Geschenke</span>
              <span style={styles.pill}>👨‍👩‍👧‍👦 Familie</span>
              <span style={styles.pill}>🐶 Haustiere</span>
              <span style={styles.pill}>💍 Hochzeit</span>
              <span style={styles.pill}>🕯️ Erinnerungen</span>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div style={styles.heroRight}>
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <div style={styles.previewDots}>
                <span style={{ ...styles.dot, background: "#FF5F57" }} />
                <span style={{ ...styles.dot, background: "#FEBC2E" }} />
                <span style={{ ...styles.dot, background: "#28C840" }} />
              </div>
              <div style={styles.previewTitle}>Preview</div>
            </div>

            <div style={styles.previewBody}>
              <div style={styles.previewMock} aria-hidden="true">
                <div style={styles.previewMockInner}>
                  <div style={styles.mockCircle} />
                  <div style={styles.mockLineWide} />
                  <div style={styles.mockLine} />
                  <div style={styles.mockLine} />
                </div>
              </div>

              <div style={styles.previewCaption}>
                <div style={{ fontWeight: 800 }}>Dein Video erscheint hier</div>
                <div style={{ color: "#6B7280", marginTop: 6, lineHeight: 1.5 }}>
                  Upload → Processing → MP4 Download. <br />
                  Tipp: klare Gesichter, gute Beleuchtung.
                </div>
              </div>

              <Link href="/create" style={styles.previewCta}>
                Jetzt ausprobieren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.h2}>So funktioniert’s</h2>
          <p style={styles.sub}>
            Drei Schritte. Kein Abo. Kein Aufwand.
          </p>
        </div>

        <div style={styles.grid3}>
          <Step
            n="1"
            title="Foto hochladen"
            text="JPG/PNG auswählen und E-Mail angeben."
          />
          <Step
            n="2"
            title="Video wird erstellt"
            text="Wir erzeugen ein kurzes MP4 mit sanfter Bewegung."
          />
          <Step
            n="3"
            title="Abspielen & downloaden"
            text="Direkt im Browser ansehen oder herunterladen."
          />
        </div>
      </section>

      {/* Benefits */}
      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.h2}>Warum das funktioniert</h2>
          <p style={styles.sub}>
            Klare Vorteile, die sofort verständlich sind.
          </p>
        </div>

        <div style={styles.grid2}>
          <Benefit title="Emotionaler Wow Moment" text="Aus einem statischen Foto wird etwas Lebendiges – perfekt als Überraschung." />
          <Benefit title="Schnell & unkompliziert" text="Kein Editing. Kein Tool Lernen. Ergebnis als MP4." />
          <Benefit title="Teilen leicht gemacht" text="MP4 funktioniert überall: WhatsApp, Instagram, Mail, Cloud." />
          <Benefit title="Ideal für Anlässe" text="Geburtstag, Hochzeit, Familie, Haustiere oder Erinnerungen." />
        </div>

        <div style={styles.inlineCtaWrap}>
          <Link href="/create" style={styles.primaryCta}>
            Foto hochladen
            <span style={{ opacity: 0.8, marginLeft: 10 }}>→</span>
          </Link>
          <div style={{ color: "#6B7280", fontSize: 13 }}>
            Ergebnis in wenigen Minuten verfügbar
          </div>
        </div>
      </section>
	  
	  {/* Testimonials / Examples */}
<section style={styles.section}>
  <div style={styles.sectionHead}>
    <h2 style={styles.h2}>Beispiele aus der Beta</h2>
    <p style={styles.sub}>
      Echte Outputs aus dem Tool. Vorher Foto – nachher kurzes Video.
    </p>
  </div>

  <div style={styles.testimonialsGrid}>
  <Testimonial
    beforeSrc="/demos/t1_before.jpg"
    afterVideoSrc="/demos/t1_after.mp4"
    quote="„Ich hab’s meiner Oma geschickt – sie hatte sofort Tränen in den Augen.“"
    meta="Erinnerungsvideo (3 Sek.)"
  />
  <Testimonial
    beforeSrc="/demos/t2_before.jpg"
    afterVideoSrc="/demos/t2_after.mp4"
    quote="„Perfekt als kleines Geschenk – super schnell und schaut hochwertig aus.“"
    meta="Geschenkidee"
  />
  <Testimonial
    beforeSrc="/demos/t3_before.jpg"
    afterVideoSrc="/demos/t3_after.mp4"
    quote="„Für unser Haustierfoto wirkt’s mega – das ‘lebt’ plötzlich.“"
    meta="Haustier"
  />
</div>


  <div style={styles.inlineCtaWrap}>
    <Link href="/create" style={styles.primaryCta}>
      Jetzt dein Foto testen <span style={{ opacity: 0.8, marginLeft: 10 }}>→</span>
    </Link>
    <div style={{ color: "#6B7280", fontSize: 13 }}>
      Upload dauert 10 Sekunden
    </div>
  </div>
</section>


      {/* Pricing */}
      <section id="pricing" style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.h2}>Preis</h2>
          <p style={styles.sub}>
            Transparent, ohne Abo. Du bezahlst pro Ergebnis.
          </p>
        </div>

        <div style={styles.pricingWrap}>
          <div style={styles.pricingCard}>
            <div style={styles.pricingTop}>
              <div style={styles.planBadge}>Starter</div>
              <div style={styles.priceRow}>
                <div style={styles.price}>€ 9,90</div>
                <div style={styles.priceMeta}>pro Video</div>
              </div>
              <div style={styles.priceDesc}>
                1 Foto → 1 MP4 (3–5 Sekunden) mit sanfter Bewegung
              </div>
            </div>

            <ul style={styles.featureList}>
              <li style={styles.featureItem}>✓ MP4 Download</li>
              <li style={styles.featureItem}>✓ Direkt im Browser abspielbar</li>
              <li style={styles.featureItem}>✓ Ideal als Geschenk/Erinnerung</li>
              <li style={styles.featureItem}>✓ Kein Abo</li>
            </ul>

            <Link href="/create" style={styles.primaryCtaFull}>
              Video erstellen
              <span style={{ opacity: 0.8, marginLeft: 10 }}>→</span>
            </Link>

            <div style={styles.microNote}>
              MVP Phase: Checkout/Payment folgt als nächster Schritt.
            </div>
          </div>

          <div style={styles.guaranteeCard}>
            <div style={styles.guaranteeTitle}>Tipps für bestes Ergebnis</div>
            <div style={styles.guaranteeText}>
              • Gesicht gut sichtbar <br />
              • Gute Beleuchtung <br />
              • Nicht zu stark verwackelt <br />
              • Idealerweise 1 Person oder zentriert
            </div>
            <div style={styles.guaranteeHint}>
              Wenn du willst, bauen wir als nächstes Presets (z.B. “Vintage”, “Cinematic”, “Gentle Zoom”).
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.h2}>FAQ</h2>
         <p style={styles.sub}>
  Kurz beantwortet, damit niemand hängen bleibt.
</p>

        </div>

        <div style={styles.faqGrid}>
          <Faq q="Wie lange dauert es?" a="In der Regel nur wenige Minuten – abhängig von Bildgröße und Systemlast." />
          <Faq q="Was bekomme ich am Ende?" a="Ein MP4 Video, das du im Browser abspielen und herunterladen kannst." />
          <Faq q="Welche Fotos funktionieren am besten?" a="Klare Gesichter, gute Beleuchtung, wenig Bewegungsunschärfe." />
          <Faq q="Brauche ich eine App oder ein Abo?" a="Nein. Du nutzt es direkt im Browser – ohne Abo." />
        </div>

        <div style={styles.finalCta}>
          <div style={styles.finalCtaInner}>
            <div>
              <div style={styles.finalTitle}>Bereit für dein erstes Video?</div>
              <div style={styles.finalText}>Upload dauert 10 Sekunden. Ergebnis kommt direkt danach.</div>
            </div>
            <Link href="/create" style={styles.primaryCta}>
              Jetzt starten <span style={{ opacity: 0.8, marginLeft: 10 }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={{ opacity: 0.8 }}>© {new Date().getFullYear()} Photo Reel</div>
        <div style={styles.footerLinks}>
          <Link href="/create" style={styles.footerLink}>Create</Link>
          <a href="#pricing" style={styles.footerLink}>Preis</a>
          <a href="#faq" style={styles.footerLink}>FAQ</a>
        </div>
      </footer>

      {/* simple responsive tweaks */}
      <style>{`
        @media (max-width: 980px) {
          .heroGrid { grid-template-columns: 1fr !important; }
          .navHide { display: none !important; }
          .grid3 { grid-template-columns: 1fr !important; }
          .grid2 { grid-template-columns: 1fr !important; }
          .pricingWrap { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="stepCard" style={styles.card}>
      <div style={styles.stepTop}>
        <div style={styles.stepNum}>{n}</div>
        <div style={{ fontWeight: 900 }}>{title}</div>
      </div>
      <div style={styles.cardText}>{text}</div>
    </div>
  );
}

function Benefit({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.card}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
      <div style={styles.cardText}>{text}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details style={styles.faqItem}>
      <summary style={styles.faqQ}>{q}</summary>
      <div style={styles.faqA}>{a}</div>
    </details>
  );
}

const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 20% 0%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(16,185,129,0.14), transparent 55%), #0B0F1A",
    color: "#E5E7EB",
    padding: "28px 16px 54px",
  },
  bgGlow: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(800px 400px at 50% 110%, rgba(236,72,153,0.14), transparent 60%)",
    filter: "blur(0px)",
    zIndex: 0,
  },
  header: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1120,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "10px 0 22px",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6366F1, #22C55E)",
    boxShadow: "0 12px 30px rgba(99,102,241,0.22)",
  },
  brandName: { fontWeight: 900, letterSpacing: -0.4 },
  brandTag: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  nav: { display: "flex", alignItems: "center", gap: 14 },
  navLink: { color: "#C7D2FE", textDecoration: "none", fontSize: 13, opacity: 0.9 },
  navCta: {
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(34,197,94,1))",
    color: "#0B0F1A",
    fontWeight: 900,
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "0 14px 34px rgba(34,197,94,0.18)",
  },

  hero: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1120,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 18,
    alignItems: "stretch",
  },
  heroLeft: { padding: "8px 0" },
  heroRight: { display: "flex", justifyContent: "flex-end" },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#D1D5DB",
    fontSize: 13,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#22C55E",
    boxShadow: "0 0 0 6px rgba(34,197,94,0.12)",
  },

  h1: { margin: "14px 0 0", fontSize: 52, lineHeight: 1.02, letterSpacing: -1.4 },
  h1Accent: {
    background: "linear-gradient(90deg, #A5B4FC, #34D399)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  lead: { marginTop: 14, fontSize: 18, color: "#A7B0C0", lineHeight: 1.6, maxWidth: 640 },

  heroCtas: { display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" },
  primaryCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "linear-gradient(135deg, #6366F1, #22C55E)",
    color: "#07111E",
    fontWeight: 900,
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: 14,
    boxShadow: "0 18px 48px rgba(99,102,241,0.20)",
  },
  secondaryCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    color: "#E5E7EB",
    fontWeight: 800,
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
  },

  trustRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 },
  trustItem: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  trustIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.16)",
    border: "1px solid rgba(99,102,241,0.22)",
  },
  trustTitle: { fontWeight: 900, fontSize: 13 },
  trustText: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },

  socialProof: { marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" },
  socialTitle: { fontSize: 12, color: "#9CA3AF", fontWeight: 700 },
  socialPills: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  pill: {
    fontSize: 12,
    color: "#D1D5DB",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: "6px 10px",
    borderRadius: 999,
  },

  previewCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  previewHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" },
  previewDots: { display: "flex", gap: 7 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  previewTitle: { fontSize: 12, color: "#B6C0D1", fontWeight: 800 },
  previewBody: { padding: 14 },
  previewMock: {
    height: 220,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "radial-gradient(500px 220px at 20% 0%, rgba(99,102,241,0.22), transparent 60%), rgba(255,255,255,0.03)",
    display: "grid",
    placeItems: "center",
  },
  previewMockInner: { width: "78%", display: "grid", gap: 10 },
  mockCircle: { width: 54, height: 54, borderRadius: 18, background: "rgba(34,197,94,0.22)", border: "1px solid rgba(34,197,94,0.25)" },
  mockLineWide: { height: 12, borderRadius: 999, background: "rgba(255,255,255,0.10)" },
  mockLine: { height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)" },
  previewCaption: { marginTop: 12, fontSize: 13 },
  previewCta: {
    display: "block",
    marginTop: 12,
    textAlign: "center",
    textDecoration: "none",
    fontWeight: 900,
    color: "#07111E",
    background: "linear-gradient(135deg, #A5B4FC, #34D399)",
    padding: "10px 12px",
    borderRadius: 14,
  },

  section: { position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto", padding: "54px 0 0" },
  sectionHead: { maxWidth: 780 },
  h2: { margin: 0, fontSize: 28, letterSpacing: -0.6 },
  sub: { marginTop: 10, color: "#A7B0C0", lineHeight: 1.6 },

  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 16 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginTop: 16 },

  card: {
    borderRadius: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: 16,
  },
  stepTop: { display: "flex", alignItems: "center", gap: 10 },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.28)",
  },
  cardText: { marginTop: 10, color: "#A7B0C0", lineHeight: 1.6 },

  inlineCtaWrap: { display: "flex", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" },

  pricingWrap: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14, marginTop: 18 },
  pricingCard: {
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(99,102,241,0.16), rgba(255,255,255,0.04))",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: 18,
  },
  pricingTop: { paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.10)" },
  planBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: "rgba(34,197,94,0.18)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#CFFAE2",
  },
  priceRow: { display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 },
  price: { fontSize: 44, fontWeight: 950, letterSpacing: -1.2 },
  priceMeta: { color: "#A7B0C0", fontWeight: 800 },
  priceDesc: { color: "#A7B0C0", marginTop: 8, lineHeight: 1.6 },

  featureList: { margin: "14px 0 0", paddingLeft: 18, color: "#E5E7EB", lineHeight: 1.9 },
  featureItem: { marginBottom: 4 },

  primaryCtaFull: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    background: "linear-gradient(135deg, #6366F1, #22C55E)",
    color: "#07111E",
    fontWeight: 950,
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: 14,
  },
  microNote: { marginTop: 10, fontSize: 12, color: "#A7B0C0" },

  guaranteeCard: {
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: 18,
  },
  guaranteeTitle: { fontWeight: 950, fontSize: 16 },
  guaranteeText: { marginTop: 10, color: "#A7B0C0", lineHeight: 1.7 },
  guaranteeHint: { marginTop: 12, fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 },

  faqGrid: { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 16 },
  faqItem: {
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: 14,
  },
  faqQ: { cursor: "pointer", fontWeight: 900, color: "#E5E7EB" },
  faqA: { marginTop: 10, color: "#A7B0C0", lineHeight: 1.65 },
testimonialsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 14,
  marginTop: 16,
},

tTile: {
  borderRadius: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  padding: 12,
  overflow: "hidden",
},

tVideoWrap: {
  position: "relative",
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.35)",
},

tVideoLarge: {
  width: "100%",
  height: 240,
  objectFit: "cover",
  display: "block",
  background: "#000",
},

tPip: {
  position: "absolute",
  top: 10,
  right: 10,
  width: 70,
  height: 70,
  borderRadius: 999,
  overflow: "hidden",
  border: "2px solid rgba(255,255,255,0.85)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  background: "rgba(0,0,0,0.15)",
},

tPipImg: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

tPipLabel: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "4px 6px",
  fontSize: 10,
  fontWeight: 900,
  textAlign: "center",
  color: "#fff",
  background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.65))",
},

tQuoteNew: {
  marginTop: 10,
  fontWeight: 900,
  lineHeight: 1.35,
  fontSize: 14,
},

tMetaNew: {
  marginTop: 6,
  fontSize: 12,
  color: "#A7B0C0",
},

  finalCta: {
    marginTop: 18,
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(99,102,241,0.16))",
    padding: 16,
  },
  finalCtaInner: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  finalTitle: { fontWeight: 950, fontSize: 18 },
  finalText: { marginTop: 6, color: "#A7B0C0" },

  footer: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1120,
    margin: "0 auto",
    paddingTop: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    color: "#9CA3AF",
    fontSize: 12,
  },
  footerLinks: { display: "flex", gap: 12 },
  footerLink: { color: "#9CA3AF", textDecoration: "none" },
};
function Testimonial({
  beforeSrc,
  afterVideoSrc,
  quote,
  meta,
}: {
  beforeSrc: string;
  afterVideoSrc: string;
  quote: string;
  meta: string;
}) {
  return (
    <div style={styles.tTile}>
      <div style={styles.tVideoWrap}>
        <video
  src={afterVideoSrc}
  style={styles.tVideoLarge}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
/>


        <div style={styles.tPip}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeSrc} alt="Originalfoto" style={styles.tPipImg} />
          <div style={styles.tPipLabel}>Original</div>
        </div>
      </div>

      <div style={styles.tQuoteNew}>{quote}</div>
      <div style={styles.tMetaNew}>{meta}</div>
    </div>
  );
}
