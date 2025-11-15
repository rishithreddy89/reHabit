import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// props:
// - items: [{ path, label }]
// - brandHref: string
// - onLogout?: () => void
// - cta?: { label: string, href?: string, onClick?: () => void }
const TopNavbar = ({ items = [], brandHref = '/', cta, onLogout }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <div className="sticky top-0 z-40 w-full px-4 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex h-14 items-center justify-between rounded-full border border-slate-200/70 bg-white/80 px-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
            {/* Left: Hamburger Menu (Mobile) + Brand */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 rounded-full"
                onClick={() => setIsOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* Brand */}
              <Link to={brandHref} className="flex items-center gap-2 px-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Zap className="h-5 w-5" />
                </span>
                <span className="text-lg font-semibold tracking-tight text-slate-900" style={{ fontFamily: 'Space Grotesk' }}>
                  Rehabit
                </span>
              </Link>
            </div>

            {/* Center: Nav links (Desktop only) */}
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

            {/* Right: CTA (Desktop only) */}
            <div className="hidden md:block pl-2">{renderCTA()}</div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Panel */}
          <div className="absolute left-0 top-0 h-full w-[280px] sm:w-[320px] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Zap className="h-5 w-5" />
                </span>
                <span
                  className="text-lg font-semibold tracking-tight text-slate-900"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  Rehabit
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 flex flex-col gap-2 overflow-y-auto">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-100 flex items-center gap-3 ${
                      isActive(item.path)
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'text-slate-700'
                    }`}
                  >
                    {Icon ? <Icon className="h-5 w-5 flex-shrink-0" /> : null}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {onLogout && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="mt-4 rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              )}
              {(cta?.onClick || cta?.href) && (
                <div className="mt-2">{renderCTA()}</div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
