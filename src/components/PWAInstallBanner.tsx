import { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '@/hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isOnline = useOnlineStatus();

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          Offline Mode — Using cached data.
        </div>
      )}

      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg text-[12px] font-medium text-left w-full transition-all hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <Download size={14} />
          <span>Install App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg text-[12px] font-medium text-left w-full transition-all hover:opacity-90"
            style={{ background: 'var(--surface2)', color: 'var(--fg)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <Smartphone size={14} />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div
                className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <h3 className="text-base font-bold mb-2">Install on iPhone / iPad</h3>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs transition-colors"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
