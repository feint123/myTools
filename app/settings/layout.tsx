"use client"
export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-0">
      <div className="inline-block w-full text-center justify-center">
        {children}
      </div>
    </section>
  );
}
