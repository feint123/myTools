import { ScrollShadow } from "@nextui-org/react";

export function ScrollWrapper({ children }: { children: React.ReactNode }) {
    return <ScrollShadow orientation="vertical" className="h-[calc(100vh-52px)] w-full fixed p-8
    top-[52px] justify-center flex">
        {children}
    </ScrollShadow>
}