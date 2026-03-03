import TransformFlow from "@/components/TransformFlow";

const galleryItems = [
  {
    id: 1,
    name: "Sir Reginald Whiskers",
    species: "Maine Coon",
    style: "Italian Renaissance",
    gradient: "from-[#3b2a1a] via-[#2a1f0f] to-[#1a130a]",
    accentColor: "#c9893a",
    description: "Rendered in the manner of Raphael, c. 1510",
  },
  {
    id: 2,
    name: "Duke Bartholomew",
    species: "Golden Retriever",
    style: "Flemish Baroque",
    gradient: "from-[#1a2535] via-[#111c2a] to-[#0a1118]",
    accentColor: "#7aadcc",
    description: "In the tradition of van Dyck, c. 1635",
  },
  {
    id: 3,
    name: "Countess Esmeralda",
    species: "Persian Cat",
    style: "Dutch Golden Age",
    gradient: "from-[#1f2b1a] via-[#162011] to-[#0e1509]",
    accentColor: "#8db87a",
    description: "After the school of Rembrandt, c. 1665",
  },
];

// Simple SVG pet silhouettes for placeholder cards
function CatSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 220" fill="none" className="w-full h-full opacity-30">
      <ellipse cx="100" cy="160" rx="55" ry="45" fill={color} />
      <circle cx="100" cy="90" r="38" fill={color} />
      <polygon points="70,62 55,25 82,58" fill={color} />
      <polygon points="130,62 145,25 118,58" fill={color} />
      <ellipse cx="88" cy="90" rx="7" ry="9" fill="#0a0a0a" />
      <ellipse cx="112" cy="90" rx="7" ry="9" fill="#0a0a0a" />
      <path d="M95 105 Q100 110 105 105" stroke="#0a0a0a" strokeWidth="2" fill="none" />
    </svg>
  );
}

function DogSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 220" fill="none" className="w-full h-full opacity-30">
      <ellipse cx="100" cy="155" rx="60" ry="45" fill={color} />
      <ellipse cx="100" cy="88" rx="42" ry="36" fill={color} />
      <ellipse cx="65" cy="72" rx="14" ry="22" fill={color} />
      <ellipse cx="135" cy="72" rx="14" ry="22" fill={color} />
      <ellipse cx="88" cy="92" rx="8" ry="9" fill="#0a0a0a" />
      <ellipse cx="112" cy="92" rx="8" ry="9" fill="#0a0a0a" />
      <ellipse cx="100" cy="110" rx="16" ry="10" fill={color} />
      <path d="M90 115 Q100 120 110 115" stroke="#0a0a0a" strokeWidth="2" fill="none" />
    </svg>
  );
}

const silhouettes = [CatSilhouette, DogSilhouette, CatSilhouette];

