"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Stage = "idle" | "loading" | "result";

const LOADING_STEPS = [
  "Summoning the royal portrait artist...",
  "Grinding the finest lapis lazuli pigments...",
  "Painting the royal velvet collar...",
  "Consulting the Court of Aesthetics...",
  "Applying the first coat of walnut oils...",
  "Gilding the ornate baroque frame...",
  "Conferring with the Duke's art advisor...",
  "Adding the master's final flourishes...",
  "Applying the craquelure varnish...",
  "Awaiting approval from the Grand Master...",
];

// ── Shared ornamental divider ─────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-px w-16 bg-linear-to-r from-transparent to-[#d4af37]" />
      <svg className="w-3 h-3 text-[#d4af37]" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0l1.5 6.5L16 8l-6.5 1.5L8 16l-1.5-6.5L0 8l6.5-1.5z" />
      </svg>
      <div className="h-px w-16 bg-linear-to-l from-transparent to-[#d4af37]" />
    </div>
  );
}

// ── Frame corner ornament (L-bracket + jewel) ─────────────────────────────────
function CornerOrnament({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const transforms: Record<typeof position, string> = {
    tl: "none",
    tr: "scaleX(-1)",
    bl: "scaleY(-1)",
    br: "scale(-1)",
  };
  const positions: Record<typeof position, string> = {
    tl: "-top-[3px] -left-[3px]",
    tr: "-top-[3px] -right-[3px]",
    bl: "-bottom-[3px] -left-[3px]",
    br: "-bottom-[3px] -right-[3px]",
  };
  return (
    <svg
      viewBox="0 0 40 40"
      fill="#d4af37"
      className={`absolute w-10 h-10 ${positions[position]}`}
      style={{ transform: transforms[position] }}
    >
      {/* L-bracket */}
      <path d="M0 0h40v5H5v35H0z" />
      {/* Jewel */}
      <circle cx="10" cy="10" r="4" />
      <circle cx="10" cy="10" r="2" fill="#0a0a0a" opacity="0.7" />
    </svg>
  );
}

// ── Centre medallion (star) ───────────────────────────────────────────────────
function CentreMedallion({ side }: { side: "top" | "bottom" }) {
  return (
    <div
      className={`absolute ${side === "top" ? "-top-4" : "-bottom-4"} left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0a0a0a] flex items-center justify-center`}
    >
      <svg viewBox="0 0 24 24" fill="#d4af37" className="w-5 h-5">
        <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TransformFlow() {
  const [stage, setStage] = useState<Stage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when overlay is active
  useEffect(() => {
    document.body.style.overflow = stage !== "idle" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  // ── File handling ───────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const startTransformation = async () => {
    if (!uploadedFile) return;
    setStage("loading");
    setProgress(0);
    setMsgIndex(0);
    setMsgVisible(true);
    setApiError(null);
    setGeneratedUrl(null);

    try {
      const form = new FormData();
      form.append("image", uploadedFile);

      const res = await fetch("/api/transform", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to start transformation.");
      }

      const { predictionId: id } = await res.json();
      setPredictionId(id);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStage("idle");
    }
  };

  const reset = () => {
    setStage("idle");
    setPreview(null);
    setUploadedFile(null);
    setProgress(0);
    setPredictionId(null);
    setGeneratedUrl(null);
    setApiError(null);
    setCheckoutLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCheckout = async () => {
    if (!generatedUrl) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: generatedUrl }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to create checkout session.");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
      setCheckoutLoading(false);
    }
  };

  // ── Message rotation (runs whenever loading screen is visible) ──────────────
  useEffect(() => {
    if (stage !== "loading") return;
    const msgId = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % LOADING_STEPS.length);
        setMsgVisible(true);
      }, 300);
    }, 900);
    return () => clearInterval(msgId);
  }, [stage]);

  // ── Fake progress: eases toward 95%, snaps to 100% when polling succeeds ───
  useEffect(() => {
    if (stage !== "loading") return;
    const progressId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        // Asymptotic ease — feels natural without knowing real duration
        return prev + (95 - prev) * 0.012;
      });
    }, 100);
    return () => clearInterval(progressId);
  }, [stage]);

  // ── Poll Replicate for prediction status ─────────────────────────────────────
  useEffect(() => {
    if (!predictionId) return;

    const pollId = setInterval(async () => {
      try {
        const res = await fetch(`/api/transform/${predictionId}`);
        const data = await res.json();

        if (data.status === "succeeded") {
          clearInterval(pollId);
          setPredictionId(null);
          setGeneratedUrl(data.imageUrl);
          setProgress(100);
          setTimeout(() => setStage("result"), 350);
        } else if (data.status === "failed" || data.status === "canceled") {
          clearInterval(pollId);
          setPredictionId(null);
          setApiError(data.error ?? "Transformation failed. Please try again.");
          setStage("idle");
        }
        // "starting" | "processing" → keep polling
      } catch {
        // Transient network error — try again next tick
      }
    }, 2000);

    return () => clearInterval(pollId);
  }, [predictionId]);

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Idle: inline upload dropzone ─────────────────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="w-full max-w-lg mx-auto"
      >
        {!uploadedFile ? (
          /* Empty drop zone */
          <div
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload pet photo"
            className={`relative border-2 border-dashed p-16 text-center cursor-pointer select-none transition-all duration-300 ${
              isDragging
                ? "border-[#d4af37] bg-[#d4af37]/10 scale-[1.01]"
                : "border-[#d4af37]/35 hover:border-[#d4af37]/65 hover:bg-[#d4af37]/5"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="sr-only"
            />
            {/* Corner brackets */}
            <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]" />
            <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]" />
            <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]" />
            <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]" />
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                  isDragging
                    ? "border-[#d4af37] bg-[#d4af37]/20"
                    : "border-[#d4af37]/40"
                }`}
              >
                <svg
                  className="w-7 h-7 text-[#d4af37]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
            </div>
            <p className="font-playfair text-xl text-[#f5f5f0] mb-2">
              {isDragging ? "Release to Upload" : "Drop Your Portrait Here"}
            </p>
            <p className="text-[#888] text-sm mb-5">
              or click to browse your gallery
            </p>
            <p className="text-[#d4af37]/50 text-xs tracking-[0.2em] uppercase">
              JPG · PNG · WEBP · Max 3 MB
            </p>
          </div>
        ) : (
          /* Preview card */
          <div className="relative border border-[#d4af37]/40 bg-[#111]">
            <span className="absolute top-2 left-2 w-5 h-5 border-t border-l border-[#d4af37]" />
            <span className="absolute top-2 right-2 w-5 h-5 border-t border-r border-[#d4af37]" />
            <span className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-[#d4af37]" />
            <span className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#d4af37]" />
            <div className="p-6">
              {/* Image preview */}
              <div className="relative overflow-hidden mb-4 bg-[#0a0a0a] ring-1 ring-[#d4af37]/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview!}
                  alt="Your pet"
                  className="w-full max-h-64 object-contain"
                />
              </div>
              {/* File info row */}
              <div className="flex items-center gap-3 mb-5 px-1">
                <svg
                  className="w-4 h-4 text-[#d4af37] shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f5f5f0] text-sm truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-[#888] text-xs">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={reset}
                  aria-label="Remove image"
                  className="text-[#888] hover:text-[#d4af37] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {apiError && (
                <div className="mb-4 border border-red-900/50 bg-red-950/20 px-4 py-3">
                  <p className="text-red-400 text-sm">{apiError}</p>
                </div>
              )}
              <button
                onClick={startTransformation}
                className="w-full bg-[#d4af37] text-black py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-[#f0d060] transition-colors duration-300"
              >
                Begin the Transformation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Loading overlay ───────────────────────────────────────────────── */}
      {stage === "loading" && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
          {/* Radial ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-md text-center">
            {/* Pulsing palette icon */}
            <div className="flex justify-center mb-10">
              <div className="relative w-24 h-24">
                <div
                  className="absolute inset-0 rounded-full border border-[#d4af37]/15 animate-ping"
                  style={{ animationDuration: "2.8s" }}
                />
                <div
                  className="absolute inset-3 rounded-full border border-[#d4af37]/25 animate-ping"
                  style={{ animationDuration: "2s", animationDelay: "0.4s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-[#d4af37]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-4">
              The Atelier is at Work
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl text-[#f5f5f0] mb-10">
              Creating Your Masterpiece
            </h2>

            {/* Rotating message — fixed height prevents layout shift */}
            <div className="h-7 mb-10 flex items-center justify-center">
              <p
                className="text-[#888] text-base italic transition-opacity duration-300"
                style={{ opacity: msgVisible ? 1 : 0 }}
              >
                {LOADING_STEPS[msgIndex]}
              </p>
            </div>

            {/* Progress track */}
            <div className="relative w-full h-px bg-[#1c1c1c] mb-3">
              <div
                className="absolute left-0 top-0 h-full bg-[#d4af37] transition-all"
                style={{ width: `${progress}%`, transitionDuration: "40ms" }}
              />
              {/* Glowing leading dot */}
              {progress > 0 && progress < 100 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f0d060] transition-all"
                  style={{
                    left: `calc(${progress}% - 4px)`,
                    transitionDuration: "40ms",
                    boxShadow: "0 0 8px #d4af37, 0 0 16px rgba(212,175,55,0.5)",
                  }}
                />
              )}
            </div>
            <p className="text-[#d4af37]/40 text-xs tracking-[0.3em]">
              {Math.round(progress)}%
            </p>

            {/* Animated dots */}
            <div className="mt-14 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-[#d4af37]/30 animate-pulse"
                  style={{ animationDelay: `${i * 240}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Result overlay ────────────────────────────────────────────────── */}
      {stage === "result" && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto">
          <div className="min-h-full flex flex-col items-center justify-center px-6 py-24">
            <div className="w-full max-w-sm text-center">
              <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-4">
                Your Commission is Complete
              </p>
              <h2 className="font-playfair text-4xl md:text-5xl text-[#f5f5f0] mb-12">
                Behold the{" "}
                <span className="italic text-[#d4af37]">Masterpiece</span>
              </h2>

              {/* ── Ornate portrait frame ── */}
              <div className="relative mx-auto">
                {/* Soft gold ambient glow behind frame */}
                <div
                  className="absolute -inset-8 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,175,55,0.08), transparent 70%)",
                  }}
                />

                {/* Outer gradient gold frame */}
                <div
                  className="relative p-[7px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #c9a227 0%, #f0d060 30%, #a07818 55%, #d4af37 80%, #f0d060 100%)",
                  }}
                >
                  {/* Dark recess */}
                  <div className="bg-[#0a0a0a] p-[5px]">
                    {/* Inner thin gold border */}
                    <div
                      className="p-[2px]"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(212,175,55,0.7), rgba(212,175,55,0.25), rgba(212,175,55,0.7))",
                      }}
                    >
                      {/* Dark mat */}
                      <div className="bg-[#0f0f0f] p-5">
                        {/* Delicate inner liner */}
                        <div className="border border-[#d4af37]/20 p-0.5">
                          {/* The portrait — real Replicate output when available,
                              otherwise the original photo with painterly CSS filters */}
                          <div className="relative overflow-hidden aspect-[3/4] bg-[#0d0d0d]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={generatedUrl ?? preview!}
                              alt="Your Renaissance portrait"
                              className="w-full h-full object-cover"
                              style={
                                generatedUrl
                                  ? undefined
                                  : { filter: "sepia(0.72) contrast(1.14) saturate(0.65) brightness(0.84)" }
                              }
                            />
                            {/* CSS texture overlay — only applied to the CSS-filtered fallback */}
                            {!generatedUrl && (
                              <svg
                                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.055] mix-blend-overlay"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <filter id="oil">
                                  <feTurbulence
                                    type="fractalNoise"
                                    baseFrequency="0.72"
                                    numOctaves="4"
                                    stitchTiles="stitch"
                                  />
                                  <feColorMatrix type="saturate" values="0" />
                                </filter>
                                <rect width="100%" height="100%" filter="url(#oil)" />
                              </svg>
                            )}
                            {/* Vignette */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  "radial-gradient(ellipse 75% 80% at 50% 45%, transparent 40%, rgba(0,0,0,0.6) 100%)",
                              }}
                            />
                            {/* Era badge */}
                            <div className="absolute bottom-3 right-3 border border-[#d4af37]/50 bg-black/55 backdrop-blur-sm px-2 py-1">
                              <span className="text-[#d4af37] text-[9px] tracking-[0.2em] uppercase">
                                Italian Renaissance
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corner ornaments */}
                  <CornerOrnament position="tl" />
                  <CornerOrnament position="tr" />
                  <CornerOrnament position="bl" />
                  <CornerOrnament position="br" />
                </div>

                {/* Top & bottom medallions */}
                <CentreMedallion side="top" />
                <CentreMedallion side="bottom" />
              </div>

              {/* Caption */}
              <div className="mt-10">
                <p className="font-playfair text-[#f5f5f0] text-xl italic">
                  Portrait of the Noble Companion
                </p>
                <p className="text-[#888] text-xs tracking-widest mt-1 uppercase">
                  Italian Renaissance · Oil on Canvas · c. MMXXVI
                </p>
              </div>

              <GoldDivider />

              {/* CTAs */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-[#d4af37] text-black py-4 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#f0d060] transition-colors duration-300 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? "Preparing Checkout…" : "Proceed to Checkout"}
              </button>
              <button
                onClick={reset}
                className="w-full border border-[#d4af37]/25 text-[#888] py-3.5 text-sm tracking-wide hover:border-[#d4af37]/55 hover:text-[#d4af37] transition-all duration-300"
              >
                Commission Another Portrait
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
