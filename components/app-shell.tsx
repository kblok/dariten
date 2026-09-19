import Link from "next/link";
import { DemoBanner } from "@/components/demo-banner";
import { NavLinks } from "@/components/nav-links";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
  { href: "/budgets", label: "Budgets" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-paper text-ink">
      <DemoBanner />
      <div className="flex min-h-[calc(100vh-42px)]">
        <aside className="hidden w-64 shrink-0 flex-col bg-forest-deep px-5 py-7 text-[#f4efe4] md:flex">
          <Link href="/" className="px-2">
            <p className="font-serif text-3xl tracking-tight">Quicken Demo</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#cfc4a8]">Personal ledger</p>
          </Link>
          <NavLinks links={[...links]} />
          <p className="mt-auto px-2 text-xs leading-5 text-[#b7c4bb]">
            Shared demo dataset. Balances include opening amounts plus every transaction.
          </p>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line bg-panel/80 px-4 py-3 md:hidden">
            <Link href="/" className="font-serif text-xl">
              Quicken Demo
            </Link>
          </header>
          <nav className="flex gap-2 overflow-x-auto border-b border-line bg-panel px-4 py-2 md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full px-3 py-1 text-sm text-muted">
                {link.label}
              </Link>
            ))}
          </nav>
          <main className="flex-1 px-4 py-6 md:px-10 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
