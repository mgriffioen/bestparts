import type { Metadata } from "next";
import Link from "next/link";
import HeaderPrimaryActions from "@/components/HeaderPrimaryActions";
import { getCurrentUser } from "@/lib/auth/current-user";
import "./globals.css";

export const metadata: Metadata = {
  title: "bestparts.biz",
  description:
    "A collection of the best parts from movies.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen antialiased">
        <header className="border-b border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="group flex shrink-0 items-center gap-2 self-start">
              <span className="text-2xl font-black leading-none tracking-tight text-white transition-colors group-hover:text-yellow-400">
                best<span className="text-yellow-400 group-hover:text-white transition-colors">parts</span>.biz
              </span>
            </Link>
            <HeaderPrimaryActions currentUser={currentUser} />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-neutral-800 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-neutral-600 text-sm">
            bestparts.biz | mark griffioen |{" "}
            <a
              href="https://seanzach.com"
              className="transition-colors hover:text-neutral-300"
            >
              sean wolter
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
