import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { TrinetraLogo } from './TrinetraLogo';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#080C14]/75 backdrop-blur-md border-b border-[rgba(145,162,184,0.14)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand mark */}
        <Link to="/" className="shrink-0 focus-visible:outline-none">
          <TrinetraLogo size={28} withWordmark />
        </Link>

        {/* Zone 2: Concise single-line links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-[#91A2B8]">
          <a href="/#showcase" className="hover:text-[#F5F8FC] transition-colors whitespace-nowrap shrink-0">
            Product
          </a>
          <a href="/#how-it-works" className="hover:text-[#F5F8FC] transition-colors whitespace-nowrap shrink-0">
            How it works
          </a>
          <a href="/#security" className="hover:text-[#F5F8FC] transition-colors whitespace-nowrap shrink-0">
            Security
          </a>
          <Link to="/design-system" className="hover:text-[#F5F8FC] transition-colors whitespace-nowrap shrink-0">
            Design System
          </Link>
        </nav>

        {/* Zone 3: Actions */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <Button
              size="sm"
              onClick={() => navigate('/dashboard')}
              leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#91A2B8] hover:text-[#F5F8FC] transition-colors whitespace-nowrap shrink-0 px-2 py-1.5"
              >
                Sign in
              </Link>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Create profile
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg border border-[rgba(145,162,184,0.18)] bg-[#0D1422] text-[#F5F8FC] cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(145,162,184,0.12)] bg-[#080C14] px-6 py-5 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#91A2B8]">
            <a href="/#showcase" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F5F8FC]">
              Product
            </a>
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F5F8FC]">
              How it works
            </a>
            <a href="/#security" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F5F8FC]">
              Security
            </a>
            <Link to="/design-system" onClick={() => setMobileOpen(false)} className="py-1.5 hover:text-[#F5F8FC]">
              Design System
            </Link>
          </nav>
          <div className="pt-3 border-t border-[rgba(145,162,184,0.12)] flex flex-col gap-2.5">
            {user ? (
              <Button className="w-full" onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}>
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button variant="secondary" className="w-full" onClick={() => { setMobileOpen(false); navigate('/login'); }}>
                  Sign in
                </Button>
                <Button className="w-full" onClick={() => { setMobileOpen(false); navigate('/register'); }}>
                  Create your profile
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
