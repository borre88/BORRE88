import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <Link href="/login" className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-teal">
        <ArrowLeft size={14} strokeWidth={2.2} />
        Torna al login
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <BrandMark size="md" />
        <div>
          <h1 className="font-display text-xl font-bold leading-tight">Informativa privacy</h1>
          <p className="text-xs text-ink-faint">Nutrition &amp; Performance — Dott. Simone Borrelli</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <PrivacyPolicyContent />
      </div>
    </div>
  );
}
