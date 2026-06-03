import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSubmitComplaintMutation } from "@/store/localApi";
import { useAppSelector } from "@/store/hooks";
import { getSubscriberMsisdn } from "@/lib/localIdentity";
import { toast } from "sonner";

const SUDAN_PHONE = /^(0|\+249)[0-9]{9}$/;
const schema = yup.object({
  name: yup.string().trim().min(2).required(),
  phone: yup.string().required().matches(SUDAN_PHONE),
  subject: yup.string().required(),
  message: yup.string().trim().min(20).max(500).required(),
});

type ContactFormValues = yup.InferType<typeof schema>;

export default function ContactPage() {
  const { t } = useTranslation(["common", "library"]);
  const authStatus = useAppSelector((s) => s.auth.status);
  const isSubscribed = authStatus === "subscribed";
  const [submitComplaint, { isLoading }] = useSubmitComplaintMutation();
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      subject: "suggestion",
      message: "",
    },
  });

  useEffect(() => {
    const msisdn = getSubscriberMsisdn();
    if (msisdn) setValue("phone", msisdn);
  }, [setValue]);

  if (authStatus === "checking") {
    return null;
  }

  if (!isSubscribed) {
    return (
      <main className="is-page">
        <section className="is-section mx-auto max-w-2xl">
          <EmptyState
            code="401"
            title={t("library:contact.subscribersOnlyTitle", {
              defaultValue: "Subscribers only",
            })}
            description={t("library:contact.subscribersOnlyBody", {
              defaultValue: "Contact messages are available for subscribed iSounds users.",
            })}
            actionLabel={t("auth.subscribeNow")}
            actionTo="/subscribe?reason=subscription_required"
          />
        </section>
      </main>
    );
  }

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitComplaint({
        type: values.subject,
        description: `${values.name}: ${values.message}`,
        phone: values.phone,
        name: values.name,
      }).unwrap();
      setStatus(t("library:contact.success"));
      toast.success(t("library:contact.success"));
      reset({ ...values, message: "" });
    } catch {
      setStatus(t("library:contact.failure"));
      toast.error(t("library:contact.failure"));
    }
  };

  return (
    <main className="is-page">
      <section className="is-section mx-auto max-w-2xl">
        <h1 className="text-display-lg font-semibold text-text">
          {t("library:contact.title")}
        </h1>
        <form className="is-card mt-6 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="contact-name" className="is-label block">
            {t("library:contact.name")}
          </label>
          <input
            id="contact-name"
            {...register("name")}
            className="is-input min-h-11"
            placeholder={t("library:contact.name")}
          />
          {errors.name && (
            <p className="text-label text-error">{t("library:contact.nameError")}</p>
          )}
          <label htmlFor="contact-phone" className="is-label block">
            {t("library:contact.phone")}
          </label>
          <input
            id="contact-phone"
            {...register("phone")}
            className="is-input min-h-11"
            placeholder={t("library:contact.phone")}
            readOnly
          />
          {errors.phone && (
            <p className="text-label text-error">{t("library:contact.phoneError")}</p>
          )}
          <label htmlFor="contact-subject" className="is-label block">
            {t("library:contact.subjectLabel")}
          </label>
          <select id="contact-subject" {...register("subject")} className="is-input min-h-11">
            <option value="suggestion">{t("library:contact.subjects.suggestion")}</option>
            <option value="complaint">{t("library:contact.subjects.complaint")}</option>
            <option value="technical">{t("library:contact.subjects.technical")}</option>
            <option value="other">{t("library:contact.subjects.other")}</option>
          </select>
          <label htmlFor="contact-message" className="is-label block">
            {t("library:contact.message")}
          </label>
          <textarea
            id="contact-message"
            {...register("message")}
            className="is-input"
            rows={5}
            placeholder={t("library:contact.message")}
          />
          {errors.message && (
            <p className="text-label text-error">{t("library:contact.messageError")}</p>
          )}
          <Button type="submit" className="min-h-11" loading={isLoading}>
            {t("library:contact.submit")}
          </Button>
        </form>
        {status && (
          <p className="mt-3 text-body-md text-text-muted" role="status" aria-live="polite">
            {status}
          </p>
        )}
        <p className="mt-4 text-body-md">
          <Link to="/help" className="text-primary hover:underline">
            {t("nav.help")}
          </Link>
        </p>
      </section>
    </main>
  );
}
