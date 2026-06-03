import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AboutStubPage() {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-12 md:px-8 xl:px-16">
      <h1 className="text-display-xl font-semibold text-text">{t("nav.about")}</h1>
      <p className="mt-4 max-w-2xl text-body-lg text-text-muted">
        iSounds — Sudan&apos;s podcast portal in partnership with Zain Sudan. Full
        about content ships in Phase 6.
      </p>
      <Button className="mt-8" variant="secondary" asChild>
        <Link to="/">{t("actions.backHome")}</Link>
      </Button>
    </div>
  );
}
