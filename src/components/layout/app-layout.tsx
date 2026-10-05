"use client";

// ─── App Layout ───────────────────────────────────────────────────────────────
// Main 4-panel desktop layout with mobile adaptive layout.
// Desktop: CommunityRail | ChannelSidebar | ContentArea | MemberPanel
// Mobile:  ContentArea with bottom nav + sheet drawers

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { CommunityRail } from "@/components/navigation/community-rail";
import { ChannelSidebar } from "@/components/navigation/channel-sidebar";
import { MemberPanel } from "@/components/panels/member-panel";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { CreateCommunityModal } from "@/components/modals/create-community-modal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const {
    memberPanelOpen,
    mobileDrawerOpen,
    mobileDrawerContent,
    closeMobileDrawer,
  } = useUiStore();

  // Close mobile drawer on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) closeMobileDrawer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileDrawerOpen, closeMobileDrawer]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-900 text-slate-100">
      {/* ── Skip to content (a11y) ─────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999]
          focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
          focus:ring-offset-surface-900
        "
      >
        Skip to content
      </a>

      {/* ── Desktop Layout ─────────────────────────────────────────────────── */}
      <div className="hidden md:flex h-full w-full">
        {/* Community Rail — 72px */}
        <div className="flex-shrink-0 w-[72px] h-full">
          <CommunityRail />
        </div>

        {/* Channel Sidebar — 240px */}
        <div className="flex-shrink-0 w-[240px] h-full">
          <ChannelSidebar />
        </div>

        {/* Content Area — flex-1 */}
        <main
          id="main-content"
          className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#1e1f22]"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Member Panel — 256px, toggleable */}
        <AnimatePresence initial={false}>
          {memberPanelOpen && (
            <motion.div
              key="member-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 h-full overflow-hidden"
            >
              <MemberPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Layout ──────────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col h-full w-full">
        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#1e1f22]"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Bottom nav */}
        <MobileBottomNav />

        {/* Mobile Sheet Drawers */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={closeMobileDrawer}
                aria-hidden="true"
              />

              {/* Drawer content */}
              <motion.div
                key="drawer-panel"
                initial={{ x: mobileDrawerContent === "member-panel" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: mobileDrawerContent === "member-panel" ? "100%" : "-100%" }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className={`
                  fixed top-0 z-50 h-full
                  ${mobileDrawerContent === "member-panel" ? "right-0" : "left-0"}
                `}
                role="dialog"
                aria-modal="true"
                aria-label={
                  mobileDrawerContent === "community-rail"
                    ? "Community navigation"
                    : mobileDrawerContent === "channel-sidebar"
                    ? "Channel list"
                    : "Member list"
                }
              >
                {mobileDrawerContent === "community-rail" && (
                  <div className="w-[72px] h-full">
                    <CommunityRail />
                  </div>
                )}
                {mobileDrawerContent === "channel-sidebar" && (
                  <div className="w-[280px] h-full">
                    <ChannelSidebar />
                  </div>
                )}
                {mobileDrawerContent === "member-panel" && (
                  <div className="w-[280px] h-full">
                    <MemberPanel />
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Global Modals */}
      <CreateCommunityModal />
    </div>
  );
}

export default AppLayout;
