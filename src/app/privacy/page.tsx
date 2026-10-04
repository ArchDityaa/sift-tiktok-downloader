import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Sift does and does not collect when you save a TikTok.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="October 2026"
      intro="Sift is built to do its job without collecting more than it needs. This page explains, in plain language, what happens to your data when you use the tool."
    >
      <LegalSection heading="What we do not collect">
        <p>
          There is no account, no sign-up, and no user profile. We do not ask
          for your name, email, or any personal details, and we do not sell or
          share data about you.
        </p>
      </LegalSection>
      <LegalSection heading="Links you submit">
        <p>
          When you paste a link, it is sent to our server only so the post can
          be read and its files returned to you. The link is processed on the
          fly and is not written to a database.
        </p>
        <p>
          The recent-links list on the History page is stored in your own
          browser using local storage. It never leaves your device, and you can
          clear it at any time from that page.
        </p>
      </LegalSection>
      <LegalSection heading="Hosting and logs">
        <p>
          Sift runs on Vercel, which keeps short-lived technical logs for
          security and reliability, such as request time and status. These logs
          are standard for web hosting and are not used to identify you.
        </p>
      </LegalSection>
      <LegalSection heading="Third-party requests">
        <p>
          To fetch media, your requests pass through our server to TikTok and
          its content delivery network. Their handling of that traffic is
          governed by their own policies, not ours.
        </p>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>
          This is an independent project. For privacy questions, reach the
          maintainer through the contact details on the project repository.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
