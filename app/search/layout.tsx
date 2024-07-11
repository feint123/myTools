import { EditSidenav } from "@/components/edit-sidenav";
import { Suspense } from "react";

export default function EditToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
        <main className="flex flex-col items-center w-full">
          <div className="inline-block max-w-screen-xl w-full">
              {children}
          </div>
        </main>
      </section>
  );
}
