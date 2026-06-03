import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useLoginUserMutation, useLazyCheckSubscriptionQuery } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import {
  setAuthUser,
  setChecking,
  setExpired,
  setGuest,
  setMsisdn,
  setSubscribed,
  setSubscriberInfo,
  type AuthUser,
} from "@/store/slices/authSlice";
import {
  readStoredMsisdn,
  readStoredSubscriberInfo,
  readStoredUser,
  writeStoredMsisdn,
  writeStoredSubscriberInfo,
  writeStoredUser,
} from "./storage";

interface SubscriptionCheckerProps {
  onResolved: () => void;
}

function extractToken(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const root = data as Record<string, unknown>;
  const nested =
    typeof root.data === "object" && root.data !== null
      ? (root.data as Record<string, unknown>)
      : {};
  return (root.token as string | undefined) ?? (nested.token as string | undefined);
}

export function SubscriptionChecker({ onResolved }: SubscriptionCheckerProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [triggerCheck] = useLazyCheckSubscriptionQuery();
  const [loginUser] = useLoginUserMutation();

  const msisdnFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("msisdn");
  }, [location.search]);

  useEffect(() => {
    let active = true;
    async function run() {
      dispatch(setChecking());

      if (msisdnFromUrl) {
        writeStoredMsisdn(msisdnFromUrl);
        dispatch(setMsisdn(msisdnFromUrl));
      }

      const effectiveMsisdn = msisdnFromUrl ?? readStoredMsisdn();
      const fallbackUser = readStoredUser();
      const fallbackSubscriberInfo = readStoredSubscriberInfo();
      const attemptedCarrierFlow = Boolean(effectiveMsisdn);

      if (!effectiveMsisdn && fallbackUser?.token) {
        dispatch(setAuthUser(fallbackUser));
        dispatch(setSubscriberInfo(fallbackSubscriberInfo));
        onResolved();
        return;
      }

      if (!effectiveMsisdn) {
        dispatch(setGuest(undefined));
        onResolved();
        return;
      }

      try {
        const subResult = await triggerCheck(effectiveMsisdn).unwrap();
        if (!active) return;
        writeStoredSubscriberInfo({ active: true, raw: subResult });
        dispatch(setSubscriberInfo({ active: true, raw: subResult }));

        const loginResult = await loginUser({ msisdn: effectiveMsisdn }).unwrap();
        if (!active) return;

        const token = extractToken(loginResult);
        if (!token) throw new Error("Missing token from login response");

        const user: AuthUser = { token, msisdn: effectiveMsisdn };
        writeStoredUser(user);
        dispatch(
          setSubscribed({
            user,
            msisdn: effectiveMsisdn,
            subscriberInfo: { active: true, raw: subResult },
          }),
        );
      } catch (error) {
        if (!active) return;
        if (!attemptedCarrierFlow && fallbackUser?.token) {
          dispatch(setAuthUser(fallbackUser));
          dispatch(setSubscriberInfo(fallbackSubscriberInfo));
        } else {
          dispatch(setExpired({ error: String(error) }));
        }
      } finally {
        if (active) onResolved();
      }
    }
    void run();
    return () => {
      active = false;
    };
  }, [dispatch, loginUser, msisdnFromUrl, onResolved, triggerCheck]);

  return null;
}
