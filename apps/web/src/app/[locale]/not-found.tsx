import { getTranslations } from "next-intl/server";
import { Link } from "../../../i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mt-3 max-w-md">{t("not_found")}</p>
      <Link href="/" className="text-primary mt-6 font-medium hover:underline">
        {t("back_home")}
      </Link>
    </div>
  );
}
