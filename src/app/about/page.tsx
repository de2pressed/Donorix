"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  BellRing,
  Building2,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Users,
} from "lucide-react";
import { useRef } from "react";

import { SecondaryPageBackLink } from "@/components/layout/secondary-page-back-link";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORT_EMAIL } from "@/lib/constants";

const STAGES = [
  {
    icon: Building2,
    title: "Hospital Posts a Request",
    description:
      "The hospital adds patient details, blood type needed, and urgency level.",
  },
  {
    icon: BellRing,
    title: "Donors Are Notified",
    description:
      "Matched donors receive an SMS and in-app alert without broad spam.",
  },
  {
    icon: Users,
    title: "Donors Apply",
    description:
      "Willing donors apply on the post and share their readiness to help.",
  },
  {
    icon: CheckCircle2,
    title: "Hospital Selects the Best Match",
    description:
      "The hospital reviews ranked applicants by compatibility, distance, and donation cooldown.",
  },
  {
    icon: HeartPulse,
    title: "Patient Receives Blood",
    description:
      "The patient gets the blood they need and the donor earns verified contribution history.",
  },
] as const;

function FlowCard({
  index,
  inView,
  title,
  description,
  Icon,
}: {
  index: number;
  inView: boolean;
  title: string;
  description: string;
  Icon: (typeof STAGES)[number]["icon"];
}) {
  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
      className="glass relative z-10 flex h-full flex-col gap-4 rounded-[1.75rem] p-5"
      initial={false}
      transition={{ delay: index * 0.14, duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-6" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Stage {index + 1}
        </p>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const reduceMotion = useReducedMotion();
  const flowRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(flowRef, {
    amount: 0.25,
    once: true,
  });

  return (
    <div className="space-y-8 pb-4">
      <div className="pt-1">
        <SecondaryPageBackLink />
      </div>

      <section className="glass overflow-hidden rounded-[2rem] border border-border p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">
              About Donorix
            </p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.02] md:text-6xl">
              A faster, safer path from hospital request to donor response.
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
              Donorix is designed around emergency coordination for India: hospitals post verified
              patient requests, matched donors respond quickly, and the platform keeps privacy,
              consent, and trust visible at every step.
            </p>
          </div>

          <Card className="overflow-hidden border-border/80 bg-card/80">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-glow">
                  <Droplets className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">SDG 3 aligned</p>
                  <p className="text-sm text-muted-foreground">
                    Good health and well-being through faster blood access.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-border p-4">
                <p className="text-sm font-medium">Mission</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Reduce avoidable delays in blood coordination by giving hospitals a structured
                  request system and donors a clear, trustworthy way to respond.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border p-4">
                <p className="text-sm font-medium">Founding team</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Built by Jayant Kumar and Sahil Kumar Jha for high-stakes medical coordination in
                  India.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border p-4">
                <p className="text-sm font-medium">Contact</p>
                <a className="mt-2 inline-block text-sm font-medium text-brand" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        ref={flowRef}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-6 shadow-soft md:p-8"
      >
        <div className="mb-6 max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">
            How it works
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            The donor-to-patient flow, shown step by step.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Each stage appears in sequence so the request lifecycle is easy to understand even on a
            first visit.
          </p>
        </div>

        <div className="space-y-4 md:hidden">
          {STAGES.map((stage, index) => (
            <div key={stage.title} className="flex flex-col items-center gap-4">
              <FlowCard
                Icon={stage.icon}
                description={stage.description}
                inView={inView}
                index={index}
                title={stage.title}
              />
              {index < STAGES.length - 1 ? (
                <motion.div
                  animate={inView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                  className="h-10 w-1 origin-top rounded-full bg-gradient-to-b from-brand to-[#ff7a59]"
                  initial={false}
                  transition={{
                    delay: reduceMotion ? 0 : index * 0.14 + 0.12,
                    duration: reduceMotion ? 0 : 0.28,
                    ease: "easeOut",
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="relative hidden grid-cols-[repeat(5,minmax(0,1fr))] gap-4 md:grid">
          {STAGES.map((stage, index) => (
            <div key={stage.title} className="relative">
              <FlowCard
                Icon={stage.icon}
                description={stage.description}
                inView={inView}
                index={index}
                title={stage.title}
              />
              {index < STAGES.length - 1 ? (
                <motion.div
                  animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                  className="absolute left-[calc(100%-0.25rem)] top-1/2 z-0 h-1 w-[calc(100%+1rem)] origin-left rounded-full bg-gradient-to-r from-brand to-[#ff7a59]"
                  initial={false}
                  transition={{
                    delay: reduceMotion ? 0 : index * 0.14 + 0.12,
                    duration: reduceMotion ? 0 : 0.28,
                    ease: "easeOut",
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
