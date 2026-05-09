import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Instagram, MessageCircle, MapPin, Check } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useTranslation } from 'react-i18next';
import { bl, type BilingualField } from '../utils/bilingual';
import { getClientConfig, whatsappHref } from '../config/clientConfig';
import { useProperty } from '../contexts/PropertyContext';
import { propertyDetailsDocId } from '../services/firestore';

interface DayUseSlotRates {
  sunday_rate?: number;
  monday_rate?: number;
  tuesday_rate?: number;
  wednesday_rate?: number;
  thursday_rate?: number;
  friday_rate?: number;
  saturday_rate?: number;
}

interface PricingSettings {
  sunday_rate?: number;
  monday_rate?: number;
  tuesday_rate?: number;
  wednesday_rate?: number;
  thursday_rate?: number;
  friday_rate?: number;
  saturday_rate?: number;
  day_use_rate?: number;
  weekday_rate?: number;
  event_rate?: number;
  day_use_slots?: DayUseSlotRates[];
  special_dates?: { date: string; day_use_price?: number; night_stay_price?: number; price?: number }[];
  discount?: { enabled: boolean; type: 'percent' | 'flat'; value: number; start_date: string; end_date: string };
}

const getMinPrice = (pricing: PricingSettings | undefined, fallback: number): number => {
  if (!pricing) return fallback;
  const nightRates = [
    pricing.sunday_rate, pricing.monday_rate, pricing.tuesday_rate,
    pricing.wednesday_rate, pricing.thursday_rate, pricing.friday_rate,
    pricing.saturday_rate,
    pricing.weekday_rate, // legacy
  ];
  const slotRates = (pricing.day_use_slots || []).flatMap(slot => [
    slot.sunday_rate, slot.monday_rate, slot.tuesday_rate,
    slot.wednesday_rate, slot.thursday_rate, slot.friday_rate, slot.saturday_rate,
  ]);
  const specialPrices = (pricing.special_dates || []).flatMap(s => [s.day_use_price, s.night_stay_price, s.price]);
  const allRates = [
    ...nightRates,
    pricing.day_use_rate,
    ...slotRates,
    pricing.event_rate,
    ...specialPrices,
  ].filter((r): r is number => typeof r === 'number' && r > 0);

  if (allRates.length === 0) return fallback;
  let minRate = Math.min(...allRates);
  if (pricing.discount?.enabled && pricing.discount.value > 0) {
    if (pricing.discount.type === 'percent') {
      minRate = Math.round(minRate * (1 - pricing.discount.value / 100));
    } else {
      minRate = Math.max(0, minRate - pricing.discount.value);
    }
  }
  return minRate;
};

interface FeatureItem {
  en: string;
  ar: string;
}

interface FeatureSection {
  titleEn: string;
  titleAr: string;
  items: FeatureItem[];
}

interface PropertyDetails {
  name: string | BilingualField;
  capacity: number;
  area_sqm: number;
  nightly_rate: number;
  headline: string | BilingualField;
  description: string | BilingualField;
  featureSections: FeatureSection[];
  gallery: { url: string; label: string }[];
  amenities?: string[];
  pricing?: PricingSettings;
  footerText?: string | BilingualField;
  whatsappNumber?: string;
  licenseNumber?: string;
}

const DEFAULTS: PropertyDetails = {
  name: 'Gilan & Milan Chalet',
  capacity: 12,
  area_sqm: 850,
  nightly_rate: 120,
  headline: 'Curated Excellence',
  description: 'A curated retreat in the heart of the Omani landscape — modern comfort, heritage-inspired design.',
  featureSections: [],
  gallery: [
    { url: 'https://picsum.photos/seed/oman-bedroom-1/800/1000', label: 'Master Suite: Serene Sands' },
    { url: 'https://picsum.photos/seed/oman-bedroom-2/800/1000', label: 'Guest Wing: Golden Hour' },
    { url: 'https://picsum.photos/seed/oman-kitchen/800/1000', label: 'Culinary Studio' },
  ],
  amenities: [],
};

interface FooterProps {
  chaletName: string;
  footerText: string;
  whatsappNumber: string;
  licenseNumber: string;
  termsLabel: string;
  aboutLabel: string;
  onTerms: () => void;
  onAbout: () => void;
}

