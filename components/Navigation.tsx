import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/amenities", label: "Amenities" },
  { href: "/units", label: "Units" },
  { href: "/book", label: "Book" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export default function Navigation() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          La Casa Oaxaca
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/book" className="rounded-full bg-garden px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
          Book direct
        </Link>
      </div>
    </header>
  );
}
