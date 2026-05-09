import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, Mountain, Users, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface BookingModalSubmitPayload {
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
}

export interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: BookingModalSubmitPayload) => void | Promise<void>;
  /** Property name shown in the header. */
  propertyName?: string;
  /** Subtitle / location line — e.g. "Jabal Akhdar, Oman". */
  location?: string;
  /** Display price for the header — e.g. "From 280 OMR / night". */
  priceLine?: string;
  /** Initial values, useful when re-opening the modal. */
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  /** Optional max guests — caps the +/- stepper. */
  maxGuests?: number;
  /** Optional min stay-night count (default 1). */
  minNights?: number;
  /** Optional submit-button label. */
  submitLabel?: string;
}

const todayISO = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

/**
 * Stone & Rose Mist-Effect Booking Modal.
 * - Backdrop: blur(15px) grayscale(20%) — feels like a cloud passing over rock.
 * - Surface: misted off-white sheet with chiseled 8px corners + heavy shadow.
 * - ESC + click-outside to close. Body scroll locked while open.
 *
 * React 19 / Vite compatible — uses createPortal into document.body, motion/react
 * for the entrance animation, and lucide-react for icons.
 */
export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  onSubmit,
  propertyName = 'Mountain Estate',
  location = 'Jabal Akhdar, Oman',
  priceLine,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 2,
  maxGuests = 12,
  minNights = 1,
  submitLabel = 'Reserve',
}) => {
  const [checkIn, setCheckIn] = useState(defaultCheckIn || todayISO(1));
  const [checkOut, setCheckOut] = useState(defaultCheckOut || todayISO(1 + minNights));
  const [guests, setGuests] = useState(defaultGuests);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll + bind ESC while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Auto-bump check-out forward when check-in passes it. Avoids invalid state.
  useEffect(() => {
    if (!checkIn || !checkOut) return;
    if (new Date(checkOut) <= new Date(checkIn)) {
      const ci = new Date(checkIn);
      ci.setDate(ci.getDate() + minNights);
      setCheckOut(ci.toISOString().slice(0, 10));
    }
  }, [checkIn, checkOut, minNights]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!checkIn || !checkOut) {
      setError('Please choose both check-in and check-out dates.');
      return;
    }
    if (nights < minNights) {
      setError(`Minimum stay is ${minNights} night${minNights === 1 ? '' : 's'}.`);
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit?.({ checkIn, checkOut, guests });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="booking-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby="booking-modal-title"
        >
          {/* Mist backdrop — blur(15px) grayscale(20%) per spec. */}
          <button
            type="button"
            aria-label="Close booking"
            onClick={onClose}
            className="absolute inset-0 mist-backdrop cursor-default"
          />

          {/* Modal sheet — misted limestone with chiseled edges. */}
          <motion.div
            ref={sheetRef}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'relative w-full max-w-md mist-surface',
              'p-6 sm:p-8',
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-chiseled text-[#B48E92]">
                  <Mountain size={12} strokeWidth={2.25} />
                  {location}
                </span>
                <h2
                  id="booking-modal-title"
                  className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase tracking-stone text-[#1B1B1B] truncate"
                >
                  {propertyName}
                </h2>
                {priceLine && (
                  <p className="mt-1 text-xs text-[#1B1B1B]/65">{priceLine}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-[8px] text-[#1B1B1B]/60 hover:text-[#1B1B1B] hover:bg-[#B48E92]/15 transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Dates — two side-by-side fields. */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-chiseled text-[#4B5320] mb-1.5">
                    Check-in
                  </span>
                  <div className="relative">
                    <CalendarDays
                      size={14}
                      className="absolute start-3 top-1/2 -translate-y-1/2 icon-juniper pointer-events-none"
                    />
                    <input
                      type="date"
                      value={checkIn}
                      min={todayISO(0)}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-white border border-[#1B1B1B]/10 rounded-[8px]
                                 ps-9 pe-3 py-3 text-sm text-[#1B1B1B]
                                 focus:outline-none focus:border-[#4B5320]
                                 focus:shadow-[0_0_14px_rgba(180,142,146,0.45)]
                                 transition-shadow duration-300"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-chiseled text-[#4B5320] mb-1.5">
                    Check-out
                  </span>
                  <div className="relative">
                    <CalendarDays
                      size={14}
                      className="absolute start-3 top-1/2 -translate-y-1/2 icon-juniper pointer-events-none"
                    />
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || todayISO(1)}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-white border border-[#1B1B1B]/10 rounded-[8px]
                                 ps-9 pe-3 py-3 text-sm text-[#1B1B1B]
                                 focus:outline-none focus:border-[#4B5320]
                                 focus:shadow-[0_0_14px_rgba(180,142,146,0.45)]
                                 transition-shadow duration-300"
                    />
                  </div>
                </label>
              </div>

              {/* Guests stepper. */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-chiseled text-[#4B5320] mb-1.5">
                  Guests
                </span>
                <div className="flex items-center justify-between bg-white border border-[#1B1B1B]/10 rounded-[8px] px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-[#1B1B1B]">
                    <Users size={14} className="icon-rose" />
                    {guests} {guests === 1 ? 'guest' : 'guests'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                      aria-label="Decrease guests"
                      className="w-8 h-8 rounded-[6px] border border-[#1B1B1B]/15 text-[#1B1B1B]
                                 hover:bg-[#B48E92]/15 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors active:scale-95"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                      disabled={guests >= maxGuests}
                      aria-label="Increase guests"
                      className="w-8 h-8 rounded-[6px] border border-[#1B1B1B]/15 text-[#1B1B1B]
                                 hover:bg-[#B48E92]/15 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Stay summary — Juniper-tinted strip. */}
              <div className="flex items-center justify-between rounded-[8px] bg-[#4B5320]/10 border border-[#4B5320]/20 px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-chiseled text-[#4B5320]">
                  {nights} night{nights === 1 ? '' : 's'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-chiseled text-[#1B1B1B]/65">
                  {checkIn} → {checkOut}
                </span>
              </div>

              {error && (
                <p className="text-xs font-medium text-[#8A1F1F]">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2
                           rounded-[8px] bg-[#4B5320] text-[#F9F9F9]
                           px-5 py-3.5 text-xs font-bold uppercase tracking-chiseled
                           shadow-[6px_6px_14px_rgba(0,0,0,0.18)]
                           hover:bg-[#3A4019]
                           hover:shadow-[0_0_18px_rgba(180,142,146,0.55),6px_6px_14px_rgba(0,0,0,0.20)]
                           transition-all duration-500 active:scale-95
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Reserving…' : submitLabel}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
