import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLoginUserMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setSubscribed } from "@/store/slices/authSlice";
import { writeStoredUser } from "@/features/auth/storage";

const schema = yup.object({
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^(0|\+249)[0-9]{9}$/, "Invalid Sudan phone format"),
});

type LoginFormValues = yup.InferType<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState<string | null>(null);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setMessage(null);
    try {
      const data = await loginUser({ phone: values.phone }).unwrap();
      const token =
        (data as { token?: string }).token ??
        ((data as { data?: { token?: string } }).data?.token ?? "");
      if (!token) throw new Error("Missing token");
      writeStoredUser({ token, msisdn: values.phone });
      dispatch(
        setSubscribed({
          user: { token, msisdn: values.phone },
          msisdn: values.phone,
        }),
      );
      setMessage(t("auth.loginSuccess"));
    } catch {
      setMessage(t("auth.loginFailed"));
    }
  };

  return (
    <main className="is-page is-page--narrow">
      <section className="is-section">
      <h1 className="text-display-lg font-semibold text-text">{t("auth.loginTitle")}</h1>
      <p className="mt-3 text-body-md text-text-muted">{t("auth.loginBody")}</p>
      <form className="mt-6 space-y-3 is-card" onSubmit={handleSubmit(onSubmit)}>
        <label className="is-label block" htmlFor="phone-input">
          {t("auth.phoneLabel")}
        </label>
        <input
          id="phone-input"
          {...register("phone")}
          className="is-input"
          placeholder="+249..."
        />
        {errors.phone && (
          <p className="text-label text-error" role="alert">
            {t("auth.loginFailed")}
          </p>
        )}
        <Button type="submit" loading={isLoading}>
          {t("auth.loginAction")}
        </Button>
      </form>
      {message && (
        <p
          className="mt-3 text-body-md text-text-muted"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
      </section>
    </main>
  );
}
