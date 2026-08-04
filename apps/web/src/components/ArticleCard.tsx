import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WebArticleSummary, formatDateTime } from "@/lib/api";

export function ArticleCard({ article }: { article: WebArticleSummary }) {
  return (
    <Link href={`/articles/${encodeURIComponent(article.slug)}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md overflow-hidden">
        {article.coverImageUrl ? (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : null}
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg group-hover:text-primary">{article.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <span>{article.categoryName}</span>
            <span>·</span>
            <span>{formatDateTime(article.publishTime)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
