/* Note: This bare root layout fixes a redirect() bug when redirecting
   between layouts which do not share a parent (e.g., when there only
   exists layouts in the (app) and (marketing) groups). This layout
   should not be required in the future. */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
