import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface PropertyCardAmenity {
  /** Lucide icon component (or any SVG-returning component). */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

export interface PropertyCardProps {
  imageUrl: string;
  imageAlt?: string;
  /** Short eyebrow tag — e.g. "Featured", "New", "Concierge Pick". */
  tag?: string;
  name: string;
  location?: string;
  /** Amount only — e.g. 280. The currency / suffix renders separately. */
  pricePerNight: number;
  currency?: string;
  perLabel?: string;
  amenities?: PropertyCardAmenity[];
  onSelect?: () => void;
  ctaLabel?: string;
  className?: string;
}

/**
 * Onyx & Amber property card. Glassmorphic surface, amber accent, subtle
 * scale-up on hover. Drop-in: render inside any dark (Onyx) page.
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  imageUrl,
  imageAlt = '',
  tag,
  name,
  location,
  pricePerNight,
  currency = 'OMR',
  perLabel = 'per night',
  amenities = [],
  onSelect,
  ctaLabel = 'Reserve',
  className,
}) => {
  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        // Glassmorphism: blur(12px) + 1px subtle white border (per spec).
        'glass-card group relative overflow-hidden',
        'transition-shadow duration-500',
        'hover:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,191,0,0.18)]',
        className,
      )}
    >
      {/* Cover image with dark gradient overlay so the white text pops. */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out
                     group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 hero-overlay pointer-events-none" />

        {tag && (
          <span
            className="absolute top-4 start-4 inline-flex items-center
                       rounded-full bg-[#FFBF00] text-black
                       px-3 py-1 text-[10px] font-extrabold uppercase tracking-architectural
                       amber-glow"
          >
            {tag}
          </span>
        )}

        {/* Title overlay — Pure White headline on the gradient. */}
        <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-architectural truncate">
              {name}
            </h3>
            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-architectural text-[#A0A0A0]">
                <MapPin size={12} className="text-[#FFBF00]" />
                <span className="truncate">{location}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card body — silver body copy + amber pricing. */}
      <div className="p-5 sm:p-6 space-y-5">
        {amenities.length > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-3">
            {amenities.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-architectural text-[#A0A0A0]"
              >
                <a.icon size={16} className="icon-amber shrink-0" />
                {a.label}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-end justify-between gap-4 pt-1 border-t border-white/[0.08]">
          <div>
            <p className="text-[10px] uppercase tracking-architectural text-[#6B6B6B]">From</p>
            <p className="mt-1">
              <span className="font-display text-2xl font-extrabold text-[#FFBF00]">
                {pricePerNight}
              </span>
              <span className="ms-1.5 text-xs font-bold uppercase tracking-architectural text-[#A0A0A0]">
                {currency}
              </span>
              <span className="ms-2 text-[11px] text-[#6B6B6B]">/ {perLabel}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onSelect}
            className="group/btn inline-flex items-center gap-2
                       rounded-full bg-[#FFBF00] text-black
                       px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-architectural
                       amber-glow hover:bg-[#FFD15C] hover:shadow-[0_0_28px_rgba(255,191,0,0.55)]
                       transition-all duration-500 active:scale-[0.97]"
          >
            {ctaLabel}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
