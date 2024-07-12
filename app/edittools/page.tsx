"use client"



import { useSearchParams } from "next/navigation";
import ToolsDetail from "@/components/tools-detail";



export default function EditToolsPage() {

  function EditArea() {
    const params = useSearchParams()
    const toolId = params.get("toolId")

    return (<div className="pt-0">
      <ToolsDetail toolsId={toolId ?? ""} />
    </div>)

  }

  return (
      <EditArea />
  )
}
