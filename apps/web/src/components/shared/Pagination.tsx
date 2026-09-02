// Server component (no interactivity — plain Links). Keeping it out of the
// client graph lets server pages pass hrefFor closures directly (functions
// cannot cross the RSC serialization boundary) and drops its JS from the bundle.
// useTranslations is supported in Server Components by next-intl.
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (nextPage: number) => string;
}) {
  const t = useTranslations("common");
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        className={cn(buttonVariants({ variant: "outline" }), page <= 1 && "pointer-events-none opacity-50")}
        aria-disabled={page <= 1}
      >
        {t("previous")}
      </Link>
      <span className="text-muted-foreground text-sm">
        {t("page")} {page} / {last}
      </span>
      <Link
        href={hrefFor(Math.min(last, page + 1))}
        className={cn(buttonVariants({ variant: "outline" }), page >= last && "pointer-events-none opacity-50")}
        aria-disabled={page >= last}
      >
        {t("next")}
      </Link>
    </div>
  );
}
