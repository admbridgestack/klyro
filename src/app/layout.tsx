// Root layout required by Next.js App Router.
// All locale-specific routes are handled by app/[locale]/layout.tsx,
// which provides the <html> and <body> elements.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
