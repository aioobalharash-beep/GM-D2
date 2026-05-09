import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Calendar as CalendarIcon, LogIn, LogOut, ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { PropertyToggle } from './PropertyToggle';
import { Footer } from './Footer';
import { getClientConfig } from '../config/clientConfig';

export const ClientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { t } = useTranslation();
  const config = getClientConfig();

  const navItems = [
    { path: '/', labelKey: 'nav.home', icon: Home },
    { path: '/booking', labelKey: 'nav.bookings', icon: CalendarIcon },
    { path: '/testimonials', labelKey: 'nav.reviews', icon: Star },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    // `data-theme="onyx"` scopes the dark canvas + heading colors so the
    // admin portal (which keeps the brand-navy palette) is unaffected.
    <div data-theme="onyx" className="min-h-screen bg-[#121212] text-[#A0A0A0] flex flex-col">
      {/* Onyx Header — translucent matte-black glass with a hairline
          divider; the wordmark uses architectural tracking for a watch-brand
          feel. The brand lockup is allowed to shrink so the property toggle
          never overflows. */}
      <header
        className="fixed top-0 w-full z-50 h-16 px-3 sm:px-6 flex items-center justify-between gap-2
                   bg-[#121212]/75 backdrop-blur-xl
                   border-b border-white/[0.08]
                   shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
      >
        <Link
          to="/"
          aria-label={config.chaletName}
          className="flex items-center gap-3 min-w-0 shrink group"
        >
          {config.logoPath && (
            <img
              src={config.logoPath}
              alt=""
              className="h-9 w-9 rounded-md object-contain bg-white/5 ring-1 ring-white/10 p-0.5 shrink-0
                         transition-shadow duration-500 group-hover:shadow-[0_0_18px_rgba(255,191,0,0.35)]"
              onError={(e) => { (e.currentTarget.style.display = 'none'); }}
            />
          )}
          <span
            className="hidden md:inline font-display text-lg font-extrabold uppercase truncate
                       text-white tracking-architectural
                       transition-colors duration-500 group-hover:text-[#FFBF00]"
          >
            {t('common.alMalak')}
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* High-end segmented control — sliding amber background. */}
          <PropertyToggle variant="onyx" />
          <LanguageToggle />
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-full text-[#A0A0A0] hover:text-[#FFBF00] hover:bg-white/5 transition-colors duration-500"
              title={t('nav.adminPortal')}
              aria-label={t('nav.adminPortal')}
            >
              <ShieldCheck size={20} />
            </button>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-xl
                         text-[#A0A0A0] hover:text-white hover:bg-white/5
                         transition-colors duration-500 text-xs font-bold uppercase tracking-architectural"
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-xl
                         bg-[#FFBF00] text-black text-xs font-bold uppercase tracking-architectural
                         amber-glow hover:bg-[#FFD15C] hover:shadow-[0_0_28px_rgba(255,191,0,0.55)]
                         transition-all duration-500 active:scale-[0.97]"
              title={t('nav.login')}
              aria-label={t('nav.login')}
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">{t('nav.login')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-32 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* Onyx Bottom Nav — layered surface, amber active state with glow. */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 flex justify-around items-center h-20 pb-safe px-12
                   bg-[#1D1D1D]/90 backdrop-blur-xl
                   border-t border-white/[0.08]
                   shadow-[0_-10px_40px_rgba(0,0,0,0.6)]
                   rounded-t-[20px]"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-500',
                active ? 'text-[#FFBF00] scale-110' : 'text-[#6B6B6B] hover:text-[#A0A0A0]',
              )}
            >
              <item.icon
                size={24}
                fill={active ? 'currentColor' : 'none'}
                className={active ? 'drop-shadow-[0_0_8px_rgba(255,191,0,0.55)]' : ''}
              />
              <span className="text-[11px] font-bold uppercase tracking-architectural mt-1">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
