"use client";

import RouteError from "@/components/boundaries/RouteError";

export default function LocaleError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} />;
}
