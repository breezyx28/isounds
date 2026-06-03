import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface StubPageProps {
  messageKey: "stub.explore" | "stub.library" | "stub.subscribe";
}

export default function StubPage({ messageKey }: StubPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
      <p className="max-w-md text-body-lg text-text-muted">{t(messageKey)}</p>
      <Button className="mt-6" asChild>
        <Link to="/">{t("actions.backHome")}</Link>
      </Button>
    </div>
  );
}
