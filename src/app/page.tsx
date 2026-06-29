"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChefHat,
  QrCode,
  Sparkles,
  TrendingUp,
  Zap,
  Clock,
  Shield,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: QrCode,
    title: "Smart QR Ordering",
    description: "Scan, browse, customize, order — no waiter chase required.",
    accent: "bg-[#E8FF00]/10 text-[#E8FF00] border-[#E8FF00]/20",
  },
  {
    icon: Flame,
    title: "Kitchen Display",
    description: "Live Firebase-powered order queue. Zero miscommunication.",
    accent: "bg-[#3DD68C]/10 text-[#3DD68C] border-[#3DD68C]/20",
  },
  {
    icon: Sparkles,
    title: "AI Upselling",
    description: "Smart combos that bump average order value by 23%.",
    accent: "bg-[#9B7EDE]/10 text-[#9B7EDE] border-[#9B7EDE]/20",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description: "Peak hours, best sellers, behavior — data that drives growth.",
    accent: "bg-[#E8FF00]/10 text-[#E8FF00] border-[#E8FF00]/20",
  },
  {
    icon: TrendingUp,
    title: "Growth Intelligence",
    description: "Spot underperformers, optimize pricing, maximize turnover.",
    accent: "bg-[#3DD68C]/10 text-[#3DD68C] border-[#3DD68C]/20",
  },
  {
    icon: Zap,
    title: "Instant Billing",
    description: "Auto bills, tax calc, payment tracking — done.",
    accent: "bg-[#9B7EDE]/10 text-[#9B7EDE] border-[#9B7EDE]/20",
  },
];