const Footer = React.memo<FooterProps>(({ chaletName, footerText, whatsappNumber, licenseNumber, termsLabel, aboutLabel, onTerms, onAbout }) => {
  const { t } = useTranslation();
  const config = getClientConfig();
  const waHref = whatsappHref(config.social.whatsapp) || whatsappHref(whatsappNumber);
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-12 px-8 bg-white border-t border-primary-navy/5 flex flex-col items-center gap-6">
      <div className="text-secondary-gold font-bold font-headline text-xl">{chaletName}</div>
      {footerText ? (
        <p className="text-xs text-center text-primary-navy/60 leading-relaxed max-w-xs whitespace-pre-line">
          {footerText}
        </p>
      ) : (
        <p className="text-xs text-center text-primary-navy/60 leading-relaxed max-w-xs">
          &copy; {year} {chaletName}
        </p>
      )}
      {licenseNumber && (
        <div className="text-[10px] text-primary-navy/30 uppercase font-bold tracking-widest text-center">
          {t('sanctuary.tourismLicense')}: {licenseNumber}
        </div>
      )}
      <div className="flex gap-6 items-center">
        <button onClick={onTerms} className="text-xs text-primary-navy/60 underline font-bold">{termsLabel}</button>
        <button onClick={onAbout} className="text-xs text-primary-navy/60 underline font-bold">{aboutLabel}</button>
      </div>
      <div className="flex gap-6 mt-2 items-center">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex items-center gap-2 text-primary-navy/60 hover:text-secondary-gold transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-bold">WhatsApp</span>
          </a>
        )}
        <a
          href={config.social.instagram || 'https://www.instagram.com/'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="flex items-center gap-2 text-primary-navy/60 hover:text-secondary-gold transition-colors"
        >
          <Instagram size={20} />
          <span className="text-xs font-bold">Instagram</span>
        </a>
        <a
          href={getClientConfig().location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Location"
          className="flex items-center gap-2 text-primary-navy/60 hover:text-secondary-gold transition-colors"
        >
          <MapPin size={20} />
          <span className="text-xs font-bold">
            <span dir="rtl" lang="ar">الموقع</span>
            <span className="mx-1 text-secondary-gold/70" aria-hidden="true">|</span>
            <span dir="ltr" lang="en">Location</span>
          </span>
        </a>
      </div>
      {footerText && (
        <p className="text-[10px] text-center text-primary-navy/40 font-bold">
          &copy; {year} {chaletName}
        </p>
      )}
    </footer>
  );
});
Footer.displayName = 'Footer';

