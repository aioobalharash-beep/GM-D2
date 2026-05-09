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
    // `data-theme="stone"` scopes the limestone canvas + Stone & Rose
    // re-mappings to the entire guest tree. The admin portal omits the
    // attribute and keeps the brand-navy palette.
    <div data-theme="stone" className="min-h-screen bg-[#E5E4E2] text-[#1B1B1B] flex flex-col">
      {/* Stone & Rose Header — limestone bar with a hewn slate edge.
          Sticky so the wordmark + recessed property toggle ride alongside
          the page. The brand lockup shrinks so the toggle never overflows. */}
      <header
        className="fixed top-0 w-full z-50 h-16 px-3 sm:px-6 flex items-center justify-between gap-2
                   bg-[#E5E4E2]/92 backdrop-blur-md
                   border-b border-[#1B1B1B]/10
                   shadow-[0_10px_25px_rgba(0,0,0,0.10)]"
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
              className="h-9 w-9 rounded-[6px] object-contain bg-white p-0.5 shrink-0
                         border border-[#1B1B1B]/10
                         shadow-[4px_4px_10px_rgba(0,0,0,0.10)]
                         transition-shadow duration-500
                         group-hover:shadow-[0_0_18px_rgba(180,142,146,0.55)]"
              onError={(e) => { (e.currentTarget.style.display = 'none'); }}
            />
          )}
          <span
            className="hidden md:inline font-display text-lg font-bold uppercase truncate
                       text-[#1B1B1B] tracking-stone
                       transition-colors duration-500 group-hover:text-[#4B5320]"
          >
            {t('common.alMalak')}
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Recessed-groove segmented control — Juniper active + Rose halo. */}
          <PropertyToggle variant="stone" />
          <LanguageToggle />
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-[8px] text-[#1B1B1B]/55 hover:text-[#4B5320]
                         hover:bg-[#B48E92]/15 transition-colors duration-500 tactile"
              title={t('nav.adminPortal')}
              aria-label={t('nav.adminPortal')}
            >
              <ShieldCheck size={20} />
            </button>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-[8px]
                         text-[#1B1B1B]/70 hover:text-[#1B1B1B] hover:bg-[#B48E92]/15
                         transition-colors duration-500 text-xs font-bold uppercase tracking-chiseled tactile"
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-[8px]
                         bg-[#4B5320] text-[#F9F9F9] text-xs font-bold uppercase tracking-chiseled
                         shadow-[6px_6px_14px_rgba(0,0,0,0.18)]
                         hover:bg-[#3A4019] hover:shadow-[0_0_18px_rgba(180,142,146,0.55),6px_6px_14px_rgba(0,0,0,0.20)]
                         transition-all duration-500 active:scale-95"
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

      {/* Stone & Rose Bottom Nav — Midnight Slate slab with a noise overlay
          mimicking rock texture; active item glows Rose. */}
      <nav
        className="slate-panel fixed bottom-0 inset-x-0 z-50 flex justify-around items-center h-20 pb-safe px-12
                   border-t border-white/10
                   rounded-t-[8px]"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-500 active:scale-95',
                active ? 'text-[#B48E92] scale-110' : 'text-[#F9F9F9]/55 hover:text-[#F9F9F9]',
              )}
            >
              <item.icon
                size={24}
                fill={active ? 'currentColor' : 'none'}
                className={active ? 'drop-shadow-[0_0_8px_rgba(180,142,146,0.65)]' : ''}
              />
              <span className="text-[11px] font-bold uppercase tracking-chiseled mt-1">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
