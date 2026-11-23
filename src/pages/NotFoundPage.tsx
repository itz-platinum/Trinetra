import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TrinetraLogo } from '../components/TrinetraLogo';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent bg-precision-grid flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-xl bg-[#0D1422]/85 backdrop-blur-md border border-[rgba(145,162,184,0.18)] p-8 space-y-5">
        <div className="flex justify-center">
          <TrinetraLogo size={32} />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs text-[#25C9F2]">ERROR 404</p>
          <h1 className="font-display text-2xl font-semibold text-[#F5F8FC]">
            Page not found
          </h1>
          <p className="text-sm text-[#91A2B8] leading-relaxed">
            The route or TRINETRA public profile you requested does not exist or has moved.
          </p>
        </div>
        <Link to="/" className="inline-block">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to TRINETRA
          </Button>
        </Link>
      </div>
    </div>
  );
};
