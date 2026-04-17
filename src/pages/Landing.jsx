import { motion } from 'framer-motion'
import GlowingOrb from '../components/Orb/GlowingOrb.jsx'
import { Link } from '../router.jsx'

const ease = [0.22, 1, 0.36, 1]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

function Section({ id, children }) {
  return (
    <section id={id} className="relative" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
    </section>
  )
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
      {children}
    </span>
  )
}

function PrimaryButton({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#0EA5E9] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_40px_rgba(124,58,237,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
    >
      {children}
    </Link>
  )
}

function SecondaryButton({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
    >
      {children}
    </a>
  )
}

function FeatureCard({ title, desc, gradient, accent }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12111A]/80 p-6 pl-7 backdrop-blur transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-[#7C3AED] hover:shadow-[0_18px_48px_rgba(124,58,237,0.25)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full w-[4px] rounded-l-2xl"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
        style={{ background: gradient }}
      />
      <div className="relative">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{desc}</p>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A12] text-white">
      <div className="pointer-events-none fixed inset-0 dhvani-dotgrid" />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A12]/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#DB2777] to-[#0EA5E9]" />
            <div className="leading-tight">
              <div className="text-sm font-medium tracking-wide">Dhvani AI</div>
              <div className="text-xs text-white/60">Voice-first accessibility agent</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm text-white/75 md:flex">
            <a className="hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-white" href="#how">
              How it works
            </a>
            <a className="hover:text-white" href="#accessibility">
              Accessibility
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <PrimaryButton to="/demo">Open Demo</PrimaryButton>
          </div>
        </div>
      </header>

      <Section id="hero">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <Pill>
              <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
              HackBLR 2026 • PS-3
            </Pill>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl"
          >
            Speak. Listen.
            <span className="block bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#0EA5E9] bg-clip-text text-transparent">
              Navigate the world.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            Dhvani AI is a voice-first accessibility agent designed for visually impaired users—fast, calm, and reliable. It reads, describes, and guides with a conversational UI built around confidence.
          </motion.p>

          <motion.div variants={fadeUp} className="relative mt-14 flex items-center justify-center">
            <div
              className="pointer-events-none absolute h-[560px] w-[560px] rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(219,39,119,0.18) 40%, rgba(14,165,233,0.12) 65%, transparent 75%)',
              }}
            />

            <motion.div
              className="pointer-events-none absolute rounded-full border border-[#7C3AED]/40"
              style={{ width: 440, height: 440 }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="pointer-events-none absolute rounded-full border border-[#DB2777]/35"
              style={{ width: 500, height: 500 }}
              animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0, 0.45] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
            />
            <motion.div
              className="pointer-events-none absolute rounded-full border border-[#0EA5E9]/30"
              style={{ width: 560, height: 560 }}
              animate={{ scale: [1, 1.26, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut', delay: 1.6 }}
            />

            <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full border border-white/5" />
            <div className="pointer-events-none absolute h-[380px] w-[380px] rounded-full border border-white/5" />

            <GlowingOrb className="relative h-[400px] w-[400px]" />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-14 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton to="/demo">Try the voice agent</PrimaryButton>
            <SecondaryButton href="#how">See how it works</SecondaryButton>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { number: '285M', label: 'visually impaired worldwide' },
              { number: '49M', label: 'completely blind' },
              { number: '95%', label: 'of websites are inaccessible' },
            ].map((stat) => (
              <div
                key={stat.number}
                className="rounded-2xl border-t-[3px] border-[#DB2777] bg-[#18172A] p-6 text-left shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="text-[32px] font-bold leading-none tracking-tight text-white">
                  {stat.number}
                </div>
                <div className="mt-3 text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      <Section id="features">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-120px' }}
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl">Built for trust, speed, and clarity</h2>
              <p className="mt-3 max-w-2xl text-white/70">
                A voice-first interface shouldn’t feel like a chatbot. Dhvani keeps the user grounded with strong states, minimal cognitive load, and high-contrast visuals.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Voice-first navigation"
              desc="Everything is operable hands-free. Clear mic states and intentional prompts." 
              gradient="radial-gradient(circle at 30% 20%, rgba(124,58,237,0.35), transparent 60%)"
              accent="#7C3AED"
            />
            <FeatureCard
              title="Contextual descriptions"
              desc="Describe scenes, screens, and UI elements with a calm, predictable tone." 
              gradient="radial-gradient(circle at 30% 20%, rgba(219,39,119,0.35), transparent 60%)"
              accent="#DB2777"
            />
            <FeatureCard
              title="Guided actions"
              desc="Step-by-step, confirm-before-act patterns to reduce errors and increase safety." 
              gradient="radial-gradient(circle at 30% 20%, rgba(14,165,233,0.35), transparent 60%)"
              accent="#0EA5E9"
            />
          </div>
        </motion.div>
      </Section>

      <Section id="how">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease }}
          className="grid gap-8 md:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">How it works</h2>
            <p className="mt-3 text-white/70">
              Dhvani centers the experience around a living orb that reacts to mic state, and a conversation log that stays readable in one glance.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#12111A]/80 p-6 backdrop-blur">
                <div className="text-sm font-medium">1. Tap or say “Hey Dhvani”</div>
                <div className="mt-2 text-sm text-white/70">The orb enters listening mode and confirms it heard you.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#12111A]/80 p-6 backdrop-blur">
                <div className="text-sm font-medium">2. Ask for help</div>
                <div className="mt-2 text-sm text-white/70">Reading, describing, navigation, or guided actions—one interface.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#12111A]/80 p-6 backdrop-blur">
                <div className="text-sm font-medium">3. Confirm & proceed</div>
                <div className="mt-2 text-sm text-white/70">Dhvani uses confirm-before-act patterns when outcomes matter.</div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#7C3AED]/20 blur-3xl" />
            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#0EA5E9]/15 blur-3xl" />
            <div className="relative">
              <div className="text-sm font-medium text-white/90">Example conversation</div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#12111A]/70 p-4 text-sm text-white/80">
                  <div className="text-white/50">You</div>
                  <div className="mt-1">Describe what’s in front of me.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                  <div className="bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#0EA5E9] bg-clip-text text-transparent">
                    Dhvani
                  </div>
                  <div className="mt-1">
                    I see a hallway with a door slightly open on the right. There’s a table ahead at about two steps. Would you like directions to pass safely?
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0A0A12]/40 p-4 text-sm text-white/60">
                Designed for minimal ambiguity and high confidence.
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      <Section id="accessibility">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-120px' }}
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-medium tracking-tight md:text-3xl">
            Accessibility-first, not accessibility-later
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 max-w-3xl text-white/70">
            High contrast, clear focus states, predictable layouts, and voice-first flows that reduce multi-step UI interaction.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 rounded-[28px] border border-white/10 bg-[#12111A]/80 p-8 backdrop-blur">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium">Keyboard-first</div>
                <div className="mt-2 text-sm text-white/70">Focusable controls and visible outlines for non-pointer use.</div>
              </div>
              <div>
                <div className="text-sm font-medium">Calm motion</div>
                <div className="mt-2 text-sm text-white/70">Framer Motion reveals are subtle, timed, and non-distracting.</div>
              </div>
              <div>
                <div className="text-sm font-medium">Voice state clarity</div>
                <div className="mt-2 text-sm text-white/70">Listening/speaking/thinking states will be reflected in the orb.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      <Section id="cta">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7, ease }}
          className="relative overflow-hidden rounded-[28px] border border-[#7C3AED] bg-[#0A0A12] p-10 text-center md:p-16"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.25), transparent 55%), radial-gradient(circle at 50% 100%, rgba(219,39,119,0.18), transparent 55%)',
            }}
          />
          <div
            className="pointer-events-none absolute -inset-px rounded-[28px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(219,39,119,0.3), rgba(14,165,233,0.5))',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: 1,
            }}
          />

          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
              Ready to experience it?
            </h2>
            <p className="mt-4 text-base text-white/70 md:text-lg">
              No install. No app. Open Chrome and speak.
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                to="/demo"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#0EA5E9] px-8 py-4 text-base font-semibold text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
                style={{ boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
              >
                Launch Dhvani AI <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>

      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/60">© {new Date().getFullYear()} Dhvani AI</div>
          <div className="flex items-center gap-4 text-sm">
            <a className="text-white/60 hover:text-white" href="#hero">
              Back to top
            </a>
            <Link className="text-white/60 hover:text-white" to="/demo">
              Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
