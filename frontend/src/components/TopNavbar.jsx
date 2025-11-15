import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';

// props:
// - items: [{ path, label }]
// - brandHref: string
// - onLogout?: () => void
// - cta?: { label: string, href?: string, onClick?: () => void }
const TopNavbar = ({ items = [], brandHref = '/', cta, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const renderCTA = () => {
    if (cta?.onClick) {
      return (
        <button
          onClick={cta.onClick}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          {cta.label}
        </button>
      );
    }
    if (cta?.href) {
      return (
        <Link
          to={cta.href}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          {cta.label}
        </Link>
      );
    }
    if (onLogout) {
      return (
        <button
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Logout
        </button>
      );
    }
    return null;
  };

  return (
    <div className="sticky top-0 z-40 w-full px-4 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex h-14 items-center justify-between rounded-full border border-slate-200/70 bg-white/80 px-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
          {/* Left: Brand */}
          <Link to={brandHref} className="flex items-center gap-2 px-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Zap className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900" style={{ fontFamily: 'Space Grotesk' }}>
              Rehabit
            </span>
          </Link>

          {/* Center: Nav links */}
          <nav className="hidden md:flex items-center gap-2 text-sm text-slate-700">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-3 py-2 transition-colors hover:text-slate-900 ${
                  isActive(item.path) ? 'bg-slate-900 text-white' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: CTA */}
          <div className="pl-2">{renderCTA()}</div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
