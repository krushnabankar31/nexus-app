// ─── Nexus UI Store (Zustand) ─────────────────────────────────────────────────
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export type AppView = "community" | "dms" | "discover" | "settings";
export type Theme = "dark" | "light";

interface UiState {
  theme: Theme;
  activeCommunityId: string | null;
  activeChannelId: string | null;
  activeView: AppView;
  memberPanelOpen: boolean;
  mobileDrawerOpen: boolean;
  mobileDrawerContent: "community-rail" | "channel-sidebar" | "member-panel" | null;
  isMuted: boolean;
  isDeafened: boolean;
  mobileActiveTab: "home" | "messages" | "discover" | "notifications" | "profile";
  threadPanelOpen: boolean;
  activeThreadId: string | null;
  profilePopoverUserId: string | null;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setActiveCommunity: (id: string | null) => void;
  setActiveChannel: (id: string | null) => void;
  setActiveView: (view: AppView) => void;
  toggleMemberPanel: () => void;
  setMemberPanelOpen: (open: boolean) => void;
  openMobileDrawer: (content: UiState["mobileDrawerContent"]) => void;
  closeMobileDrawer: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  setMobileActiveTab: (tab: UiState["mobileActiveTab"]) => void;
  openThread: (threadId: string) => void;
  closeThread: () => void;
  openProfilePopover: (userId: string) => void;
  closeProfilePopover: () => void;
}

export const useUiStore = create<UiState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        theme: "dark",
        activeCommunityId: "c1",
        activeChannelId: "ch-4",
        activeView: "community",
        memberPanelOpen: true,
        mobileDrawerOpen: false,
        mobileDrawerContent: null,
        isMuted: false,
        isDeafened: false,
        mobileActiveTab: "home",
        threadPanelOpen: false,
        activeThreadId: null,
        profilePopoverUserId: null,

        toggleTheme: () =>
          set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

        setTheme: (theme) => set({ theme }),

        setActiveCommunity: (id) =>
          set({ activeCommunityId: id, activeView: id ? "community" : "dms" }),

        setActiveChannel: (id) => set({ activeChannelId: id }),

        setActiveView: (view) => set({ activeView: view }),

        toggleMemberPanel: () =>
          set((s) => ({ memberPanelOpen: !s.memberPanelOpen })),

        setMemberPanelOpen: (open) => set({ memberPanelOpen: open }),

        openMobileDrawer: (content) =>
          set({ mobileDrawerOpen: true, mobileDrawerContent: content }),

        closeMobileDrawer: () =>
          set({ mobileDrawerOpen: false, mobileDrawerContent: null }),

        toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

        toggleDeafen: () =>
          set((s) => ({
            isDeafened: !s.isDeafened,
            isMuted: !s.isDeafened ? true : s.isMuted,
          })),

        setMobileActiveTab: (tab) => set({ mobileActiveTab: tab }),

        openThread: (threadId) =>
          set({ threadPanelOpen: true, activeThreadId: threadId }),

        closeThread: () =>
          set({ threadPanelOpen: false, activeThreadId: null }),

        openProfilePopover: (userId) =>
          set({ profilePopoverUserId: userId }),

        closeProfilePopover: () =>
          set({ profilePopoverUserId: null }),
      }),
      {
        name: "nexus-ui-store",
        partialize: (state) => ({
          theme: state.theme,
          activeCommunityId: state.activeCommunityId,
          activeChannelId: state.activeChannelId,
          activeView: state.activeView,
          memberPanelOpen: state.memberPanelOpen,
          isMuted: state.isMuted,
          isDeafened: state.isDeafened,
        }),
      }
    )
  )
);