export const Sanctuary: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { activeProperty, activePropertyId, loading: propertyLoading } = useProperty();
  const [data, setData] = useState<PropertyDetails>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // When the active property changes we re-subscribe to its per-property
  // settings doc and seed the view with the matching property record so the
  // gallery/amenities/name swap instantly even before the settings doc loads.
  useEffect(() => {
    if (!activePropertyId) {
      // No property yet — keep showing defaults but stop the spinner once the
      // property list itself has finished loading.
      if (!propertyLoading) setLoading(false);
      return;
    }
    setLoading(true);

    // Seed from the property record (toggle-facing fields).
    const seed: Partial<PropertyDetails> = activeProperty ? {
      name: activeProperty.name as PropertyDetails['name'],
      capacity: activeProperty.capacity,
      area_sqm: activeProperty.area_sqm,
      nightly_rate: activeProperty.nightly_rate,
      description: activeProperty.description || '',
      gallery: (activeProperty.images || []).map(img => ({ url: img.url, label: img.label || '' })),
      amenities: activeProperty.amenities || [],
    } : {};

    setData({ ...DEFAULTS, ...seed } as PropertyDetails);

    const unsubscribe = onSnapshot(
      doc(db, 'settings', propertyDetailsDocId(activePropertyId)),
      (snap) => {
        if (snap.exists()) {
          // Per-property settings doc wins (gallery/pricing/about/etc.).
          setData(prev => ({ ...DEFAULTS, ...seed, ...prev, ...(snap.data() as PropertyDetails) }));
          setLoading(false);
        } else {
          // No per-property doc yet — fall back once to legacy single doc so
          // existing deployments with one chalet keep working.
          getDoc(doc(db, 'settings', 'property_details'))
            .then(legacy => {
              if (legacy.exists()) {
                setData(prev => ({ ...DEFAULTS, ...seed, ...prev, ...(legacy.data() as PropertyDetails) }));
              }
            })
            .catch(() => undefined)
            .finally(() => setLoading(false));
        }
      },
      (error) => {
        console.error('Property details listener error:', error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
    // We intentionally depend on the id, not the full record, so we don't
    // re-subscribe on unrelated property record changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePropertyId]);

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse bg-[#121212] min-h-screen">
        <div className="px-6 mt-8 space-y-4">
          <div className="h-4 bg-white/[0.06] rounded w-32" />
          <div className="h-8 bg-white/[0.06] rounded w-64" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-none w-[85vw] md:w-[600px]">
                <div className="aspect-[4/5] md:aspect-video rounded-[20px] bg-white/[0.04]" />
                <div className="mt-3 h-3.5 bg-white/[0.06] rounded w-40 mx-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 space-y-3">
          <div className="h-6 bg-white/[0.06] rounded w-48" />
          <div className="h-4 bg-white/[0.06] rounded w-full" />
          <div className="h-4 bg-white/[0.06] rounded w-3/4" />
        </div>
        <div className="px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-full glass-card p-6 space-y-4">
              <div className="h-5 bg-white/[0.06] rounded w-24" />
              <div className="space-y-2.5">
                <div className="h-4 bg-white/[0.06] rounded w-full" />
                <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                <div className="h-4 bg-white/[0.06] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const heroImage = data.gallery?.[0]?.url;
  const heroPrice = getMinPrice(data.pricing, data.nightly_rate);

  return (
    <div className="space-y-14 pb-16 bg-[#121212]">
      {/* Hero — full-bleed immersive image with a dark gradient overlay so
          the white headline pops. Re-mounts on property switch for a clean
          visual transition. */}
      <motion.section
        key={activePropertyId || 'default'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full h-[72vh] min-h-[480px] overflow-hidden"
      >
        {heroImage && (
          <OptimizedImage
            src={heroImage}
            alt={bl(data.name, lang) as string}
            className="absolute inset-0 w-full h-full"
          />
        )}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 max-w-5xl mx-auto">
          <span className="text-[#FFBF00] font-bold tracking-architectural text-[10px] uppercase block mb-3 drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]">
            {t('sanctuary.estatePreview')}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-architectural leading-tight">
            {bl(data.name, lang)}
          </h2>
          <p className="mt-4 max-w-2xl text-[#A0A0A0] text-sm sm:text-base leading-relaxed">
            {bl(data.description, lang)}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 rounded-full
                         bg-[#FFBF00] text-black px-7 py-3
                         text-xs font-extrabold uppercase tracking-architectural
                         amber-glow hover:bg-[#FFD15C] hover:shadow-[0_0_36px_rgba(255,191,0,0.55)]
                         transition-all duration-500 active:scale-[0.97]"
            >
              <CalendarIcon size={16} />
              {t('sanctuary.bookNow')}
            </button>
            <span className="text-xs uppercase tracking-architectural text-[#A0A0A0]">
              {t('sanctuary.from')}{' '}
              <span className="text-[#FFBF00] font-bold">{heroPrice} {t('common.omr')}</span>{' '}
              {t('common.perNight')}
            </span>
          </div>
        </div>
      </motion.section>

      {/* Gallery strip — dark cards with subtle white borders. */}
      <section className="px-6 max-w-6xl mx-auto">
        <h3 className="font-display text-sm font-bold uppercase tracking-architectural text-[#A0A0A0] mb-4">
          {bl(data.headline, lang)}
        </h3>
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-2">
          {data.gallery.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="flex-none w-[85vw] md:w-[560px] snap-center glass-card overflow-hidden"
            >
              <OptimizedImage
                src={img.url}
                alt={img.label || ''}
                className="aspect-[4/5] md:aspect-video"
              />
              {img.label && img.label.trim() !== '' && (
                <p className="px-5 py-3 font-bold text-white text-xs uppercase tracking-architectural">
                  {img.label}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {data.amenities && data.amenities.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {data.amenities.map((a, i) => (
              <span
                key={`${activePropertyId}-amenity-${i}`}
                className="inline-flex items-center gap-2 rounded-full
                           bg-white/[0.04] border border-white/[0.08]
                           text-[#A0A0A0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-architectural"
              >
                <Check size={12} className="icon-amber" />
                {a}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Resort Guide — glassmorphic dark feature tiles, amber icons. */}
      {data.featureSections && data.featureSections.length > 0 && (
        <section className="px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {data.featureSections.map((section, i) => {
              const title = lang === 'ar' ? (section.titleAr || section.titleEn) : (section.titleEn || section.titleAr);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className="h-full glass-card p-6 transition-shadow duration-500
                             hover:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,191,0,0.18)]"
                >
                  <h4 className="font-display text-sm font-extrabold uppercase tracking-architectural text-[#FFBF00] mb-4">
                    {title}
                  </h4>
                  <ul className="space-y-3">
                    {section.items.map((item, j) => {
                      const label = lang === 'ar' ? (item.ar || item.en) : (item.en || item.ar);
                      return (
                        <li key={j} className="flex items-start gap-3">
                          <Check size={14} strokeWidth={2.5} className="icon-amber shrink-0 mt-[5px]" />
                          <span className="text-sm font-medium text-[#A0A0A0] leading-relaxed">
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer Info */}
      <Footer
        chaletName={bl(data.name, lang)}
        footerText={data.footerText ? bl(data.footerText, lang) : ''}
        whatsappNumber={data.whatsappNumber || ''}
        licenseNumber={data.licenseNumber || ''}
        termsLabel={t('sanctuary.termsOfStay')}
        aboutLabel={t('sanctuary.aboutUs')}
        onTerms={() => navigate('/terms')}
        onAbout={() => navigate('/about')}
      />

      {/* Floating Book Now — amber pill with constant glow. */}
      <button
        onClick={() => navigate('/booking')}
        className="fixed bottom-[104px] end-[24px] z-[60] flex items-center gap-2
                   bg-[#FFBF00] text-black px-6 py-3.5 rounded-[20px]
                   amber-glow-lg hover:bg-[#FFD15C]
                   transition-transform duration-500 hover:scale-105 active:scale-95"
      >
        <CalendarIcon size={20} />
        <span className="font-extrabold text-xs uppercase tracking-architectural">{t('sanctuary.bookNow')}</span>
      </button>
    </div>
  );
};
