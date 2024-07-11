import { Suspense } from "react";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="max-w-screen-xl w-full text-center justify-center">
        <Suspense>
          {children}
        </Suspense>
      </div>
    </section>
  );
}
