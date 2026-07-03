'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { TabId } from '../../types';

interface NavBarProps {
  activeTab: TabId;
  tabs: readonly TabId[];
  goToTab: (tab: TabId) => void;
  tabLabels: Record<TabId, string>;
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();

  function switchLocale(newLocale: string) {
    document.cookie = `locale=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => switchLocale('en')}
        className={`font-sans text-xs px-2 py-1 rounded-l transition-colors ${
          locale === 'en'
            ? 'bg-primary text-secondary font-medium'
            : 'text-primary hover:bg-primary/10'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale('de')}
        className={`font-sans text-xs px-2 py-1 rounded-r transition-colors ${
          locale === 'de'
            ? 'bg-primary text-secondary font-medium'
            : 'text-primary hover:bg-primary/10'
        }`}
      >
        DE
      </button>
    </div>
  );
}

export default function NavBar({ activeTab, tabs, goToTab, tabLabels }: NavBarProps) {
  const t = useTranslations('Nav');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleTabClick = (tab: TabId) => {
    goToTab(tab);
    closeSidebar();
  };

  const navBarStyles = 'bg-secondary border-white/10';
  const titleStyles = 'text-primary';
  const linkStyles = (tab: TabId) =>
    activeTab === tab
      ? 'bg-primary text-secondary font-medium'
      : 'text-primary hover:bg-primary hover:text-secondary';

  return (
    <>
      {/* Mobile: floating hamburger only */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-primary text-secondary touch-manipulation transition-[filter] duration-150 hover:brightness-110 active:brightness-90 shadow-lg md:hidden"
        aria-label={t('openMenu')}
      >
        <HamburgerIcon className="w-6 h-6" />
      </button>

      {/* Desktop: full horizontal nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-30 backdrop-blur border-b hidden md:block ${navBarStyles}`}
        aria-label={t('mainNavigation')}
      >
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <Image
              src="/images/monogram_red.png"
              alt={t('monogramAlt')}
              width={120}
              height={40}
              className="h-8 w-auto shrink-0 object-contain"
            />
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => goToTab(tab)}
                  className={`font-sans text-xs md:text-sm px-2 md:px-3 py-2 rounded transition-colors whitespace-nowrap ${linkStyles(tab)}`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
              <LanguageSwitcher className="ml-2" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      <div
        role="presentation"
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      >
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          aria-label={t('closeMenu')}
        />
        <aside
          className={`absolute top-0 left-0 bottom-0 w-[min(85vw,20rem)] bg-secondary rounded-r-2xl flex flex-col transition-transform duration-300 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ boxShadow: '4px 0 24px -4px color-mix(in srgb, var(--color-primary) 35%, transparent), 8px 0 40px -8px color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
          aria-label={t('menuLabel')}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
            <Image
            src="/images/monogram_red.png"
            alt={t('monogramAlt')}
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
            <button
              type="button"
              onClick={closeSidebar}
              className="p-2.5 rounded-xl bg-primary text-secondary touch-manipulation transition-[filter] duration-150 hover:brightness-110 active:brightness-90"
              aria-label={t('closeMenu')}
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col py-2 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`font-sans text-left px-4 py-3 text-primary hover:bg-primary/10 transition-colors ${
                  activeTab === tab ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
          <div className="mt-auto px-4 py-3 border-t border-primary/10">
            <LanguageSwitcher />
          </div>
        </aside>
      </div>
    </>
  );
}
