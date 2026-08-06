import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WebArticleSummary, formatDateTime } from "@/lib/api";

export function ArticleCard({ article }: { article: WebArticleSummary }) {
  return (
    <Link href={`/articles/${encodeURIComponent(article.slug)}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {article.coverImageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
          </div>
        ) : null}
        <CardHeader>
          <CardTitle className="group-hover:text-primary line-clamp-2 text-lg">
            {article.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <span>{article.categoryName}</span>
            <span>·</span>
            <span>{formatDateTime(article.publishTime)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 text-sm">{article.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
