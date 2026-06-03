import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ZAIN_DSP } from "@/lib/constants";
import { useLazyCheckSubscriptionQuery, useLoginUserMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setExpired, setSubscribed } from "@/store/slices/authSlice";
import {
  readStoredMsisdn,
  writeStoredSubscriberInfo,
  writeStoredUser,
} from "@/features/auth/storage";

export default function SubscribePage() {
  const { t } = useTranslation(["common", "player"]);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checkSubscription, { isFetching }] = useLazyCheckSubscriptionQuery();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();

  useEffect(() => {
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");

    if (status === "cancelled") {
      setStatusMessage(t("auth.cancelSuccess"));
      return;
    }
    if (reason === "subscription_required") {
      setStatusMessage(t("auth.subscriptionRequired"));
      return;
    }
    if (reason === "like_requires_subscription") {
      setStatusMessage(t("auth.likeRequiresSubscription"));
      return;
    }
    if (reason === "listen_requires_subscription") {
      setStatusMessage(t("auth.listenRequiresSubscription"));
      return;
    }
    if (reason === "rating_requires_subscription") {
      setStatusMessage(t("auth.ratingRequiresSubscription"));
      return;
    }
  }, [searchParams, t]);

  const handleCheckStatus = async () => {
    const msisdn = readStoredMsisdn();
    if (!msisdn) {
      setStatusMessage(t("auth.noMsisdn"));
      return;
    }

    try {
      const sub = await checkSubscription(msisdn).unwrap();
      const login = await loginUser({ msisdn }).unwrap();
      const token =
        (login as { token?: string }).token ??
        ((login as { data?: { token?: string } }).data?.token ?? "");
      if (!token) throw new Error("Missing token");

      writeStoredSubscriberInfo({ active: true, raw: sub });
      writeStoredUser({ token, msisdn });
      dispatch(
        setSubscribed({
          user: { token, msisdn },
          msisdn,
          subscriberInfo: { active: true, raw: sub },
        }),
      );
      setStatusMessage(t("auth.checkSuccess"));
    } catch {
      dispatch(setExpired({ error: "check_failed" }));
      setStatusMessage(t("auth.checkFailed"));
    }
  };

  return (
    <main className="is-page">
      <section className="is-section is-card max-w-3xl">
        <h1 className="text-display-xl font-semibold text-text">{t("auth.subscribeTitle")}</h1>
        <p className="mt-4 text-body-lg text-text-muted">{t("auth.subscribeBody")}</p>
        <p className="mt-2 text-body-md text-text-muted">{t("auth.priceNote")}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="zain" size="lg">
            <a href={ZAIN_DSP} target="_blank" rel="noopener noreferrer">
              {t("auth.subscribeNow")}
            </a>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => void handleCheckStatus()}
            loading={isFetching || isLoginLoading}
          >
            {t("auth.alreadySubscribed")}
          </Button>
        </div>

        {statusMessage && (
          <p
            className="mt-4 text-body-md text-text-muted"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>
        )}
      </section>
    </main>
  );
}
