/* Note: This bare root layout fixes a redirect() issue when redirecting
   between layouts which do not share a parent (e.g., when there only
   exists layouts in the (app) and (marketing) groups). As long as all
   children layouts have <html> and <body> tags, there should be no
   adverse behavior. */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
