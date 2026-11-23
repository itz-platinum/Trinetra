import React from 'react';

export interface PublicProfileLayoutProps {
  children: React.ReactNode;
}

/**
 * Dedicated minimal layout for shareable public payment profiles (/u/:username).
 * Strips all dashboard sidebars, top navigation bars, and marketing footers so
 * visitors focus strictly on the recipient's identity card and UPI connections.
 */
export const PublicProfileLayout: React.FC<PublicProfileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-transparent bg-precision-dots text-[#F5F8FC] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <main className="w-full max-w-md mx-auto my-auto">{children}</main>
      <p className="mt-6 text-center text-[11px] font-mono text-[#64748B] tracking-wide">
        Direct UPI intent · TRINETRA never handles funds or PINs
      </p>
    </div>
  );
};
