import { Spinner } from "@nextui-org/react";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return <div className="h-full w-full items-center flex justify-center"><Spinner /></div>
  }