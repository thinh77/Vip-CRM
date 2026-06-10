import { CalendarDays, FileUp, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { AppView } from "./useAppNavigation";

interface AppSidebarProps {
  activeView: AppView;
  isDrawerOpen: boolean;
  onSelectView: (view: AppView) => void;
  onClose: () => void;
}

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  view: AppView;
}

const navigationItems: NavigationItem[] = [
  { view: "events", label: "Sự kiện", icon: CalendarDays },
  { view: "customers", label: "Khách hàng", icon: Users },
  { view: "import", label: "Import khách hàng", icon: FileUp }
];

interface SidebarContentProps {
  activeView: AppView;
  layoutGroupId: string;
  onSelectView: (view: AppView) => void;
  onClose?: () => void;
}

function SidebarContent({ activeView, layoutGroupId, onSelectView, onClose }: SidebarContentProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B01137] text-base font-extrabold text-white shadow-sm">
            A
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-slate-900">CRM Connect</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Customer Care</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Đóng menu điều hướng"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <LayoutGroup id={layoutGroupId}>
        <nav className="flex-1 space-y-2 px-3 py-5" aria-label="Điều hướng CRM">
          {navigationItems.map(({ icon: Icon, label, view }) => {
            const isActive = activeView === view;

            return (
              <button
                key={view}
                type="button"
                onClick={() => onSelectView(view)}
                aria-current={isActive ? "page" : undefined}
                className={`relative isolate flex w-full items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-left text-sm font-bold transition-colors ${
                  isActive ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 z-0 rounded-xl bg-[#B01137] shadow-md shadow-rose-900/15"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.08 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="text-[10px] font-semibold leading-4 text-slate-400">
          Hệ thống quản lý chăm sóc khách hàng tổ chức
        </p>
      </div>
    </>
  );
}

export function AppSidebar({ activeView, isDrawerOpen, onSelectView, onClose }: AppSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const drawerOffset = shouldReduceMotion ? 0 : "-100%";
  const overlayDuration = shouldReduceMotion ? 0.08 : 0.16;
  const drawerDuration = shouldReduceMotion ? 0.08 : 0.22;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent
          activeView={activeView}
          layoutGroupId="desktop-sidebar"
          onSelectView={onSelectView}
        />
      </aside>

      <AnimatePresence initial={false}>
        {isDrawerOpen && (
          <motion.div
            key="mobile-navigation-drawer"
            className="fixed inset-0 z-50 lg:hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              type="button"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
              onClick={onClose}
              aria-label="Đóng menu điều hướng"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: overlayDuration } },
                exit: { opacity: 0, transition: { duration: overlayDuration } }
              }}
            />
            <motion.aside
              className="relative flex h-full w-[min(82vw,288px)] flex-col bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Menu điều hướng"
              variants={{
                hidden: { x: drawerOffset, opacity: shouldReduceMotion ? 0 : 1 },
                visible: {
                  x: 0,
                  opacity: 1,
                  transition: {
                    duration: drawerDuration,
                    ease: [0.22, 1, 0.36, 1]
                  }
                },
                exit: {
                  x: drawerOffset,
                  opacity: shouldReduceMotion ? 0 : 1,
                  transition: {
                    duration: drawerDuration,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <SidebarContent
                activeView={activeView}
                layoutGroupId="mobile-sidebar"
                onSelectView={onSelectView}
                onClose={onClose}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
