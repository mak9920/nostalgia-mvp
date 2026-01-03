"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@supabase/supabase-js";

type UiState = "idle" | "uploading" | "processing" | "done" | "error";

type JobRow = {
  id: string;
  status: "queued" | "processing" | "done" | "failed" | string;
  input_image_key: string | null;
  output_video_key: string | null;
  created_at?: string | null;
  error?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

function sx(...parts: Array<React.CSSProperties | false | null | undefined>) {
  return Object.assign({}, ...parts.filter(Boolean));
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

/**
 * Video URL resolver:
 * - "uploads/..." => "/uploads/..."
 * - "/uploads/..." => bleibt
 * - "http..." => bleibt
 * - sonst fallback: /api/media?path=...
 */
function resolveVideoUrl(outputKey: string) {
  if (!outputKey) return "";
  if (outputKey.startsWith("http")) return outputKey;
  if (outputKey.startsWith("/uploads/")) return outputKey;
  if (outputKey.startsWith("uploads/")) return `/${outputKey}`;
  return `/api/media?path=${encodeURIComponent(outputKey)}`;
}

function StatusPill({ status }: { status: string }) {
  const s = String(status || "").toLowerCase();
  const isDone = s === "done";
  const isRun = s === "processing" || s === "running" || s === "queued";
  const isFail = s === "failed" || s === "error";

  const bg = isDone
    ? "rgba(34,197,94,0.14)"
    : isRun
    ? "rgba(251,191,36,0.14)"
    : isFail
    ? "rgba(239,68,68,0.14)"
    : "rgba(148,163,184,0.14)";

  const bd = isDone
    ? "rgba(34,197,94,0.30)"
    : isRun
    ? "rgba(251,191,36,0.30)"
    : isFail
    ? "rgba(239,68,68,0.30)"
    : "rgba(148,163,184,0.30)";

  const tx = isDone
    ? "rgba(34,197,94,0.95)"
    : isRun
    ? "rgba(251,191,36,0.95)"
    : isFail
    ? "rgba(239,68,68,0.95)"
    : "rgba(226,232,240,0.85)";

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${bd}`,
        background: bg,
        color: tx,
        fontSize: 11.5,
        fontWeight: 900,
      }}
    >
      {status}
    </span>
  );
}

function StepPill({ label, state }: { label: string; state: "idle" | "active" | "done" }) {
  const bg =
    state === "done"
      ? "rgba(34,197,94,0.14)"
      : state === "active"
      ? "rgba(251,191,36,0.14)"
      : "rgba(148,163,184,0.12)";

  const bd =
    state === "done"
      ? "rgba(34,197,94,0.30)"
      : state === "active"
      ? "rgba(251,191,36,0.30)"
      : "rgba(148,163,184,0.22)";

  const tx =
    state === "done"
      ? "rgba(34,197,94,0.95)"
      : state === "active"
      ? "rgba(251,191,36,0.95)"
      : "rgba(226,232,240,0.75)";

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${bd}`,
        background: bg,
        color: tx,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {label}
    </span>
  );
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    marginTop: 12,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(14,165,233,0.85))",
    color: "#0b0d12",
    fontWeight: 900,
    fontSize: 14,
    letterSpacing: 0.2,
    boxShadow: "0 14px 36px rgba(99,102,241,0.28)",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

export default function CreatePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [userEmail, setUserEmail] = useState<string>("");
  const [authReady, setAuthReady] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uiState, setUiState] = useState<UiState>("idle");
  const [statusText, setStatusText] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [activeJob, setActiveJob] = useState<JobRow | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles?.[0];
    if (!f) return;
    setFile(f);
    setUiState("idle");
    setStatusText("");
    setJobError(null);
    setJobId(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
    maxSize: 15 * 1024 * 1024,
  });

  const canSubmit = useMemo(() => {
    return !!file && (uiState === "idle" || uiState === "error");
  }, [file, uiState]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function loadJobs() {
    const { data, error } = await supabase
      .from("media_jobs")
      .select("id,status,input_image_key,output_video_key,created_at,error")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) return;

    const rows = (data || []) as JobRow[];
    setJobs(rows);

    // Active job stabil halten (wenn möglich)
    setActiveJob((prev) => {
      if (prev) {
        const upd = rows.find((r) => r.id === prev.id);
        return upd || prev;
      }
      return rows.find((r) => r.status === "done" && r.output_video_key) || rows[0] || null;
    });
  }

  // Auth init
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        window.location.href = "/login?next=%2Fcreate";
        return;
      }

      setUserEmail(session.user.email || "");
      setAuthReady(true);
      await loadJobs();
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = "/login?next=%2Fcreate";
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createOrderAndUpload() {
    if (!canSubmit || !file) return;

    setUiState("uploading");
    setStatusText("Upload läuft …");
    setJobError(null);

    // 1) Order erstellen
    const orderRes = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail || null, locale: "de" }),
    });

    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      setUiState("error");
      setStatusText(orderJson?.error || "Order Fehler");
      return;
    }

    const orderId = orderJson.order.id as string;

    // 2) Upload Image
    const fd = new FormData();
    fd.append("orderId", orderId);
    fd.append("file", file);

    const upRes = await fetch("/api/upload-image", { method: "POST", body: fd });
    const upJson = await upRes.json();

    if (!upRes.ok) {
      setUiState("error");
      setStatusText(upJson?.error || "Upload Fehler");
      return;
    }

    const newJobId = upJson.job.id as string;
    setJobId(newJobId);

    setUiState("processing");
    setStatusText("Video wird erstellt …");

    // 3) Job run
    const runRes = await fetch("/api/jobs/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: newJobId }),
    });

    const runJson = await runRes.json();
    if (!runRes.ok) {
      setUiState("error");
      setStatusText(runJson?.error || "Job Fehler");
      setJobError(runJson?.details || null);
      return;
    }

    // falls direkt done zurückkommt
    if (runJson?.job?.output_video_key) {
      setActiveJob({
        id: runJson.job.id,
        status: runJson.job.status,
        input_image_key: runJson.job.input_image_key ?? null,
        output_video_key: runJson.job.output_video_key ?? null,
        created_at: runJson.job.created_at ?? null,
        error: runJson.job.error ?? null,
      });
      setUiState("done");
      setStatusText("Fertig.");
      await loadJobs();
    }
  }

  // Polling wenn processing
  useEffect(() => {
    if (!jobId) return;
    if (uiState !== "processing") return;

    const t = setInterval(async () => {
      const res = await fetch(`/api/jobs/status?jobId=${encodeURIComponent(jobId)}`);
      const json = await res.json();
      if (!res.ok) return;

      const st = String(json?.job?.status || "").toLowerCase();

      if (st === "done") {
        setActiveJob({
          id: json.job.id,
          status: json.job.status,
          input_image_key: json.job.input_image_key ?? null,
          output_video_key: json.job.output_video_key ?? null,
          created_at: json.job.created_at ?? null,
          error: json.job.error ?? null,
        });
        setUiState("done");
        setStatusText("Fertig.");
        await loadJobs();
        clearInterval(t);
      } else if (st === "failed") {
        setUiState("error");
        setStatusText("Job fehlgeschlagen.");
        setJobError(json?.job?.error || null);
        await loadJobs();
        clearInterval(t);
      }
    }, 1500);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, uiState]);

  const activeVideoUrl = useMemo(() => {
    const key = activeJob?.output_video_key;
    if (!key) return null;
    return resolveVideoUrl(key);
  }, [activeJob]);

  if (!authReady) {
    return (
      <main style={styles.page}>
        <div style={styles.bg} />
        <div style={styles.centerLoading}>
          <div style={styles.loadingCard}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Lade …</div>
            <div style={{ marginTop: 6, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              Session wird geprüft.
            </div>
          </div>
        </div>
      </main>
    );
  }

  const sidebarStyle = sx(
    styles.sidebar,
    isMobile && styles.sidebarMobile,
    isMobile && menuOpen && styles.sidebarMobileOpen
  );

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden="true" />
      <div style={styles.grid} aria-hidden="true" />

      {/* Mobile overlay */}
      {isMobile && menuOpen ? (
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu overlay"
          style={styles.overlay}
        />
      ) : null}

      {/* Topbar */}
      <header style={styles.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={styles.iconButton}
            aria-label="Menü öffnen"
            title="Menü"
          >
            ☰
          </button>

          <div style={styles.brand}>
            <div style={styles.logoMark}>N</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <div style={styles.brandName}>Photo Reel Maker</div>
              <div style={styles.brandSub}>Create</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={styles.userChip} title={userEmail}>
            {userEmail || "User"}
          </div>
          <button onClick={logout} style={styles.ghostButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.shell}>
        {/* Sidebar */}
        <aside style={sidebarStyle}>
          <div style={styles.sidebarHeader}>
            <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>My Projects</div>
            {isMobile ? (
              <button onClick={() => setMenuOpen(false)} style={styles.iconButtonSm} aria-label="Close">
                ✕
              </button>
            ) : null}
          </div>

          <div style={styles.sidebarList}>
            {jobs.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, padding: 10 }}>
                Noch keine Projekte. Erstelle dein erstes Video.
              </div>
            ) : (
              jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    setActiveJob(j);
                    setMenuOpen(false);

                    // Polling nur, wenn Job wirklich läuft
                    const st = String(j.status || "").toLowerCase();
                    if (st === "processing" || st === "running" || st === "queued") {
                      setJobId(j.id);
                      setUiState("processing");
                      setStatusText("Video wird erstellt …");
                    } else if (st === "done") {
                      setJobId(null);
                      setUiState("done");
                      setStatusText("Fertig.");
                    } else if (st === "failed") {
                      setJobId(null);
                      setUiState("error");
                      setStatusText("Job fehlgeschlagen.");
                      setJobError(j.error || null);
                    } else {
                      setJobId(null);
                      setUiState("idle");
                      setStatusText("");
                    }
                  }}
                  style={sx(styles.jobRow, activeJob?.id === j.id && styles.jobRowActive)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: 13 }}>#{j.id.slice(0, 8)}</div>
                    <StatusPill status={j.status} />
                  </div>
                  <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                    {fmtDate(j.created_at)}
                  </div>
                  {String(j.status || "").toLowerCase() === "failed" && j.error ? (
                    <div style={{ marginTop: 6, color: "rgba(255,120,120,0.95)", fontSize: 12, lineHeight: 1.35 }}>
                      {String(j.error).slice(0, 120)}
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>

          <div style={styles.sidebarFooter}>
            <button onClick={() => (window.location.href = "/")} style={styles.ghostButtonFull} title="Zur Landingpage">
              ← Zur Landingpage
            </button>
          </div>
        </aside>

        {/* Main */}
        <section style={styles.main}>
          <div style={styles.hero}>
            <div style={styles.heroTitle}>
              Create a living moment<span style={{ color: "rgba(255,255,255,0.85)" }}>.</span>
            </div>
            <div style={styles.heroSub}>
              Lade ein Foto hoch und erhalte ein kurzes Video. Deine bisherigen Projekte findest du links im Menü.
            </div>
          </div>

          <div style={styles.contentGrid}>
            {/* Upload card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Upload</div>
                <div style={styles.cardSub}>JPG/PNG, max. 15 MB</div>
              </div>

              <div
                {...getRootProps()}
                style={sx(styles.dropzone, {
                  background: isDragActive ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                })}
              >
                <input {...getInputProps()} />
                {!file ? (
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14 }}>
                      {isDragActive ? "Loslassen zum Hochladen" : "Foto hierher ziehen oder klicken"}
                    </div>
                    <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
                      Wir erzeugen daraus ein Video und du kannst es danach downloaden.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14 }}>{file.name}</div>
                    <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
                      Klicke hier, um ein anderes Bild zu wählen.
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={createOrderAndUpload}
                disabled={!canSubmit || uiState === "uploading" || uiState === "processing"}
                style={primaryButtonStyle(!canSubmit || uiState === "uploading" || uiState === "processing")}
              >
                {uiState === "uploading"
                  ? "Upload läuft …"
                  : uiState === "processing"
                  ? "Erstelle Video …"
                  : "Video erstellen"}
              </button>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color:
                    uiState === "error"
                      ? "rgba(255,120,120,0.95)"
                      : "rgba(255,255,255,0.78)",
                }}
              >
                {statusText}
                {jobError ? <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{jobError}</div> : null}
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StepPill
                  label="Upload"
                  state={uiState === "uploading" ? "active" : uiState !== "idle" ? "done" : "idle"}
                />
                <StepPill
                  label="Processing"
                  state={uiState === "processing" ? "active" : uiState === "done" ? "done" : "idle"}
                />
                <StepPill label="Ready" state={uiState === "done" ? "done" : "idle"} />
              </div>
            </div>

            {/* Preview card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Preview</div>
                <div style={styles.cardSub}>
                  {activeJob ? (
                    <>
                      Projekt <span style={{ fontFamily: MONO }}>{activeJob.id.slice(0, 8)}</span>
                    </>
                  ) : (
                    "Noch kein Projekt gewählt"
                  )}
                </div>
              </div>

              <div style={styles.preview}>
                {activeVideoUrl ? (
                  <video controls src={activeVideoUrl} style={{ width: "100%", height: "100%", display: "block" }} />
                ) : (
                  <div style={{ padding: 16, color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
                    Sobald ein Video fertig ist, erscheint es hier. Wähle links ein Projekt oder erstelle ein neues.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {activeVideoUrl ? (
                  <a href={activeVideoUrl} download style={styles.secondaryButton}>
                    Download MP4
                  </a>
                ) : (
                  <span style={sx(styles.secondaryButton, { opacity: 0.55, cursor: "not-allowed" })}>Download MP4</span>
                )}

                <button onClick={loadJobs} style={styles.ghostButtonFull}>
                  Projekte aktualisieren
                </button>
              </div>

              {activeJob?.status === "failed" && activeJob.error ? (
                <div style={{ marginTop: 12, color: "rgba(255,120,120,0.95)", fontSize: 13 }}>
                  Fehler: {activeJob.error}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "#05060a",
    color: "#fff",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  },
  bg: {
    position: "absolute",
    inset: -200,
    background:
      "radial-gradient(900px 500px at 20% 15%, rgba(99,102,241,0.30), transparent 60%), radial-gradient(900px 500px at 80% 70%, rgba(14,165,233,0.22), transparent 60%), radial-gradient(800px 450px at 70% 20%, rgba(236,72,153,0.14), transparent 60%)",
    filter: "blur(10px)",
    opacity: 0.95,
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.9), transparent 70%)",
    opacity: 0.2,
    pointerEvents: "none",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    zIndex: 20,
  },

  topbar: {
    position: "relative",
    zIndex: 30,
    maxWidth: 1180,
    margin: "0 auto",
    padding: "18px 18px 10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  shell: {
    position: "relative",
    zIndex: 25,
    maxWidth: 1180,
    margin: "0 auto",
    padding: "10px 18px 42px",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
  },

  sidebar: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,12,18,0.52)",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
    height: "fit-content",
    maxHeight: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
  },

  sidebarMobile: {
    position: "fixed",
    top: 86,
    left: 16,
    right: 16,
    maxHeight: "calc(100vh - 110px)",
    zIndex: 30,
    transform: "translateY(-8px)",
    opacity: 0,
    pointerEvents: "none",
    transition: "opacity 160ms ease, transform 160ms ease",
  },

  sidebarMobileOpen: {
    transform: "translateY(0px)",
    opacity: 1,
    pointerEvents: "auto",
  },

  sidebarHeader: {
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  sidebarList: {
    padding: 10,
    overflowY: "auto",
  },
  sidebarFooter: {
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.10)",
  },

  jobRow: {
    width: "100%",
    textAlign: "left",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    cursor: "pointer",
    marginBottom: 10,
  },
  jobRowActive: {
    border: "1px solid rgba(99,102,241,0.40)",
    background: "rgba(99,102,241,0.12)",
  },

  main: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,12,18,0.45)",
    backdropFilter: "blur(12px)",
    padding: 16,
  },

  hero: {
    padding: "10px 10px 4px",
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: -0.6,
    lineHeight: 1.08,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.70)",
    maxWidth: 720,
  },

  contentGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 950,
    letterSpacing: 0.2,
  },
  cardSub: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.65)",
  },

  dropzone: {
    marginTop: 12,
    border: "1.5px dashed rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 16,
    cursor: "pointer",
  },

  preview: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(0,0,0,0.35)",
    minHeight: 320,
    border: "1px solid rgba(255,255,255,0.10)",
  },

  secondaryButton: {
    flex: 1,
    textAlign: "center",
    display: "inline-block",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
  },

  ghostButton: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 900,
    cursor: "pointer",
  },
  ghostButtonFull: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 900,
    cursor: "pointer",
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },
  iconButtonSm: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 900,
    letterSpacing: 0.5,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.92)",
  },
  brandSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },

  userChip: {
    maxWidth: 260,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 800,
    fontSize: 13,
  },

  centerLoading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 420,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 22px 70px rgba(0,0,0,0.45)",
  },
};
