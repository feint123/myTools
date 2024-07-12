"use client"

import { WebsiteCard } from "@/components/website-card";
import {  Tab, Tabs } from "@nextui-org/react";
import { AsyncListData, AsyncListLoadOptions, useAsyncList } from "@react-stately/data";
import { AiOutlineAudio, AiOutlineCode, AiOutlineContainer, AiOutlineDash, AiOutlineFileImage, AiOutlineFileWord, AiOutlineInbox, AiOutlineOpenAI, AiOutlinePlayCircle, AiOutlineRobot, AiOutlineVideoCamera } from "react-icons/ai";

import { ToolsItem } from "../settings/page";
import { invoke } from "@tauri-apps/api/core";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { TabIcon } from "@/components/tab-icon";


interface SoftwareItem {
  category: string,
  items: ToolsItem[]
}
export default function SoftwarePage() {
  // const params = useSearchParams()
  const toolType = "app"
  const tools: AsyncListData<ToolsItem> = useAsyncList({
    async load(state: AsyncListLoadOptions<ToolsItem, string>) {
      let result: ToolsItem[] = []
      try {
        result = await invoke("get_source_items_by_type", { toolType: toolType })
      } catch (err) {
        console.log(err)
      }
      return {
        items: result
      }

    },
  })


  // 根据categorys分组
  const groupedData = Object.entries(tools.items.reduce<Record<string, ToolsItem[]>>((acc, item) => {
    item.categorys?.forEach(category => {
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
    });
    return acc;
  }, {})).map(([category, items]) => ({ category, items }));


  function websiteCards(items: ToolsItem[]) {
    return items.map((tool) => (
      <div key={tool.id} >
        <WebsiteCard param={tool} />
      </div>
    ))
  }

  //get_source_items_by_type

  return (
    <motion.div layout className="pb-8">
      <Tabs aria-label="Options" isVertical={true} items={groupedData} classNames={{"tab":"text-left"}}>
        {
        (item: SoftwareItem) =>  (
           <Tab key={item.category} title={<div className="flex items-center space-x-2">
              <TabIcon category={item.category}/>
              <span>{item.category}</span>
            </div>}>
              <div className="w-full grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-4">
                {websiteCards(item.items)}
              </div>
            </Tab>
          )
        }
      </Tabs>
    </motion.div>



  );
}
