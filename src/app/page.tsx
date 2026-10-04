import Link from "next/link";
import {
  DownloadSimple,
  MusicNote,
  ImageIcon,
  ArrowRight,
  LinkIcon,
  Lightning,
  Lock,
  DeviceMobile,
  Globe,
  SealCheck,
} from "@/components/icons";
import { DownloaderTool } from "@/components/downloader-tool";
import { Reveal } from "@/components/reveal";
import { FEATURED_VIDEO } from "@/lib/demo";
import { FAQ } from "@/lib/faq";

const STEPS = [
  {
    icon: <LinkIcon size={20} weight="bold" />,
    title: "Copy the link",
    body: "Open the post in TikTok, tap Share, then Copy link. Photo posts work the same way.",
  },
  {
    icon: <Lightning size={20} weight="bold" />,
    title: "Paste it above",
    body: "Sift reads the post in a few seconds and lays out every file you can grab.",
  },
  {
    icon: <DownloadSimple size={20} weight="bold" />,
    title: "Save what you need",
    body: "Pick the clean video, the original sound, or the cover. Save one file, or grab every image from a photo post in a single ZIP.",
  },
];

const BENTO = [
  {
    size: "lg" as const,
    icon: <MusicNote size={20} weight="bold" />,
    title: "The original sound, as MP3",
    body: "Save the exact audio track from the post. Good for referencing a sound or keeping a clip of the music.",
  },
  {
    size: "sm" as const,
    icon: <ImageIcon size={20} weight="bold" />,
    title: "Cover image",
    body: "Grab the full-resolution thumbnail for a thumbnail or a mood board.",
  },
  {
    size: "sm" as const,
    icon: <Lock size={20} weight="bold" />,
    title: "Nothing stored",
    body: "No account and no database. We do not keep a copy of the files you save.",
  },
  {
    size: "sm" as const,
    icon: <DeviceMobile size={20} weight="bold" />,
    title: "Built for phones",
    body: "The layout is sized for a phone in one hand, where most people copy links.",
  },
  {
    size: "sm" as const,
    icon: <Globe size={20} weight="bold" />,
    title: "No region lock",
    body: "Works the same wherever you are, as long as the post itself is public.",
  },
];

const FAQ_ITEMS = FAQ;

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div>
            <Reveal>
              <h1 className="max-w-[15ch] text-[2.4rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                Save TikTok videos clean and quick.
              </h1>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-muted sm:text-base">
                Paste one link or a whole list. Pull the clean video, the
                original sound, and the cover. Bundle a photo post into a single
                ZIP. No account, no fee.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-8">
                <DownloaderTool />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="order-first lg:order-none">
            <AutoPlayCard />
          </Reveal>
        </div>
      </section>

      <section
        id="how"
        aria-label="How it works"
        className="scroll-mt-20 border-t border-line"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Three steps, one of them is just pasting.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08} className="h-full">
                <div className="flex h-full flex-col">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-weak text-accent">
                    {step.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="What you can save"
        className="border-t border-line bg-surface/40"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Every useful file, side by side.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-ink">
                  <DownloadSimple size={20} weight="bold" />
                </span>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold tracking-tight text-ink">
                    Video without the watermark
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    The clean playing file, not a screen recording. Saves as
                    MP4 so it plays anywhere and drops straight into an edit.
                  </p>
                  <div className="mt-6 space-y-2">
                    {["MP4", "HD when available", "Keeps the audio"].map(
                      (tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 text-sm text-ink-muted"
                        >
                          <SealCheck
                            size={16}
                            weight="fill"
                            className="text-accent"
                          />
                          {tag}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="lg:col-span-2">
              <div className="grid h-full gap-4 sm:grid-cols-2">
                {[BENTO[0], BENTO[1]].map((cell) => (
                  <div
                    key={cell.title}
                    className="rounded-2xl border border-line bg-surface p-6"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-weak text-accent">
                      {cell.icon}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                      {cell.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                      {cell.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            {[BENTO[2], BENTO[3], BENTO[4]].map((cell, index) => (
              <Reveal key={cell.title} delay={index * 0.05}>
                <div className="h-full rounded-2xl border border-line bg-surface p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-weak text-accent">
                    {cell.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                    {cell.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                    {cell.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        aria-label="Frequently asked questions"
        className="scroll-mt-20 border-t border-line"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Questions, answered plainly.
            </h2>
          </Reveal>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQ_ITEMS.map((item, index) => (
              <Reveal key={item.q} delay={index * 0.03}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                    <span className="text-base font-medium text-ink sm:text-lg">
                      {item.q}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-transform group-open:rotate-45">
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[68ch] pr-10 text-sm leading-relaxed text-ink-muted">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Keep your own work, or a sound you love.
          </h2>
          <Link
            href="#tool"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:brightness-105 active:translate-y-px"
          >
            Save a video <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </section>
    </>
  );
}

function AutoPlayCard() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-2xl" />
      <div className="overflow-hidden rounded-[1.6rem] border border-line bg-surface shadow-2xl shadow-black/5">
        <div className="relative">
          <video
            className="aspect-[9/13] w-full object-cover"
            src={FEATURED_VIDEO}
            poster="/hero-poster.svg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Sample TikTok video preview"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-ink">
              <DownloadSimple size={16} weight="bold" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/90">
              Clean MP4 ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
