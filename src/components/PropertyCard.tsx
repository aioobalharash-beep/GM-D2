import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, MapPin, Mountain } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface PropertyCardAmenity {
  /** Lucide icon component (or any SVG-returning component). */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

export type PropertyCardBadgeTone = 'rose' | 'juniper';

export interface PropertyCardProps {
  imageUrl: string;
  imageAlt?: string;
  /** Short eyebrow tag — e.g. "Mountain View", "Available", "New". */
  badge?: string;
  /** Badge tone. Defaults to Rose for soft accents (Mountain View / Available). */
  badgeTone?: PropertyCardBadgeTone;
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
 * Stone & Rose property card. Vertical (portrait) aspect ratio so the card
 * reads like a hewn stone slab. Heavy offset shadow for weight, 8px chiseled
 * corners, image desaturates slightly on hover to emphasise the stone
 * aesthetic, Juniper-Green CTA with a Rose halo, Rose-coloured badge.
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  imageUrl,
  imageAlt = '',
  badge = 'Mountain View',
  badgeTone = 'rose',
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
  const badgeClasses =
    badgeTone === 'juniper'
      ? 'bg-[#4B5320] text-[#F9F9F9]'
      : 'bg-[#B48E92] text-[#F9F9F9]';

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        // Stone block — flat 8px corners + heavy offset shadow.
        'group relative overflow-hidden bg-white',
        'border border-[#1B1B1B]/10 rounded-[8px]',
        'shadow-[10px_10px_25px_rgba(0,0,0,0.15)]',
        'transition-shadow duration-500',
        'hover:shadow-[14px_14px_40px_rgba(0,0,0,0.22),0_0_0_1px_rgba(180,142,146,0.45)]',
        className,
      )}
    >
      {/* Vertical (3:4) cover photo — desaturates on hover. */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEEEC]">
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="stone-image h-full w-full object-cover"
        />
        {/* Soft limestone gradient at the bottom so name/location stay legible. */}
        <div className="absolute inset-0 hero-overlay-stone pointer-events-none" />

        {/* Rose / Juniper availability badge — top-start, chiseled corners. */}
        {badge && (
          <span
            className={cn(
              'absolute top-3 start-3 inline-flex items-center gap-1.5',
              'px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-chiseled',
              'shadow-[4px_4px_10px_rgba(0,0,0,0.18)]',
              badgeClasses,
            )}
          >
            <Mountain size={11} strokeWidth={2.25} />
            {badge}
          </span>
        )}

        {/* Title overlay — Obsidian on the limestone fade. */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#1B1B1B] tracking-stone uppercase truncate">
            {name}
          </h3>
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-chiseled text-[#1B1B1B]/65">
              <MapPin size={11} className="icon-rose" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
      </div>

      {/* Card body — soft limestone surface with the amenity row + CTA. */}
      <div className="p-4 sm:p-5 space-y-4 bg-[#EFEEEC]">
        {amenities.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {amenities.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-chiseled text-[#1B1B1B]/75"
              >
                <a.icon size={14} className="icon-rose shrink-0" />
                {a.label}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-end justify-between gap-3 pt-3 border-t border-[#1B1B1B]/10">
          <div>
            <p className="text-[9px] uppercase tracking-chiseled text-[#1B1B1B]/55">From</p>
            <p className="mt-0.5">
              <span className="font-display text-2xl font-bold text-[#4B5320]">
                {pricePerNight}
              </span>
              <span className="ms-1.5 text-[10px] font-bold uppercase tracking-chiseled text-[#1B1B1B]/70">
                {currency}
              </span>
              <span className="ms-2 text-[10px] text-[#1B1B1B]/55">/ {perLabel}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onSelect}
            className="group/btn inline-flex items-center gap-2
                       rounded-[8px] bg-[#4B5320] text-[#F9F9F9]
                       px-4 py-2.5 text-[10px] font-bold uppercase tracking-chiseled
                       shadow-[6px_6px_14px_rgba(0,0,0,0.18)]
                       hover:bg-[#3A4019]
                       hover:shadow-[0_0_18px_rgba(180,142,146,0.55),6px_6px_14px_rgba(0,0,0,0.20)]
                       transition-all duration-500 active:scale-95"
          >
            {ctaLabel}
            <ArrowUpRight
              size={13}
              className="transition-transform duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
