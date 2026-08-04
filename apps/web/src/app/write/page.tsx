"use client";

import { useEffect, useState } from "react";
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
      setError(err.message || "图片上传失败");
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
      setError(err.message || "图片插入失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !categoryId || !content) {
      setError("请填写标题、分类和内容");
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
      setError(err.message || "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>写文章</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">请选择</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="选填" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">封面图</Label>
              <Input id="cover" type="file" accept="image/*" onChange={handleImage} />
              {coverPreview && <img src={coverPreview} alt="cover" className="mt-2 h-32 rounded-lg object-cover" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">正文（Markdown）</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="支持 Markdown 语法" />
              <Label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Input type="file" accept="image/*" className="hidden" onChange={handleInsertImage} />
                插入图片
              </Label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                取消
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "发布中..." : "发布"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
