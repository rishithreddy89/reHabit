import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, LogOut, Map } from 'lucide-react';
import ProgressMapContainer from '@/components/progress-map/ProgressMapContainer_v2';
import { Button } from '@/components/ui/button';

// props:
// - items: [{ path, label }]
// - brandHref: string
// - onLogout?: () => void
// - cta?: { label: string, href?: string, onClick?: () => void }
const TopNavbar = ({ items = [], brandHref = '/', cta, onLogout, user }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState(null);
  const [showProgressMap, setShowProgressMap] = useState(false);

  useEffect(() => {
    if (!navRef.current) return;
    const activeIndex = items.findIndex((item) => location.pathname === item.path);
    if (activeIndex === -1) {
      setHighlightStyle(null);
      return;
    }
    const navLinks = navRef.current.querySelectorAll('.nav-link');
    const activeLink = navLinks[activeIndex];
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setHighlightStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [location.pathname, items]);

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
          <div className="flex h-14 items-center justify-between rounded-full border border-emerald-400/30 bg-gradient-to-br from-emerald-500 to-teal-600 px-3 backdrop-blur">
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
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600">
                  <Zap className="h-5 w-5" />
                </span>
                <span className="text-lg font-semibold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Rehabit
                </span>
              </Link>
            </div>

            {/* Center: Nav links (Desktop only) */}
            <nav ref={navRef} className="hidden md:flex items-center gap-2 text-sm text-white/90 relative">
              {highlightStyle && (
                <span
                  className="absolute top-0 h-full bg-white rounded-full transition-all duration-500"
                  style={{ 
                    left: highlightStyle.left, 
                    width: highlightStyle.width, 
                    zIndex: 0 
                  }}
                />
              )}
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link relative rounded-full px-3 py-2 transition-colors ${
                    isActive(item.path) ? 'text-emerald-600 font-medium' : 'hover:text-white'
                  }`}
                  style={{ zIndex: 1 }}
                >
                  <span className="relative z-10">{item.label}</span>
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
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600">
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
              {/* Progress Map quick access (mobile only) */}
              <button
                onClick={() => setShowProgressMap(true)}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg,#34d399,#10b981)',
                  boxShadow: '0 8px 20px rgba(16,185,129,0.35)'
                }}
              >
                <span className="inline-flex items-center gap-2"><Map className="h-5 w-5" /> Progress Map</span>
              </button>
              {items.map((item) => {
                // Remove AI Chat from mobile drawer; will be accessed via floating button
                if (item.label === 'AI Chat') return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`relative rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center gap-3 overflow-hidden ${
                      isActive(item.path) ? 'text-emerald-600 bg-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    style={{ zIndex: 1 }}
                  >
                    {Icon ? <Icon className="h-5 w-5 flex-shrink-0 relative z-10" /> : null}
                    <span className="relative z-10">{item.label}</span>
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

      {/* Mobile Progress Map Overlay */}
      {showProgressMap && (
        <div
          className="md:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowProgressMap(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              margin: '12px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
            }}
          >
            <ProgressMapContainer 
              onClose={() => setShowProgressMap(false)} 
              user={user} 
              currentUserId={user?._id}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
