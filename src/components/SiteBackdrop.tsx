import React, { useState } from 'react';

const SITE_BACKGROUND_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTClDxL-qYSfVLHU3fA-h1ed00hzOs3tEbCZG_IWnzvWw&s=10';

export const SiteBackdrop: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#080C14]"
    >
      {!imageError && (
        <img
          src={SITE_BACKGROUND_URL}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center opacity-45 scale-105 select-none"
        />
      )}
      {/* Measured contrast scrim so text and controls stay crisp across every route */}
      <div className="absolute inset-0 bg-[#080C14]/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C14]/75 via-[#080C14]/35 to-[#080C14]/90" />
    </div>
  );
};
