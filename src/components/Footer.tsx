import React from 'react';
import { Link } from 'react-router-dom';
import { TrinetraLogo } from './TrinetraLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080C14]/78 backdrop-blur-md border-t border-[rgba(145,162,184,0.14)] py-14 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[rgba(145,162,184,0.1)]">
        <div className="space-y-3.5">
          <Link to="/" className="inline-block">
            <TrinetraLogo size={26} withWordmark />
          </Link>
          <p className="text-xs text-[#91A2B8] leading-relaxed max-w-xs">
            One Identity. Every Payment Connection. Personal UPI identity and payment routing without custody or intermediaries.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-3.5">
            Product
          </h4>
          <ul className="space-y-2.5 text-sm text-[#91A2B8]">
            <li>
              <a href="/#how-it-works" className="hover:text-[#F5F8FC] transition-colors">
                How it works
              </a>
            </li>
            <li>
              <a href="/#showcase" className="hover:text-[#F5F8FC] transition-colors">
                Product preview
              </a>
            </li>
            <li>
              <Link to="/u/aarav" className="hover:text-[#F5F8FC] transition-colors">
                Live demo profile
              </Link>
            </li>
            <li>
              <Link to="/design-system" className="hover:text-[#F5F8FC] transition-colors">
                Design system
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-3.5">
            Security & Legal
          </h4>
          <ul className="space-y-2.5 text-sm text-[#91A2B8]">
            <li>
              <a href="/#security" className="hover:text-[#F5F8FC] transition-colors">
                Security model
              </a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-[#F5F8FC] transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#F5F8FC] transition-colors">
                Privacy notice
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-[#F5F8FC] transition-colors">
                Account access
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-3.5">
            Contact
          </h4>
          <p className="text-sm text-[#91A2B8] leading-relaxed">
            Questions about personal UPI identity or integration support?
          </p>
          <p className="text-sm font-mono text-[#25C9F2] mt-2.5">support@trinetra.me</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#64748B]">
        <p>© {new Date().getFullYear()} TRINETRA. All rights reserved.</p>
        <p>TRINETRA initiates standard UPI payment links and does not hold, transfer, or settle funds.</p>
      </div>
    </footer>
  );
};
