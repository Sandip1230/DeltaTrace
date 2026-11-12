import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, Bell, Crosshair, Droplets, FileText, FlaskConical, Layers, MapPin, Radio, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useSpotlight from "../hooks/useSpotlight";
import CyberBackground from "../components/ui/CyberBackground";
import MenuToggle from "../components/ui/MenuToggle";
import Reveal from "../components/ui/Reveal";
import CountUp from "../components/ui/CountUp";
import BackToTop, { ScrollProgress } from "../components/ui/BackToTop";
import NetworkCanvas from "../components/landing/NetworkCanvas";
import HeroPreview from "../components/landing/HeroPreview";

const LINKS = [["Features", "#features"], ["How it works", "#how"], ["Fingerprints", "#signatures"], ["Tech", "#tech"]];

const FEATURES = [
  { icon: Droplets, c: "#38d5f0", title: "Live WQI scoring", text: "Seven parameters fused into one Water Quality Index per station, refreshed from a live stream." },
  { icon: Bell, c: "#facc15", title: "Smart alerts", text: "Warning and critical limits per parameter, with acknowledge and auto-resolve workflow." },
  { icon: Crosshair, c: "#ff3da6", title: "Source tracing", text: "Pollution fingerprints matched against sewage, tannery, textile, farm and thermal sources." },
  { icon: FlaskConical, c: "#a855f7", title: "What-if simulator", text: "Drag sliders or pick a preset and watch the matcher re-rank the suspects instantly." },
  { icon: MapPin, c: "#34d399", title: "Geo map", text: "Dark glass map of stations and suspected sources with confidence lines." },
  { icon: FileText, c: "#fb923c", title: "Reports & export", text: "Filter history by station, period and status, then export CSV or print." },
];

const STEPS = [
  { icon: Radio, title: "Sense", text: "Sensor readings stream in every few seconds." },
  { icon: Layers, title: "Score", text: "Parameters are fused into a single WQI." },
  { icon: Bell, title: "Alert", text: "Limit breaches open alerts automatically." },
  { icon: Crosshair, title: "Trace", text: "The pollutant fingerprint points to the likely source." },
];

const SIGS = [
  { name: "Domestic sewage", up: ["BOD", "Nitrate", "Turbidity"], down: ["DO"] },
  { name: "Tannery", up: ["BOD", "TDS", "Turbidity"], down: ["pH"] },
  { name: "Textile dyeing", up: ["Turbidity", "TDS", "pH", "BOD"], down: [] },
  { name: "Agricultural runoff", up: ["Nitrate", "Turbidity", "BOD"], down: [] },
  { name: "Thermal discharge", up: ["Temperature", "TDS"], down: ["DO"] },
  { name: "Chemical industry", up: ["TDS", "Nitrate", "BOD", "Turbidity"], down: ["pH"] },
  { name: "Sugar & distillery", up: ["BOD", "Turbidity"], down: ["DO", "pH"] },
  { name: "Mining & ore washing", up: ["Turbidity", "TDS"], down: ["pH"] },
];

const TECH = ["MongoDB", "Express", "React", "Node.js", "Tailwind CSS", "Framer Motion", "Recharts", "Leaflet", "JWT Auth", "Server-Sent Events"];

const Head = ({ kicker, title, text }) => (
  <Reveal className="mx-auto mb-12 max-w-2xl text-center">
    <span className="chip">{kicker}</span>
    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
    {text && <p className="mt-3 text-white/60">{text}</p>}
  </Reveal>
);

function Nav({ user }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 px-3 transition-all duration-300 sm:px-4 ${solid ? "pt-2" : "pt-4"}`}>
      <div className="glass mx-auto max-w-6xl px-3 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-500/20 text-aqua-300 shadow-[0_0_20px_-4px_#38d5f0]">
              <Droplets size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Delta<span className="text-aqua-400">Trace</span></span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map(([l, h]) => (
              <a key={h} href={h} className="rounded-xl px-4 py-2 text-sm font-medium text-white/65 transition hover:bg-white/8 hover:text-aqua-300">
                {l}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to={user ? "/dashboard" : "/login"} className="btn-neon !px-4 !py-2.5 text-sm">
              {user ? "Open dashboard" : "Launch app"} <ArrowRight size={16} />
            </Link>
            <MenuToggle open={open} onClick={() => setOpen((o) => !o)} className="md:!hidden" />
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="grid gap-1 pt-3">
                {LINKS.map(([l, h], i) => (
                  <motion.a
                    key={h} href={h} onClick={() => setOpen(false)}
                    initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/8"
                  >
                    {l}
                  </motion.a>
                ))}
                {!user && (
                  <Link to="/login" className="rounded-xl px-4 py-3 text-sm font-semibold text-aqua-300 hover:bg-white/8">Sign in</Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

const Pill = ({ children, up }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] ${up ? "bg-orange-400/15 text-orange-300" : "bg-sky-400/15 text-sky-300"}`}>
    {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {children}
  </span>
);

