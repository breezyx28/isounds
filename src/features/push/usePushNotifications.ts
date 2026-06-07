import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  useGetPushStatusQuery,
  useGetVapidPublicKeyQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} from "@/store/localApi";
import { getSwRegistration } from "@/registerPwa";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function usePushNotifications() {
  const { t } = useTranslation("personalization");
  const { data: vapid } = useGetVapidPublicKeyQuery();
  const { data: status, refetch: refetchStatus } = useGetPushStatusQuery();
  const [subscribePush] = useSubscribePushMutation();
  const [unsubscribePush] = useUnsubscribePushMutation();
  const [busy, setBusy] = useState(false);

  const permission = useMemo(
    () =>
      typeof Notification !== "undefined" ? Notification.permission : ("denied" as NotificationPermission),
    [],
  );

  const supported = useMemo(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    [],
  );

  const enablePush = useCallback(async () => {
    if (!supported) {
      toast.error(t("push.unsupported"));
      return false;
    }
    if (!vapid?.configured || !vapid.publicKey) {
      toast.error(t("push.notConfigured"));
      return false;
    }

    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        toast.error(t("push.denied"));
        return false;
      }

      const registration = getSwRegistration() ?? (await navigator.serviceWorker.ready);
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
        });
      }

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        toast.error(t("push.failed"));
        return false;
      }

      await subscribePush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        user_agent: navigator.userAgent,
      }).unwrap();

      await refetchStatus();
      toast.success(t("push.enabled"));
      return true;
    } catch {
      toast.error(t("push.failed"));
      return false;
    } finally {
      setBusy(false);
    }
  }, [refetchStatus, subscribePush, supported, t, vapid]);

  const disablePush = useCallback(async () => {
    setBusy(true);
    try {
      const registration = getSwRegistration() ?? (await navigator.serviceWorker.ready);
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribePush({ endpoint: subscription.endpoint }).unwrap();
        await subscription.unsubscribe();
      } else {
        await unsubscribePush().unwrap();
      }
      await refetchStatus();
      toast.success(t("push.disabled"));
      return true;
    } catch {
      toast.error(t("push.failed"));
      return false;
    } finally {
      setBusy(false);
    }
  }, [refetchStatus, t, unsubscribePush]);

  return {
    supported,
    permission,
    busy,
    pushConfigured: vapid?.configured ?? false,
    pushSubscribed: status?.subscribed ?? false,
    enablePush,
    disablePush,
  };
}
