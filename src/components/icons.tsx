"use client";

/**
 * Re-export the Phosphor icons we use behind a single client boundary.
 * Phosphor reads React context, so this keeps every import safe inside
 * Server Components without sprinkling "use client" across the tree.
 */
export {
  ArrowRight,
  ArrowUpRight,
  ArrowClockwise,
  ChatCircleDots,
  CheckCircle,
  Clipboard,
  ClockCounterClockwise,
  Copy,
  DownloadSimple,
  DeviceMobile,
  FileZip,
  Globe,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  ListChecks,
  Lock,
  Moon,
  MusicNote,
  Play,
  ShareNetwork,
  ShieldCheck,
  SpinnerGap,
  Stack,
  Sun,
  Trash,
  WarningCircle,
  X,
  Lightning,
  SealCheck,
} from "@phosphor-icons/react";
