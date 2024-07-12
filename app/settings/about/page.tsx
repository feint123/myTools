"use client";
import { Button, Avatar, Code } from "@nextui-org/react";
import { AiFillBilibili, AiFillGithub } from "react-icons/ai";
import { open as openLink } from "@tauri-apps/plugin-shell";

interface ToolsSource {
  id: number | undefined;
  source_id: string | undefined;
  name: string | undefined;
  url: string | undefined;
  version: number | undefined;
  last_sync: string | undefined;
}

interface ToolsItem {
  id: number | undefined;
  title: string | undefined;
  description: string | undefined;
  target_url: string | undefined;
  categorys: [string] | undefined;
  preview_image_url: [string] | undefined;
  content: string | undefined;
  tool_type: string | undefined;
}
export default function AboutPage() {

  return (<div className="flex flex-col gap-4 justify-center items-center">
    <div className="gap-2">
      <Avatar isBordered className="w-20 h-20 text-large mb-2" src={"/logo@0.5x.png"} />
      <p className="text-foreground-500">myTools</p>

      <p className="text-foreground-500 text-sm">v 0.0.1 alpha</p>
    </div>

    <p className="text-foreground-500">
      一个可配置的工具箱，旨在帮助用户快速找到<Code color="success" className="mx-1" size="sm">免费</Code>的工具。<br/>
      欢迎大家分享工具，一起打造一个好用的工具箱。<br/>
      使用过程中遇到问题，可以在仓库中提交
      <Code onClick={() => { openLink("https://github.com/feint123/myTools/issues") }} className="mx-1 cursor-pointer" size="sm">Issues</Code>。
    </p>

    <div className="flex flex-row gap-2 justify-center">
      <Button startContent={<AiFillGithub className="text-lg" />} radius="full" size="sm"  
        className="bg-black dark:bg-gray-100  text-default-100" 
        onClick={() => { openLink("https://github.com/feint123/myTools") }}>仓库地址</Button>
      <Button startContent={<AiFillBilibili className="text-lg" />} color="danger" size="sm" radius="full"
        onClick={() => { openLink("https://space.bilibili.com/14270614") }}>求关注</Button>
    </div>

  </div>)
}
