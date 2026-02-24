import Link from "next/link";
import Navbar from "./components/Navbar";

const features = [
  {
    color: "blue",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Role-Based Access Control",
    desc: "Tailored dashboards for Admin, Sales, Agent, Supplier, Runner, and Customer — each with precise permissions.",
  },
  {
    color: "emerald",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Smart Quote Builder",
    desc: "Generate accurate, customer-ready quotes in seconds with our dynamic pricing engine and PDF export.",
  },
  {
    color: "violet",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: "Online Booking & Payments",
    desc: "Accept FPX and card payments securely. Auto-send receipts and vouchers via WhatsApp or email.",
  },
  {
    color: "green",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: "WhatsApp Integration",
    desc: "Automated booking confirmations, reminders, and live updates sent directly to customers via WhatsApp.",
  },
  {
    color: "orange",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    ),
    title: "Fleet & Calendar Management",
    desc: "Real-time vehicle availability, runner task tracking, and operational scheduling — all in one view.",
  },
  {
    color: "rose",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Reports & Analytics",
    desc: "Booking stats, funnel analysis (lead → quote → paid), supplier payouts, and operational SLA tracking.",
  },
];

const iconColor: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 pt-16 flex items-center overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl" />
            <div className="absolute bottom-20 -left-10 w-72 h-72 bg-blue-300 rounded-full opacity-10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              {/* Left: Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-8">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Sabah Car Rental &amp; Tour Ops Portal
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                  Smarter Car Rental
                  <br />
                  <span className="text-blue-300">Operations,</span>
                  <br />
                  Simplified.
                </h1>

                <p className="text-lg text-blue-200 mb-8 leading-relaxed max-w-xl">
                  An all-in-one portal for bookings, quotes, fleet management,
                  payments, and tour operations — built specifically for
                  Sabah&apos;s car rental businesses.
                </p>

                <div className="flex flex-wrap gap-4 mb-12">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    Get Started
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-800/50 border border-blue-600/50 text-white rounded-xl font-semibold hover:bg-blue-800 transition-all"
                  >
                    View Features
                  </a>
                </div>

                {/* Stat chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: "60%", label: "Less WhatsApp" },
                    { value: "20%", label: "More Bookings" },
                    { value: "6", label: "User Roles" },
                    { value: "24/7", label: "Uptime" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center"
                    >
                      <div className="text-xl sm:text-2xl font-bold text-white">{s.value}</div>
                      <div className="text-xs text-blue-200 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Dashboard mockup */}
              <div className="hidden lg:block relative">
                <div className="absolute -inset-4 bg-blue-400 rounded-3xl blur-3xl opacity-15 rotate-3" />
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 shadow-2xl">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    <div className="ml-auto text-xs text-white/40 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      SabahCar Dashboard
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Bookings Today", val: "12" },
                      { label: "Revenue", val: "RM 4,800" },
                      { label: "Active Runners", val: "3" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/10 rounded-xl p-3">
                        <div className="text-xs text-white/50 mb-1">{s.label}</div>
                        <div className="text-sm font-bold text-white">{s.val}</div>
                        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-1 bg-blue-400 rounded-full w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-white/10 rounded-xl p-3 mb-4">
                    <div className="text-xs text-white/50 mb-3">Weekly Bookings</div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end">
                          <div
                            className="bg-blue-400 rounded-sm"
                            style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.45 }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex mt-1.5">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div key={i} className="flex-1 text-center text-xs text-white/30">{d}</div>
                      ))}
                    </div>
                  </div>

                  {/* Booking list */}
                  <div className="space-y-1.5">
                    <div className="text-xs text-white/40 mb-2">Recent Bookings</div>
                    {[
                      { name: "Ahmad Baharin", vehicle: "Toyota Vios", status: "Active", cls: "bg-emerald-400/20 text-emerald-300" },
                      { name: "Lee Chee Ming", vehicle: "Honda City", status: "Pending", cls: "bg-yellow-400/20 text-yellow-300" },
                      { name: "Sarah Rahman", vehicle: "Proton X70", status: "Confirmed", cls: "bg-blue-400/20 text-blue-300" },
                    ].map((b) => (
                      <div key={b.name} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                        <div>
                          <div className="text-xs font-medium text-white/80">{b.name}</div>
                          <div className="text-xs text-white/40">{b.vehicle}</div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.cls}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full block">
              <path d="M0 30 C360 60 1080 0 1440 30 L1440 60 L0 60 Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">
                Portal Features
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Everything You Need to Run
                <br className="hidden sm:block" />
                a Modern Car Rental Business
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg">
                From quote generation to supplier payouts — manage your entire
                operations in one powerful platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconColor[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="py-24 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-semibold mb-4">
                How It Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                From Lead to Handover in 3 Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: "1",
                  title: "Generate a Quote",
                  desc: "Sales or agent uses the Smart Quote Builder to create a customized, accurate quote for the customer in seconds.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  num: "2",
                  title: "Book & Pay Securely",
                  desc: "Customer confirms the booking with FPX or card. Instant confirmation sent via WhatsApp and email — no manual follow-up.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 010 3.182 3.745 3.745 0 01-3.068 1.593 3.745 3.745 0 01-3.182 0 3.745 3.745 0 01-1.593-3.068 3.745 3.745 0 010-3.182 3.745 3.745 0 013.068-1.593 3.745 3.745 0 013.182 0A3.745 3.745 0 0121 12z" />
                    </svg>
                  ),
                },
                {
                  num: "3",
                  title: "Track & Handover",
                  desc: "Runner team manages the physical vehicle handover. Track operations in real-time from the Runner Tasks dashboard.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  ),
                },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 bg-white border-2 border-blue-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                    <div className="text-blue-600">{step.icon}</div>
                    <div className="absolute -top-3 -right-3 w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ─────────────────────────────────────────── */}
        <section id="services" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">
                Our Services
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Two Services, One Powerful Platform
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Car Rental */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Car Rental</h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Self-drive and chauffeur-driven vehicles for daily, weekly, or monthly rentals. Economy to premium fleet.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {["Self-drive options", "Chauffeur service", "Airport transfers", "Long-term leasing", "Corporate packages"].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-blue-100">
                        <svg className="w-4 h-4 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
                  >
                    Book a Car
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Tour Operations */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Tour Operations</h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    Explore Sabah with curated packages. From city tours to island adventures and highland escapes.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {["Island hopping packages", "Cultural city tours", "Kinabalu highland trips", "Custom group tours", "Supplier coordination"].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
                  >
                    Explore Tours
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── USER ROLES ───────────────────────────────────────── */}
        <section className="py-24 bg-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-800 border border-blue-700 rounded-full text-blue-200 text-sm font-semibold mb-4">
              Portal Access
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Every Role in Your Team
            </h2>
            <p className="text-blue-300 max-w-xl mx-auto mb-12 text-lg">
              Six distinct roles, each with tailored access and tools for their specific responsibilities.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { role: "Admin", icon: "⚙️", desc: "Full system control" },
                { role: "Sales", icon: "📊", desc: "Leads & quotes" },
                { role: "Agent", icon: "👤", desc: "Customer facing" },
                { role: "Supplier", icon: "🚗", desc: "Fleet management" },
                { role: "Runner", icon: "📍", desc: "Ops & handover" },
                { role: "Customer", icon: "✨", desc: "Booking portal" },
              ].map((r) => (
                <div
                  key={r.role}
                  className="bg-blue-900/50 border border-blue-800 rounded-2xl p-5 hover:bg-blue-800/60 hover:border-blue-600 transition-all"
                >
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <div className="text-white font-bold text-sm">{r.role}</div>
                  <div className="text-blue-400 text-xs mt-1">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Ready to Streamline Your Operations?
            </h2>
            <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
              Join Sabah&apos;s car rental operators who are managing their business smarter with SabahCar Portal.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
            >
              Access the Portal
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer id="contact" className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold">
                    SabahCar<span className="text-blue-400"> Portal</span>
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  Sabah&apos;s all-in-one car rental and tour operations management portal. Streamline your business, delight your customers.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Features", href: "#features" },
                    { label: "Services", href: "#services" },
                    { label: "Portal Login", href: "/login" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>Kota Kinabalu, Sabah</li>
                  <li>Malaysia</li>
                  <li className="pt-2">
                    <a href="mailto:info@sabahcar.com.my" className="hover:text-white transition-colors">
                      info@sabahcar.com.my
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <p>© 2025 SabahCar Portal. All rights reserved.</p>
              <p>Built for Sabah&apos;s Car Rental Industry</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