// Ornamental divider
function GoldDivider() {
  return (
    <div className="flex items-center gap-4 justify-center my-8">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]" />
      <svg className="w-4 h-4 text-[#d4af37]" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
      </svg>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-[#d4af37]/15 bg-[#0a0a0a]/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-playfair text-[#d4af37] text-xl tracking-[0.25em] uppercase">
            PetMasters
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#888] tracking-wide">
            <a href="#gallery" className="hover:text-[#d4af37] transition-colors">Gallery</a>
            <a href="#commission" className="hover:text-[#d4af37] transition-colors">Commission</a>
            <a href="#upload" className="hover:text-[#d4af37] transition-colors">Upload</a>
          </div>
          <a
            href="#upload"
            className="border border-[#d4af37] text-[#d4af37] px-5 py-2 text-xs tracking-[0.2em] uppercase hover:bg-[#d4af37] hover:text-black transition-all duration-300"
          >
            Begin
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] items-center justify-center px-6 py-24 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.08),transparent)]" />

        {/* Decorative geometric shapes */}
        <div className="absolute top-16 left-8 w-40 h-40 border border-[#d4af37]/10 rotate-45 hidden lg:block" />
        <div className="absolute top-24 left-16 w-24 h-24 border border-[#d4af37]/8 rotate-45 hidden lg:block" />
        <div className="absolute bottom-16 right-8 w-40 h-40 border border-[#d4af37]/10 -rotate-12 hidden lg:block" />
        <div className="absolute bottom-28 right-20 w-20 h-20 border border-[#d4af37]/8 -rotate-12 hidden lg:block" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-8">
            Est. MMXXVI &nbsp;·&nbsp; Renaissance Studio &nbsp;·&nbsp; AI-Powered Portraiture
          </p>

          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-[#f5f5f0] leading-[1.1] mb-6">
            Immortalize Your Pet{" "}
            <span className="block mt-2 text-[#d4af37] italic">
              in a Timeless Masterpiece
            </span>
          </h1>

          <GoldDivider />

          <p className="text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Transform your beloved companion into a regal portrait worthy of the
            great masters. Our AI channels five centuries of Renaissance
            tradition to honour your pet for eternity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#upload"
              className="bg-[#d4af37] text-black px-10 py-4 text-sm font-semibold tracking-[0.2em] uppercase hover:bg-[#f0d060] transition-colors duration-300"
            >
              Commission Your Portrait
            </a>
            <a
              href="#gallery"
              className="border border-[#d4af37]/50 text-[#d4af37] px-10 py-4 text-sm font-semibold tracking-[0.2em] uppercase hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-300"
            >
              View Gallery
            </a>
          </div>

          {/* Scroll hint */}
          <div className="mt-20 flex flex-col items-center gap-2 text-[#888]/50">
            <span className="text-xs tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-[#d4af37]/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="py-24 px-6 border-t border-[#d4af37]/15">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-4">
              The Collection
            </p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#f5f5f0] mb-4">
              From Companion to Canvas
            </h2>
            <p className="text-[#888] max-w-xl mx-auto">
              Each portrait is a unique commission — a window into the past, a
              gift for the future.
            </p>
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {galleryItems.map((item, i) => {
              const Silhouette = silhouettes[i];
              return (
                <article
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all duration-500"
                >
                  {/* Painting area */}
                  <div
                    className={`relative bg-gradient-to-b ${item.gradient} aspect-[3/4] overflow-hidden`}
                  >
                    {/* Subtle vignette overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_40%,transparent,rgba(0,0,0,0.6))]" />

                    {/* Silhouette */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <Silhouette color={item.accentColor} />
                    </div>

                    {/* Style badge */}
                    <div className="absolute top-4 left-4 border border-[#d4af37]/40 bg-black/40 backdrop-blur-sm px-3 py-1">
                      <span className="text-[#d4af37] text-xs tracking-[0.2em] uppercase">
                        {item.style}
                      </span>
                    </div>

                    {/* Craquelure / aging texture overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                      }}
                    />

                    {/* Corner frame ornaments */}
                    <span className="absolute top-2 left-2 w-5 h-5 border-t border-l border-[#d4af37]/50" />
                    <span className="absolute top-2 right-2 w-5 h-5 border-t border-r border-[#d4af37]/50" />
                    <span className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-[#d4af37]/50" />
                    <span className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#d4af37]/50" />
                  </div>

                  {/* Caption */}
                  <div className="bg-[#111] p-5 border-t border-[#d4af37]/15">
                    <p className="font-playfair text-[#f5f5f0] text-lg font-semibold mb-0.5">
                      {item.name}
                    </p>
                    <p className="text-[#888] text-xs tracking-wide mb-2">{item.species}</p>
                    <p className="text-[#d4af37]/60 text-xs italic">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Decorative quote */}
          <div className="mt-20 text-center max-w-2xl mx-auto">
            <GoldDivider />
            <blockquote className="font-playfair text-xl md:text-2xl text-[#f5f5f0]/70 italic leading-relaxed">
              "Every animal deserves to be immortalised with the reverence the
              old masters reserved for kings."
            </blockquote>
            <p className="text-[#d4af37] text-xs tracking-[0.3em] uppercase mt-4">
              — The PetMasters Atelier
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="commission"
        className="py-24 px-6 border-t border-[#d4af37]/15 bg-[#0d0d0d]"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-4">
              The Process
            </p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#f5f5f0]">
              Three Steps to Eternity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: "I",
                title: "Upload Your Portrait",
                body: "Provide a clear photo of your pet. Natural lighting and a forward-facing pose yield the finest results.",
              },
              {
                num: "II",
                title: "Choose Your Era",
                body: "Select from Italian Renaissance, Flemish Baroque, Dutch Golden Age, and more distinguished periods.",
              },
              {
                num: "III",
                title: "Receive Your Masterpiece",
                body: "Your portrait is rendered in minutes and delivered as a high-resolution file, ready for print or digital display.",
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 border border-[#d4af37]/40 flex items-center justify-center">
                  <span className="font-playfair text-[#d4af37] text-xl font-bold">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-playfair text-[#f5f5f0] text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-[#888] text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upload Section ── */}
      <section id="upload" className="py-24 px-6 border-t border-[#d4af37]/15">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-4">
              Begin Your Commission
            </p>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#f5f5f0] mb-4">
              Upload Your Pet's Portrait
            </h2>
            <p className="text-[#888] leading-relaxed">
              Drag and drop a photo below, or click to browse. Our atelier will
              transform it into a work worthy of the Louvre.
            </p>
            <GoldDivider />
          </div>

          <TransformFlow />

          <p className="text-center text-[#888]/50 text-xs tracking-wide mt-6">
            Your image is processed securely and never stored without consent.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#d4af37]/15 py-10 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-playfair text-[#d4af37] tracking-[0.25em] uppercase text-sm">
            PetMasters
          </span>
          <p className="text-[#888]/50 text-xs tracking-wide text-center">
            © MMXXVI PetMasters Atelier. All portraits reserved.
          </p>
          <div className="flex gap-6 text-[#888]/50 text-xs tracking-wide">
            <a href="#" className="hover:text-[#d4af37] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#d4af37] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#d4af37] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
