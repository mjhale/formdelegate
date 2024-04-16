import '../globals.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-white bg-carnation-100">
        <div className="mx-auto my-4 w-full max-w-lg box-border">
          {children}
        </div>
      </body>
    </html>
  );
}
