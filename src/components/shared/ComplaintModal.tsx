import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmitComplaintMutation } from "@/store/localApi";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

interface ComplaintModalProps {
  podcastId?: number;
}

interface ComplaintFormValues {
  type: string;
  description: string;
  phone?: string;
}

const complaintSchema: yup.ObjectSchema<ComplaintFormValues> = yup.object({
  type: yup.string().required(),
  description: yup.string().trim().min(20).max(500).required(),
  phone: yup.string().optional(),
});

export function ComplaintModal({ podcastId }: ComplaintModalProps) {
  const { t } = useTranslation("library");
  const auth = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [submitComplaint, { isLoading }] = useSubmitComplaintMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: yupResolver(complaintSchema),
    defaultValues: {
      type: "technical",
      description: "",
      phone: auth.msisdn ?? "",
    },
  });

  const submit = async (values: ComplaintFormValues) => {
    try {
      await submitComplaint({
        podcast_id: podcastId,
        type: values.type,
        description: values.description,
        phone: values.phone || auth.msisdn || undefined,
      }).unwrap();
      toast.success(t("contact.success"));
      setOpen(false);
      reset({ ...values, description: "" });
    } catch {
      toast.error(t("contact.failure"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("reportProblem")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("complaintTitle")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(submit)}>
          <select
            {...register("type")}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
          >
            <option value="offensive_content">{t("complaintTypes.offensive")}</option>
            <option value="technical">{t("complaintTypes.technical")}</option>
            <option value="copyright">{t("complaintTypes.copyright")}</option>
            <option value="other">{t("complaintTypes.other")}</option>
          </select>
          <textarea
            {...register("description")}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
            rows={4}
          />
          {errors.description && (
            <p className="text-label text-error">
              {t("contact.messageError")}
            </p>
          )}
          <input
            {...register("phone")}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
            placeholder={t("contact.phone")}
          />
          <Button
            variant="primary"
            type="submit"
            loading={isLoading}
          >
            {t("submitComplaint")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
