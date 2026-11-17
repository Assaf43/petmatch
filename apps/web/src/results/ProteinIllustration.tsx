import type { Protein } from '@petmatch/core';
import { Beef, Bird, Bone, Drumstick, Fish } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// A generic icon per main protein: the catalog has no images, so nothing is hot-linked.
const ICONS: Record<Protein, LucideIcon> = {
  chicken: Drumstick,
  beef: Beef,
  lamb: Bone,
  fish: Fish,
  turkey: Bird,
  duck: Bird,
  other: Bone,
};

export function ProteinIllustration({ protein }: { protein: Protein }) {
  const Icon = ICONS[protein];
  return (
    <div className="flex h-32 w-full items-center justify-center rounded-3xl bg-[#f3f6f9] text-brand-blue/70">
      <Icon size={56} strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}
