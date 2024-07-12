"use client"
import { EditSidenav } from "@/components/edit-sidenav";
import { ScrollShadow } from "@nextui-org/react";
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
          <EditSidenav />
        </Suspense>
      </aside>
      <ScrollShadow orientation="vertical" className="h-[calc(100vh-52px)] w-[calc(100vw-300px)] fixed px-8 py-4
        top-[52px] left-[300px] flex flex-col items-center">
        <main className="max-w-screen-xl w-full pt-2">
          {children}
        </main>
      </ScrollShadow>
    </section>
  );
}
