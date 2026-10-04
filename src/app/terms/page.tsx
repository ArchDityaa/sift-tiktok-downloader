import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using the Sift TikTok downloader.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="October 2026"
      intro="By using Sift you agree to these terms. They exist to keep the tool useful and to keep its use fair and lawful."
    >
      <LegalSection heading="The service">
        <p>
          Sift lets you retrieve media from public TikTok posts you point it at.
          The tool is provided as is, without warranty, and may change or stop
          working at any time.
        </p>
      </LegalSection>
      <LegalSection heading="Your responsibilities">
        <p>
          You are responsible for the links you submit and for how you use what
          you save. Only download content you have the right to use, such as
          your own posts or material you have permission to keep.
        </p>
        <p>
          Do not use Sift to infringe copyright, to harass others, to build a
          competing archive of someone else&apos;s work, or to break any law that
          applies to you.
        </p>
      </LegalSection>
      <LegalSection heading="Acceptable use">
        <p>
          Do not attempt to overload, scrape, or reverse engineer the service,
          and do not use automated tools to hammer the endpoint. Fair personal
          use only.
        </p>
      </LegalSection>
      <LegalSection heading="Liability">
        <p>
          Sift is not liable for any loss or damage arising from your use of the
          tool or from content you download with it. Use it at your own risk.
        </p>
      </LegalSection>
      <LegalSection heading="Changes">
        <p>
          These terms may be updated from time to time. Continued use of Sift
          after a change means you accept the new terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
