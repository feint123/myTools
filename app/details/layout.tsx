"use client"
import { ScrollWrapper } from "@/components/scroll-wrapper";
import { ScrollShadow } from "@nextui-org/react";
import { Suspense } from "react";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <ScrollWrapper>
        <div className="max-w-screen-xl w-full text-center justify-center">
          <Suspense>
            {children}
          </Suspense>
        </div>
      </ScrollWrapper>
    </section>
  );
}
