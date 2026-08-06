"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, createArticle, uploadImage, WebCategory } from "@/lib/api";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverFileId, setCoverFileId] = useState<number | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [categories, setCategories] = useState<WebCategory[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations("write");

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setCoverFileId(res.fileId);
      setCoverPreview(res.url);
      setError("");
    } catch (err: any) {
      setError(err.message || t("error_upload"));
    }
  };

  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      const markdown = `![${res.name}](${res.url})\n`;
      setContent((c) => c + markdown);
      setError("");
    } catch (err: any) {
      setError(err.message || t("error_insert"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !categoryId || !content) {
      setError(t("error_required"));
      return;
    }
    setSubmitting(true);
    try {
      await createArticle({
        categoryId: Number(categoryId),
        title,
        summary,
        content,
        coverImageFileId: coverFileId ?? undefined
      });
      router.push("/articles/me");
    } catch (err: any) {
      setError(err.message || t("error_publish"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("title_label")}</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title_placeholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("category")}</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("category_placeholder")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">{t("summary")}</Label>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("summary_placeholder")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">{t("cover")}</Label>
              <Input id="cover" type="file" accept="image/*" onChange={handleImage} />
              {coverPreview && (
                <div className="relative mt-2 h-32 w-64 overflow-hidden rounded-lg">
                  <Image src={coverPreview} alt="cover" fill sizes="256px" className="object-cover" unoptimized />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("content")}</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder={t("content_placeholder")} />
              <Label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Input type="file" accept="image/*" className="hidden" onChange={handleInsertImage} />
                {t("insertImage")}
              </Label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                {t("cancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
