'use client'

import React, { useMemo, useState } from "react";
import {
  Rocket,
  Globe,
  Users,
  MessageCircle,
  BriefcaseBusiness,
  BookOpen,
  CreditCard,
  Settings,
  Droplet,
  Mail,
  Monitor,
  Megaphone,
  Check,
  ChevronRight,
  MapPin,
  CalendarDays,
  Pencil,
  Headphones,
  Wrench,
  Target,
  TrendingUp,
} from "lucide-react";

const launchSteps = [
  {
    id: 1,
    title: "Build the Business",
    description: "Name, domain, legal setup, email, and phone.",
    status: "Completed",
    icon: BriefcaseBusiness,
    items: [
      "Business name",
      "Business type",
      "Domain selected",
      "Business email",
      "Business phone",
    ],
  },
  {
    id: 2,
    title: "Set Up the Brand & Website",
    description: "Logo, colors, business description, and website.",
    status: "In Progress",
    icon: Monitor,
    items: [
      "Logo",
      "Brand colors",
      "Business description",
      "Website homepage",
      "Contact form",
    ],
  },
  {
    id: 3,
    title: "Set Up the Systems",
    description: "CRM, payments, scheduling, and customer intake.",
    status: "Not Started",
    icon: Wrench,
    items: [
      "Customer intake form",
      "Simple CRM",
      "Scheduling system",
      "Payment setup",
      "Operations checklist",
    ],
  },
  {
    id: 4,
    title: "Find Customers",
    description: "Marketing, local outreach, leads, and connections.",
    status: "Not Started",
    icon: Target,
    items: [
      "Google Business Profile",
      "Lead generation plan",
      "Local outreach plan",
      "Referral strategy",
      "Browse connections",
    ],
  },
  {
    id: 5,
    title: "Launch & Grow",
    description: "Go live, get first customers, and keep growing.",
    status: "Not Started",
    icon: Rocket,
    items: [
      "Final launch checklist",
      "First customer plan",
      "Go live",
      "Partnerships",
      "Growth plan",
    ],
  },
];

const navItems = [
  { label: "Launch", icon: Rocket, active: true },
  { label: "Domains", icon: Globe },
  { label: "Connections", icon: Users },
  { label: "Messages", icon: MessageCircle },
  { label: "My Business", icon: BriefcaseBusiness },
  { label: "Resources", icon: BookOpen },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

const quickActions = [
  { title: "Find Domains", description: "Search available domain names.", icon: Globe },
  { title: "Browse Connections", description: "Find experts, vendors, and opportunities.", icon: Users },
  { title: "Open Messages", description: "View your conversations.", icon: MessageCircle },
  { title: "Use Resources", description: "Guides, templates, and tools.", icon: BookOpen },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    "In Progress": "bg-blue-500/15 text-blue-300 border-blue-500/20",
    "Not Started": "bg-slate-500/15 text-slate-300 border-slate-500/20",
  };

  return (
    <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function LeadsWorkLaunchDashboard() {
  const [steps, setSteps] = useState(launchSteps);
  const [selectedStep, setSelectedStep] = useState(steps[1]);

  const completedCount = useMemo(
    () => steps.filter((step) => step.status === "Completed").length,
    [steps]
  );

  const progress = Math.round((completedCount / steps.length) * 100);

  const markSelectedComplete = () => {
    setSteps((current) =>
      current.map((step) =>
        step.id === selectedStep.id ? { ...step, status: "Completed" } : step
      )
    );
    setSelectedStep((current) => ({ ...current, status: "Completed" }));
  };

  return (
    <div className="min-h-screen bg-[#020b17] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-[#031120] p-6 lg:flex lg:flex-col">
          <div className="mb-10 text-2xl font-bold tracking-tight">
            LEADS<span className="text-blue-400">WORK</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition ${
                    item.active
                      ? "border border-blue-400/20 bg-blue-500/15 text-blue-300"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
              <Headphones size={24} />
            </div>
            <h3 className="font-semibold">Need Help?</h3>
            <p className="mt-1 text-sm text-slate-400">Our team is here for you.</p>
            <button className="mt-4 w-full rounded-lg border border-blue-400/50 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/10">
              Chat with Support
            </button>
          </div>
        </aside>

        <main className="flex-1 px-5 py-8 md:px-10 lg:px-12">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome back, John 👋</h1>
              <p className="mt-2 text-slate-300">Your launch dashboard is simple: complete any section and keep moving.</p>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 font-semibold">JD</div>
              <span>John D.</span>
            </div>
          </header>

          <section className="rounded-2xl border border-white/10 bg-[#061529] p-6 shadow-2xl shadow-blue-950/20 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-blue-500/15 text-blue-300">
                  <Droplet size={44} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Business</p>
                  <div className="mt-2 flex items-center gap-3">
                    <h2 className="text-2xl font-bold md:text-3xl">Tampa Pressure Washing</h2>
                    <Pencil size={18} className="text-blue-300" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-blue-300">Pressure Washing Business</span>
                    <span className="flex items-center gap-1"><MapPin size={16} /> Tampa, FL</span>
                  </div>
                  <button className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
                    View Business Profile
                  </button>
                </div>
              </div>

              <div className="border-white/10 md:border-l md:pl-8">
                <p className="text-sm text-slate-400">Launch Progress</p>
                <div className="mt-2 text-4xl font-bold text-blue-400">{progress}%</div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{completedCount} of {steps.length} sections completed</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  <CalendarDays size={17} /> Launch Goal: 7 Days
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#061529] p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-[1.2fr_.8fr]">
              <div className="flex gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  <Monitor size={42} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-300">Your Next Step</p>
                  <h3 className="text-2xl font-bold">Set Up Your Brand & Website</h3>
                  <p className="mt-2 max-w-xl text-slate-300">Create the look of your business and build the page customers will see.</p>
                  <p className="mt-4 text-sm text-slate-300">Simple step-by-step setup</p>
                  <button className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold hover:bg-blue-400">
                    Continue Step <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h4 className="font-semibold">Simple Rule</h4>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  You do not have to complete this in order. Click any section below and finish what you can.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#061529] p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Build Your Business</h2>
              <p className="text-sm text-slate-300">{completedCount} of {steps.length} completed</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              {steps.map((step) => {
                const Icon = step.icon;
                const active = selectedStep.id === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className={`flex w-full items-center gap-4 border-b border-white/10 p-5 text-left transition last:border-b-0 ${
                      active ? "bg-blue-500/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                      step.status === "Completed"
                        ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-300"
                        : step.status === "In Progress"
                          ? "border-blue-400/30 bg-blue-500/20 text-blue-300"
                          : "border-white/10 bg-white/[0.03] text-slate-300"
                    }`}>
                      {step.status === "Completed" ? <Check size={22} /> : <Icon size={22} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{step.id}. {step.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                    </div>
                    <StatusBadge status={step.status} />
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-blue-300">Selected Section</p>
                  <h3 className="mt-1 text-xl font-bold">{selectedStep.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">Open this section, complete the tasks, then mark it complete.</p>
                </div>
                <button
                  onClick={markSelectedComplete}
                  className="rounded-xl bg-blue-500 px-5 py-3 font-semibold hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={selectedStep.status === "Completed"}
                >
                  Mark Complete
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                {selectedStep.items.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-[#061529] p-6">
            <h2 className="mb-5 text-xl font-semibold">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left hover:bg-white/[0.06]">
                    <Icon className="mb-4 text-blue-300" size={24} />
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
                    <ChevronRight className="mt-4 text-slate-400" size={18} />
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
