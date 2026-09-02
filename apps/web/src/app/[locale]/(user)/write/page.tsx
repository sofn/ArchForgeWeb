"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, WebCategory } from "@/lib/api";
import { useCreateArticle, useUploadImage } from "@/lib/query/hooks";
import { writeArticleSchema, type WriteArticleValues } from "@/lib/validation/article";
import { useRouter } from "@/i18n/navigation";

export default function WritePage() {
  const [coverFileId, setCoverFileId] = useState<number | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [categories, setCategories] = useState<WebCategory[]>([]);
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const t = useTranslations("write");
  const createArticle = useCreateArticle();
  const uploadImage = useUploadImage();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<WriteArticleValues>({
    resolver: zodResolver(writeArticleSchema),
    defaultValues: { title: "", categoryId: "", summary: "", content: "" },
  });

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/svg+xml",
  ]);

  const validateImageFile = (file: File): boolean => {
    if (file.size > MAX_IMAGE_SIZE) {
      setFormError(t("error_file_too_large"));
      return false;
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFormError(t("error_file_type"));
      return false;
    }
    return true;
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateImageFile(file)) return;
    try {
      const res = await uploadImage.mutateAsync(file);
      setCoverFileId(res.fileId);
      setCoverPreview(res.url);
      setFormError("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_upload"));
    }
  };

  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateImageFile(file)) return;
    try {
      const res = await uploadImage.mutateAsync(file);
      setValue("content", `${getValues("content") || ""}![${res.name}](${res.url})\n`);
      setFormError("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_insert"));
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    try {
      await createArticle.mutateAsync({
        categoryId: Number(values.categoryId),
        title: values.title,
        summary: values.summary,
        content: values.content,
        coverImageFileId: coverFileId ?? undefined,
      });
      router.push("/articles/me");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_publish"));
    }
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("title_label")}</Label>
              <Input id="title" placeholder={t("title_placeholder")} {...register("title")} />
              {errors.title && <p className="text-sm text-red-600">{t("error_required")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("category")}</Label>
              <select
                id="category"
                className="border-border bg-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                {...register("categoryId")}
              >
                <option value="">{t("category_placeholder")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-sm text-red-600">{t("error_required")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">{t("summary")}</Label>
              <Textarea id="summary" placeholder={t("summary_placeholder")} rows={2} {...register("summary")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">{t("cover")}</Label>
              <Input id="cover" type="file" accept="image/*" onChange={handleImage} />
              {coverPreview && (
                <div className="relative mt-2 h-32 w-64 overflow-hidden rounded-lg">
                  <Image src={coverPreview} alt="cover" fill sizes="256px" className="object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("content")}</Label>
              <Textarea id="content" rows={12} placeholder={t("content_placeholder")} {...register("content")} />
              {errors.content && <p className="text-sm text-red-600">{t("error_required")}</p>}
              <Label className="text-primary inline-flex cursor-pointer items-center gap-2 text-sm">
                <Input type="file" accept="image/*" className="hidden" onChange={handleInsertImage} />
                {t("insertImage")}
              </Label>
            </div>
            {formError && (
              <p id="write-error" role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                {t("cancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
