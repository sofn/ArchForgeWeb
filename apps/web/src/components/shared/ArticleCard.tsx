import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WebArticleSummary } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { Link } from "../../../i18n/navigation";

export function ArticleCard({ article }: { article: WebArticleSummary }) {
  return (
    <Link href={`/articles/${encodeURIComponent(article.slug)}`} className="group block h-full">
      <Card className="border-slate-200/60 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <span className="text-4xl font-bold text-slate-300 dark:text-slate-700">
                {article.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-indigo-600 shadow-sm backdrop-blur">
            {article.categoryName}
          </span>
        </div>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="line-clamp-2 text-lg leading-snug transition-colors group-hover:text-indigo-600">
            {article.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 pt-2 text-xs">
            <span>{formatDateTime(article.publishTime)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{article.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
