export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
    <div className="max-w-screen-xl text-center justify-center">
      {children}
    </div>
  </section>
  );
}