export default function Landing() {
  const { user } = useAuth();
  useSpotlight();

  return (
    <div id="top" className="relative">
      <CyberBackground />
      <ScrollProgress />
      <Nav user={user} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40">
        <NetworkCanvas />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="chip">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Autonomous water intelligence
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
              className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Trace every <span className="neon glitch">drop.</span>
              <br />
              <span className="text-gradient">Find the source.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 max-w-xl text-base text-white/65 sm:text-lg">
              DeltaTrace scores river and canal water quality in real time, raises instant alerts, and matches pollution fingerprints to the most likely effluent source.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? "/dashboard" : "/login"} className="btn-neon">
                {user ? "Open dashboard" : "Launch dashboard"} <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-ghost">Explore features <ArrowDown size={16} /></a>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-widest text-white/45">
              <span>7 parameters</span><span>42 stations</span><span>6 regions</span><span>8 source fingerprints</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <HeroPreview />
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="glass grid grid-cols-2 gap-6 p-6 text-center sm:p-8 lg:grid-cols-4">
            {[[7, "Water parameters", 0, ""], [42, "Stations across India", 0, ""], [8, "Source fingerprints", 0, ""], [15, "Seconds per live update", 0, "s"]].map(([n, l, d, s]) => (
              <div key={l}>
                <p className="text-4xl font-extrabold text-aqua-300 sm:text-5xl"><CountUp to={n} decimals={d} suffix={s} /></p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
        <Head kicker="Capabilities" title="Everything you need to read the water" text="From raw readings to a named suspect, in one glass-clear dashboard." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="glass glass-hover h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: `${f.c}1f`, color: f.c, boxShadow: `0 0 24px -6px ${f.c}` }}>
                  <f.icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24">
        <Head kicker="Pipeline" title="From sensor to suspect in four steps" />
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-8 right-8 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-aqua-400/60 to-transparent lg:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="glass glass-hover relative h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua-500/15 text-aqua-300 shadow-[0_0_24px_-6px_#38d5f0]"><s.icon size={22} /></span>
                  <span className="font-mono text-3xl font-bold text-white/10">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Fingerprints */}
      <section id="signatures" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-4 pb-24 lg:grid-cols-2">
        <Reveal>
          <span className="chip">Source identification</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Every polluter leaves a <span className="text-gradient">fingerprint</span></h2>
          <p className="mt-4 text-white/60">
            DeltaTrace compares which parameters rise or fall together against known source signatures, then weighs distance to the station to rank the most likely culprit.
          </p>
          <Link to={user ? "/tracker" : "/login"} className="btn-ghost mt-6">Try the tracker <ArrowRight size={16} /></Link>
        </Reveal>

        <div className="space-y-3">
          {SIGS.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.07}>
              <div className="glass glass-hover flex flex-wrap items-center gap-2 p-4">
                <p className="mr-auto font-semibold">{s.name}</p>
                {s.up.map((p) => <Pill key={p} up>{p}</Pill>)}
                {s.down.map((p) => <Pill key={p}>{p}</Pill>)}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tech marquee */}
      <section id="tech" className="scroll-mt-24 overflow-hidden pb-24">
        <Head kicker="Built with" title="A modern MERN stack" />
        <div className="[mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee gap-4">
            {[...TECH, ...TECH].map((t, i) => (
              <span key={i} className="glass glass-hover mx-2 whitespace-nowrap px-6 py-3 font-mono text-sm text-aqua-200">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24">
        <Reveal>
          <div className="glass-strong glass-hover relative overflow-hidden p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-aqua-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-neon-violet/30 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to trace the source?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-white/60">Sign in with the demo account and watch the live stream light up the dashboard.</p>
            <Link to={user ? "/dashboard" : "/login"} className="btn-neon relative mt-7">
              {user ? "Open dashboard" : "Launch DeltaTrace"} <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/8 px-4 py-8 text-center text-xs text-white/45">
        <p className="font-mono uppercase tracking-widest">DeltaTrace · CAA Project RI_003 · JIS Group · 3rd Sem CSE 2026-27</p>
        <p className="mt-2">Sandip Maitra · Sandeep Yadav · Sangeeta Biswas · Sanghita Roy · Sarthak Patra</p>
      </footer>

      <BackToTop />
    </div>
  );
}