const stats = [
  { value: "40%", label: "Faster service", emoji: "⚡" },
  { value: "23%", label: "Higher AOV", emoji: "📈" },
  { value: "99.2%", label: "Order accuracy", emoji: "✓" },
  { value: "2.4×", label: "Table turnover", emoji: "🔄" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-hidden relative font-sans">
      {/* Cyber ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[#E8FF00]/5 rounded-full filter blur-[120px] opacity-60" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-[#9B7EDE]/5 rounded-full filter blur-[100px] opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#3DD68C]/5 rounded-full filter blur-[100px] opacity-30" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-cyber border-x-0 border-t-0 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8FF00] flex items-center justify-center text-black shadow-lg shadow-[#E8FF00]/15 animate-wiggle">
              <ChefHat className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-lg tracking-tight font-cyber-header text-white text-cyber-glow">OrderEasy</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium font-cyber-data">
            <a href="#features" className="hover:text-[#E8FF00] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#E8FF00] transition-colors">Pricing</a>
            <Link href="/dashboard/bella-vista" className="hover:text-[#E8FF00] transition-colors">
              Demo
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/bella-vista">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/5 font-cyber-data">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold shadow-lg shadow-[#E8FF00]/10 font-cyber-data">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 mb-8 shadow-inner font-cyber-data"
          >
            <span className="w-2 h-2 rounded-full bg-[#E8FF00] animate-pulse" />
            The restaurant growth operating system
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 font-cyber-header"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#E8FF00] text-cyber-glow">More profit.</span>
            <br />
            <span className="text-white">Less chaos.</span>
            <br />
            <span className="text-white/55">Happier guests.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-cyber-data"
          >
            OrderEasy automates ordering, eliminates errors, and grows revenue —
            powered by Firebase real-time sync and AI upselling. Not just a QR menu.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/bella-vista/order?table=5">
              <Button size="lg" className="min-w-[220px] bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-extrabold tracking-wide shadow-lg shadow-[#E8FF00]/15 hover:shadow-[#E8FF00]/25 transition-all">
                Try live demo ✨
              </Button>
            </Link>
            <Link href="/dashboard/bella-vista">
              <Button variant="outline" size="lg" className="min-w-[220px] border-white/10 hover:border-white/30 text-white hover:bg-white/5">
                View dashboard
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 z-10"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0F0F0F]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-[#E8FF00]/20 transition-all duration-300 text-center shadow-lg"
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-2xl md:text-3xl font-extrabold text-[#E8FF00] font-cyber-header">
                {stat.value}
              </div>
              <div className="text-xs text-white/50 mt-1 font-medium font-cyber-data">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Product preview */}
      <section className="px-6 pb-24 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/80 bg-[#0F0F0F]">
            <div className="bg-[#141414] px-5 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 text-center text-xs text-white/30 font-mono">
                dashboard.ordereasy.com/bella-vista
              </div>
            </div>
            <div className="bg-[#0F0F0F] p-8 md:p-10">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Today's Revenue", value: "$4,280", change: "+12.5%", color: "text-[#3DD68C]" },
                  { label: "Live Orders", value: "8", change: "Firebase sync", color: "text-[#E8FF00]" },
                  { label: "Avg Order", value: "$52.40", change: "+8.2%", color: "text-[#3DD68C]" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl bg-[#141414] border border-white/5 p-5 text-white hover:border-[#E8FF00]/10 transition-all duration-300"
                  >
                    <div className="text-xs text-white/40 mb-2 font-cyber-data">{card.label}</div>
                    <div className="text-2xl font-bold font-cyber-header">{card.value}</div>
                    <div className={`text-xs mt-1 font-medium font-cyber-data ${card.color}`}>
                      {card.change}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#141414] border border-white/5 p-5 h-44 flex items-end gap-2">
                {[35, 60, 42, 78, 50, 88, 65, 92, 58, 95, 72, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-[#E8FF00]/20 to-[#E8FF00] opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-[#0A0A0A] border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 font-cyber-header">
              Everything to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#E8FF00] text-cyber-glow">grow your restaurant</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto font-cyber-data">
              One seamless, real-time platform — from QR scan to analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#0F0F0F]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-[#E8FF00]/20 transition-all duration-300 shadow-xl hover:shadow-black/60 group"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.accent} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 font-cyber-header text-white">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed font-cyber-data">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 font-cyber-header">
              Simple pricing, serious results
            </h2>
            <p className="text-white/50 text-lg font-cyber-data">
              14-day free trial. No credit card. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Starter",
                price: "$49",
                description: "Small cafes & bistros getting started",
                features: ["20 tables", "QR ordering", "Kitchen display", "Basic analytics", "Email support"],
                popular: false,
              },
              {
                name: "Pro",
                price: "$149",
                description: "Growing restaurants that want the full stack",
                features: ["Unlimited tables", "Firebase real-time sync", "AI upselling", "Advanced analytics", "Auto billing", "Priority support"],
                popular: true,
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -6 }}
                className={`rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between ${
                  plan.popular
                    ? "bg-[#0F0F0F] border border-[#E8FF00]/30 shadow-2xl shadow-black/80"
                    : "bg-[#0F0F0F]/60 border border-white/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <span className="text-[9px] font-extrabold text-black bg-[#E8FF00] px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                      🔥 Most popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold font-cyber-header mt-2 text-white">{plan.name}</h3>
                  <p className="text-sm mt-2 text-white/50 font-cyber-data">
                    {plan.description}
                  </p>
                  <div className="mt-6 mb-6 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold font-cyber-header text-white">{plan.price}</span>
                    <span className="text-white/40 text-sm font-cyber-data">/mo</span>
                  </div>
                  <div className="cyber-divider mb-6" />
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-white/75 font-cyber-data">
                        <ChevronRight className="w-4 h-4 text-[#E8FF00] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/signup" className="w-full block mt-auto">
                  <Button
                    className={`w-full py-5 rounded-xl font-bold font-cyber-data ${
                      plan.popular
                        ? "bg-[#E8FF00] hover:bg-[#E8FF00]/95 text-black shadow-lg shadow-[#E8FF00]/10"
                        : "border border-white/10 hover:bg-white/5 text-white"
                    }`}
                  >
                    Start free trial
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 relative z-10">
        <motion.div
          whileInView={{ scale: [0.98, 1] }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#0F0F0F] via-[#141414] to-[#080808] border border-[#E8FF00]/10 p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-black/80"
        >
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#E8FF00]/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#9B7EDE]/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 font-cyber-header text-cyber-glow">
              Ready to modernize? 🍽️
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto font-cyber-data">
              Join restaurants using OrderEasy to serve faster, sell more, and stress less.
            </p>
            <Link href="/bella-vista/order?table=5">
              <Button
                size="lg"
                className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-extrabold tracking-wide shadow-xl shadow-[#E8FF00]/15 hover:shadow-[#E8FF00]/25 px-8 py-6 rounded-xl font-cyber-data"
              >
                Try the live demo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-10 text-xs text-white/40 font-cyber-data">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E8FF00]" /> 5-min setup
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#E8FF00]" /> Firebase-backed
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10 bg-[#080808] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8FF00] flex items-center justify-center text-black">
              <ChefHat className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-white font-cyber-header">OrderEasy</span>
          </div>
          <p className="text-xs text-white/40 font-cyber-data">
            © 2026 OrderEasy · The restaurant growth operating system
          </p>
        </div>
      </footer>
    </div>
  );
}
