import { Suspense, useCallback, useEffect, useState } from "react";
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
import { lazyRoute } from "@/lib/lazyRoute";
import { useAppSelector } from "@/store/hooks";
import { GlobalAudio } from "@/features/player/GlobalAudio";
import { WelcomeOverlay } from "@/components/shared/WelcomeOverlay";
import { SubscriptionChecker } from "@/features/auth/SubscriptionChecker";
import { LocalAnalyticsTracker } from "@/features/analytics/LocalAnalyticsTracker";
import { BookmarkMigration } from "@/features/bookmarks/BookmarkMigration";
import { DocumentHead } from "@/components/shared/DocumentHead";
import { FaviconManager } from "@/components/shared/FaviconManager";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { PwaInstallBanner } from "@/components/shared/PwaInstallBanner";
import LandingPage from "@/pages/LandingPage";

const HomePage = lazyRoute(() => import("@/pages/HomePage"), "Home");
const CategoriesPage = lazyRoute(() => import("@/pages/CategoriesPage"), "Categories");
const CategoryPage = lazyRoute(() => import("@/pages/CategoryPage"), "Category");
const EpisodeDetailPage = lazyRoute(() => import("@/pages/EpisodeDetailPage"), "Episode");
const NotFoundPage = lazyRoute(() => import("@/pages/NotFoundPage"), "NotFound");
const UnauthorizedPage = lazyRoute(() => import("@/pages/UnauthorizedPage"), "Unauthorized");
const ExplorePage = lazyRoute(() => import("@/pages/ExplorePage"), "Explore");
const LibraryPage = lazyRoute(() => import("@/pages/LibraryPage"), "Library");
const SavedPodcastsPage = lazyRoute(() => import("@/pages/SavedPodcastsPage"), "Saved");
const PersonalizationPage = lazyRoute(() => import("@/pages/PersonalizationPage"), "Personalization");
const SubscribePage = lazyRoute(() => import("@/pages/SubscribePage"), "Subscribe");
const LoginPage = lazyRoute(() => import("@/pages/LoginPage"), "Login");
const ContactPage = lazyRoute(() => import("@/pages/ContactPage"), "Contact");
const AboutPage = lazyRoute(() => import("@/pages/AboutPage"), "About");
const HelpPage = lazyRoute(() => import("@/pages/HelpPage"), "Help");
const TermsPage = lazyRoute(() => import("@/pages/TermsPage"), "Terms");
const PrivacyPage = lazyRoute(() => import("@/pages/PrivacyPage"), "Privacy");

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

  const handleAuthResolved = useCallback(() => setIsBootstrapping(false), []);

  return (
    <>
      <SubscriptionChecker onResolved={handleAuthResolved} />
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
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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
                <Route path="personalization" element={<PersonalizationPage />} />
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
      </Suspense>
    </>
  );
}
