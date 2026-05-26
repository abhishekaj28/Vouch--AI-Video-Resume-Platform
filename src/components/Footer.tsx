import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border" style={{ backgroundColor: "#111318" }}>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              See the person, not the paper. AI-powered video screening that ranks candidates by how they communicate.
            </p>
          </div>
          {[
            { title: "Product", items: ["How it works", "For Recruiters", "For Candidates", "Pricing"] },
            { title: "Company", items: ["About", "Careers", "Contact", "Blog"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="font-heading text-sm font-semibold text-white">{col.title}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {col.items.map((i) => (
                  <li key={i} className="cursor-pointer hover:text-white">{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© 2026 Vouch. See the person, not the paper.</div>
          <div className="flex gap-5">
            <span className="hover:text-white">Privacy</span>
            <span className="hover:text-white">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
