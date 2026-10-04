import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Sift is an independent tool and is not affiliated with TikTok.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      updated="October 2026"
      intro="Sift is an independent utility. This page sets out what that means and the limits of what the tool can do."
    >
      <LegalSection heading="Not affiliated with TikTok">
        <p>
          Sift is not connected to, endorsed by, or sponsored by TikTok or
          ByteDance. All trademarks belong to their owners and are used here
          only to describe what the tool does.
        </p>
      </LegalSection>
      <LegalSection heading="Personal use">
        <p>
          Sift is meant for personal use, such as saving your own posts or
          keeping a copy of a clip you have the right to use. Copyright and
          platform rules still apply to whatever you download.
        </p>
      </LegalSection>
      <LegalSection heading="No guarantee of availability">
        <p>
          Sift relies on public data. A post can be private, region-locked, or
          removed, and the underlying sources can change without notice. As a
          result, a link that worked yesterday may not work today.
        </p>
      </LegalSection>
      <LegalSection heading="No warranty">
        <p>
          The tool is offered without warranty of any kind. You use it at your
          own discretion and risk, and you are responsible for complying with
          the terms of any service you use it with.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
