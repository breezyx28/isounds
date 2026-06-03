import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUnsubscribeUserMutation } from "@/store/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import { clearStoredAuth, readStoredMsisdn } from "@/features/auth/storage";

export function CancelSubscriptionModal() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribeUser, { isLoading }] = useUnsubscribeUserMutation();

  if (auth.status !== "subscribed") return null;

  const onConfirm = async () => {
    try {
      setError(null);
      await unsubscribeUser({ msisdn: auth.msisdn ?? readStoredMsisdn() ?? undefined }).unwrap();
      clearStoredAuth();
      dispatch(clearAuth());
      setOpen(false);
      setStep(1);
      navigate("/subscribe?status=cancelled");
    } catch {
      setError(t("auth.cancelFailed"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setStep(1);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="danger" size="sm">
          {t("auth.cancelSubscription")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? t("auth.cancelStep1Title") : t("auth.cancelStep2Title")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-body-md text-text-muted">
          {step === 1 ? t("auth.cancelStep1Body") : t("auth.cancelStep2Body")}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("auth.cancelBack")}
          </Button>
          {step === 1 ? (
            <Button variant="danger" onClick={() => setStep(2)}>
              {t("auth.cancelContinue")}
            </Button>
          ) : (
            <Button variant="danger" loading={isLoading} onClick={() => void onConfirm()}>
              {t("auth.cancelConfirm")}
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-label text-error">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
