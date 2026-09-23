import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'compact' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // If already running as an installed standalone PWA app, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 4000);
    }
  };

  return (
    <>
      {/* Chromium / Android / Desktop Install Flow */}
      {isInstallable && (
        <button
          type="button"
          onClick={handleInstallClick}
          id="pwa-install-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4B70E2] text-white text-xs font-semibold shadow-xs hover:bg-[#3B62D6] active:scale-95 transition-all"
          title="Install app to your home screen for full offline access"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* iOS Safari Flow (beforeinstallprompt is not fired on WebKit) */}
      {!isInstallable && isIOS && (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          id="pwa-install-ios-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D0DEF8] bg-white text-[#2552D0] text-xs font-semibold hover:bg-[#EEF4FE] transition-colors"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#4B70E2]" />
          <span>Install App</span>
        </button>
      )}

      {/* Fallback prompt button for browsers where install prompt isn't fired yet */}
      {!isInstallable && !isIOS && !isInstalled && (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          id="pwa-install-info-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D0DEF8] bg-white text-[#2552D0] text-xs font-medium hover:bg-[#EEF4FE] transition-colors"
          title="Add to Phone Home Screen"
        >
          <Download className="w-3.5 h-3.5 text-[#4B70E2]" />
          <span>Install App</span>
        </button>
      )}

      {/* Installed Success Toast */}
      {installedNotice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#10B981] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>App installed to your device! Works 100% offline.</span>
        </div>
      )}

      {/* Guided Installation Modal (for iOS Safari or manual bookmark) */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#4B70E2] text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Install to Home Screen</h3>
                  <p className="text-xs text-slate-500">Run offline anytime without internet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F0F5FF] border border-[#DCE7FC]">
                <div className="w-6 h-6 rounded-lg bg-[#4B70E2] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Tap Share:</span> In your browser
                  toolbar (Safari or Chrome), tap the <Share className="w-3.5 h-3.5 inline mx-0.5 text-[#4B70E2]" /> Share button.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F0F5FF] border border-[#DCE7FC]">
                <div className="w-6 h-6 rounded-lg bg-[#4B70E2] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Add to Home Screen:</span> Scroll
                  down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#4B70E2]" /> <strong>"Add to Home Screen"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                  ✓
                </div>
                <div>
                  <span className="font-semibold">Offline Ready:</span> Launch it from your phone like Subway Surfers. All bookings, calendar data, and categories save locally even with airplane mode on!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-[#4B70E2] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3B62D6] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
