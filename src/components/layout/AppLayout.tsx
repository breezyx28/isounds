import { Outlet } from "react-router-dom";
import { LandingNavbar } from "./LandingNavbar";
import { AppFooter } from "./AppFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileDrawer } from "./MobileDrawer";
import { MiniPlayer } from "./MiniPlayer";
import { useAppSelector } from "@/store/hooks";

export function AppLayout() {
  const showMiniPlayer = useAppSelector((state) => state.player.showMiniPlayer);

  return (
    <div
      className={`flex min-h-screen flex-col ${
        showMiniPlayer ? "pb-safe pb-[140px] lg:pb-[80px]" : "pb-safe pb-14 sm:pb-16 lg:pb-0"
      }`}
    >
      <LandingNavbar />
      <main className="flex-1 pt-14 sm:pt-16">
        <Outlet />
      </main>
      <AppFooter />
      <MiniPlayer />
      <MobileBottomNav />
      <MobileDrawer />
    </div>
  );
}
