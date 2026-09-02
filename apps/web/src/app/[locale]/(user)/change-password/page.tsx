"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { changePassword } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validation/auth";
import { useRouter } from "@/i18n/navigation";

export default function ChangePasswordPage() {
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const t = useTranslations("changePassword");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    setSuccess(false);
    try {
      await changePassword(values);
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_failed"));
    }
  });

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old">{t("oldPassword")}</Label>
              <Input id="old" type="password" autoComplete="current-password" {...register("oldPassword")} />
              {errors.oldPassword && <p className="text-sm text-red-600">{t("error_failed")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">{t("newPassword")}</Label>
              <Input id="new" type="password" autoComplete="new-password" {...register("newPassword")} />
              {errors.newPassword && <p className="text-sm text-red-600">{t("error_weak")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("confirmPassword")}</Label>
              <Input id="confirm" type="password" autoComplete="new-password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-red-600">{t("error_mismatch")}</p>}
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            {success && <p className="text-sm text-green-600">{t("success")}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
                {t("cancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {t("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
