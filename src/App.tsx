/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { ToastProvider } from './components/ui/Toast';
import { SiteBackdrop } from './components/SiteBackdrop';
import { PublicProfileLayout } from './components/PublicProfileLayout';
import { Skeleton } from './components/ui/Skeleton';

// Lazy-loaded so shareable public profile routes (/u/:username) do not bundle
// or execute Firebase Auth, dashboard layouts, or marketing sections.
const PublicProfilePage = lazy(() =>
  import('./pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage }))
);

const AuthenticatedShell = lazy(() => import('./components/AuthenticatedShell'));

function PublicProfileSkeleton() {
  return (
    <PublicProfileLayout>
      <div className="w-full rounded-xl border border-[rgba(145,162,184,0.16)] bg-[#0D1422]/85 backdrop-blur-md p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2.5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </PublicProfileLayout>
  );
}

function AppShellSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-5 w-40 mx-auto" />
        <Skeleton className="h-3 w-56 mx-auto" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <div className="relative min-h-screen">
          <SiteBackdrop />
          <div className="relative z-10 min-h-screen">
            <BrowserRouter>
              <Routes>
                {/* Dedicated lightweight public payment profile routes */}
                <Route
                  path="/u/:username"
                  element={
                    <Suspense fallback={<PublicProfileSkeleton />}>
                      <PublicProfilePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/@:username"
                  element={
                    <Suspense fallback={<PublicProfileSkeleton />}>
                      <PublicProfilePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/pay/:username"
                  element={
                    <Suspense fallback={<PublicProfileSkeleton />}>
                      <PublicProfilePage />
                    </Suspense>
                  }
                />

                {/* All other marketing, auth, and dashboard routes */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<AppShellSkeleton />}>
                      <AuthenticatedShell />
                    </Suspense>
                  }
                />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
      </ToastProvider>
    </MotionConfig>
  );
}
