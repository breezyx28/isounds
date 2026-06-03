import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { motion, useReducedMotion } from "motion/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoader } from "@/components/shared/PageLoader";
import { applyDocumentLanguage } from "@/i18n";
import { applyTheme } from "@/lib/theme";
import { useAppSelector } from "@/store/hooks";
import { GlobalAudio } from "@/features/player/GlobalAudio";
import { WelcomeOverlay } from "@/components/shared/WelcomeOverlay";
import { SubscriptionChecker } from "@/features/auth/SubscriptionChecker";
import { LocalAnalyticsTracker } from "@/features/analytics/LocalAnalyticsTracker";
import { BookmarkMigration } from "@/features/bookmarks/BookmarkMigration";
import { DocumentHead } from "@/components/shared/DocumentHead";
import { FaviconManager } from "@/components/shared/FaviconManager";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PwaInstallBanner } from "@/components/shared/PwaInstallBanner";
import HomePage from "@/pages/HomePage";
import CategoriesPage from "@/pages/CategoriesPage";
import CategoryPage from "@/pages/CategoryPage";
import EpisodeDetailPage from "@/pages/EpisodeDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import ExplorePage from "@/pages/ExplorePage";
import LibraryPage from "@/pages/LibraryPage";
import SavedPodcastsPage from "@/pages/SavedPodcastsPage";
import SubscribePage from "@/pages/SubscribePage";
import LoginPage from "@/pages/LoginPage";
import ContactPage from "@/pages/ContactPage";
import LandingPage from "@/pages/LandingPage";
import AboutPage from "@/pages/AboutPage";
import HelpPage from "@/pages/HelpPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";

function RequireSubscribed() {
  const authStatus = useAppSelector((s) => s.auth.status);
  if (authStatus === "checking") return <PageLoader />;
  if (authStatus !== "subscribed") {
    return <Navigate to="/subscribe?reason=subscription_required" replace />;
  }
  return <Outlet />;
}

function AnimatedOutlet() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={location.pathname}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </motion.div>
  );
}

function AppBootstrap() {
  const { theme, language } = useAppSelector((s) => s.ui);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const authStatus = useAppSelector((s) => s.auth.status);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    applyDocumentLanguage(language);
  }, [theme, language]);

  useEffect(() => {
    if (authStatus !== "subscribed") return;
    const shown = sessionStorage.getItem("welcome_shown");
    if (shown) return;
    sessionStorage.setItem("welcome_shown", "1");
    setShowWelcome(true);
    const timer = window.setTimeout(() => setShowWelcome(false), 2500);
    return () => window.clearTimeout(timer);
  }, [authStatus]);

  return (
    <>
      <SubscriptionChecker onResolved={() => setIsBootstrapping(false)} />
      {isBootstrapping ? (
        <PageLoader />
      ) : (
        <WelcomeOverlay open={showWelcome} onDismiss={() => setShowWelcome(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <>
      <DocumentHead />
      <FaviconManager />
      <AppBootstrap />
      <LocalAnalyticsTracker />
      <BookmarkMigration />
      <GlobalAudio />
      <PwaInstallBanner />
      <Toaster theme="light" richColors />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route element={<AnimatedOutlet />}>
            <Route index element={<LandingPage />} />
            <Route path="browse" element={<HomePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:categoryId" element={<CategoryPage />} />
            <Route path="podcasts/:id" element={<EpisodeDetailPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="library" element={<RequireSubscribed />}>
              <Route index element={<LibraryPage />} />
              <Route path="saved" element={<SavedPodcastsPage />} />
              <Route path="history" element={<LibraryPage />} />
            </Route>
            <Route path="subscribe" element={<SubscribePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
