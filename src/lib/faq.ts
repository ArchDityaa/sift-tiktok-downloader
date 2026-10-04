export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: "Do I need an account or pay anything?",
    a: "No. Sift has no sign-up, no paywall, and no key you have to plug in. Paste a link and save the file.",
  },
  {
    q: "Why is the video sometimes only at standard quality?",
    a: "TikTok does not always publish a separate HD file. When it is available we show it first. Otherwise you get the best file the post offers.",
  },
  {
    q: "Can I download photo posts and slideshows?",
    a: "Yes. Photo posts come back as one save button per image, so you can keep the whole set or just the frame you want.",
  },
  {
    q: "Is it legal to save a TikTok?",
    a: "Sift is meant for personal use, like saving your own posts. Re-uploading someone else's work without permission can break copyright. Check the rules that apply to you.",
  },
  {
    q: "The link did not work. What now?",
    a: "Make sure the post is public and the link points at a single post rather than a profile. If it still fails, try again in a moment; the source can be busy.",
  },
];
