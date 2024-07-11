"use client"


import { Accordion, AccordionItem, Button, Input, Image, Select, SelectItem, Tab, Tabs, Textarea } from "@nextui-org/react";
import { Suspense, useEffect, useState } from "react";
import { AiFillFileImage, AiOutlineAppstore, AiOutlineAudio, AiOutlineBug, AiOutlineCloud, AiOutlineCode, AiOutlineDotNet, AiOutlineFileWord, AiOutlineInbox, AiOutlinePicture, AiOutlinePlus, AiOutlineRobot, AiOutlineVideoCamera } from "react-icons/ai";
import { ConfigProvider, GetProp, theme, Upload, UploadProps } from "antd";

import { RcFile, UploadFile } from "antd/es/upload";
import ImgCrop from 'antd-img-crop';
import { ToolsItem } from "@/app/settings/page";
import { invoke } from "@tauri-apps/api/core";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { redirect, useRouter, useSearchParams } from "next/navigation";
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
    <Suspense fallback={<p>Loading feed...</p>}>
      <EditArea />
    </Suspense>
  )
}
