import { EditSidenav } from "@/components/edit-sidenav";
import { Suspense } from "react";

export default function EditToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
        <aside className="col-span-2 fixed top-[64px] left-0 w-[300px] h-full">
          <Suspense>
            <EditSidenav/>
          </Suspense>
        </aside>
        <main className="w-[calc(100vw-300px)] absolute p-8 top-[64px] left-[300px] flex flex-col items-center">
          <div className="inline-block max-w-screen-xl w-full">
              {children}
          </div>
        </main>
      </section>
  );
}
