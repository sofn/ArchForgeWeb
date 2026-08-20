import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 font-sans">
        <h1 className="text-3xl font-bold">404</h1>
        <p>Page not found</p>
        <Link href="/en">Back home</Link>
      </body>
    </html>
  );
}
