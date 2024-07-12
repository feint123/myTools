"use client"


import { Input, Chip, Listbox, ListboxItem, ScrollShadow } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineArrowRight, AiOutlineDelete} from "react-icons/ai";
import { ToolsItem } from "@/app/settings/page";
import { invoke } from "@tauri-apps/api/core";
import { SlMagnifier } from "react-icons/sl";

export default function EditToolsPage() {
  const [searchKeywords, setSearchKeywords] = useState<string>("");
  const [searchResults, setSearchResults] = useState<ToolsItem[]>([]);
  function testSearch(inputValue: string) {
    setSearchKeywords(inputValue)
    invoke("search_tools", { keywords: inputValue }).then(result => {
      if (result && result instanceof Array) {
  
        let resultItemList = result.map((item: string) => {
          console.log(JSON.parse(item) as ToolsItem)
          return JSON.parse(item) as ToolsItem
        })
        setSearchResults(resultItemList)
      }
    }).catch(e => {
      console.log(e)
    })
  }

  function appendHistory(words:string) {
    if (histories.includes(words)) {
      let index = histories.indexOf(words)
      histories.splice(index, 1)
    }
    histories.unshift(words)
    localStorage.setItem("search-history", JSON.stringify(histories))
  }

  function clearHistory() {
    localStorage.setItem("search-history", JSON.stringify([]))
    setHistories([]) 
  }
  const [histories,setHistories] = useState<string[]>([])

  useEffect(() => {
    const data = localStorage.getItem("search-history");
    if (data) {
      setHistories(JSON.parse(data))
    }
  }, []);

  const bottomContent = useMemo(() => {
    return (<div className="pb-4 px-2 flex flex-col gap-2 w-full">
      <div className="flex flex-row justify-between gap-4">
        <p className="text-sm font-bold text-foreground-500 ml-2">历史搜索</p>
        <div className="flex gap-2 hover:bg-default-200 text-foreground-500 hover:text-foreground-700 
        rounded-full px-3 py-1 ease-in-out duration-300"
        onClick={clearHistory}
        ><AiOutlineDelete /><span className="text-xs">清空</span></div>
      </div>
      <ScrollShadow hideScrollBar orientation="horizontal">
        <div className="flex flex-row py-1">
          { histories.map(item =>
            (<Chip variant="flat" color="warning" key={item} className="mx-1 my-1" onClick={() => { testSearch(item) }}>{item}</Chip>)
          )}

        </div>
      </ScrollShadow>

    </div>)
  }, [histories])

  const emptyContent = useMemo(() => {
    return <div className="flex flex-col justify-center items-center mb-8 truncate">
      <p className="text-foreground truncate">没有搜索到和'{searchKeywords}'相关的结果</p>
      <p className="text-foreground-500 text-sm">请尝试在搜索框中输入更多的关键词</p>
    </div>
  }, [searchKeywords])

  const topContent = useMemo(() => {
    return (<Input placeholder="请输入关键词" isClearable size="lg" fullWidth startContent={<SlMagnifier />} value={searchKeywords}
      onValueChange={testSearch} classNames={{
        inputWrapper: "shadow-none bg-default-200 rounded-b-none rounded-t-xl"
      }} />)
  }, [searchKeywords, testSearch])
  return (
    <div>
      <div className="flex flex-col gap-2">

        <Listbox label="工具列表" emptyContent={searchKeywords.length > 0 ? emptyContent: (<div></div>)} variant="flat" className="rounded-xl bg-default-100 border-default-200 border-small"
          classNames={{
            list: "max-h-[calc(100vh-200px)] overflow-x-hidden overflow-y-auto px-2 py-1",
            base: "p-0"
          }}
          topContent={topContent}
          bottomContent={searchKeywords.length>0 ? (<></>) :bottomContent}
          items={searchResults} >
          {
            (item: ToolsItem) => {
              return (
                <ListboxItem endContent={<AiOutlineArrowRight className="text-default-400" />} textValue={item.title} className="px-3 py-2"
                  key={item.tool_id ?? 0} href={`/details?toolId=${item.tool_id}`} onPress={() => { appendHistory(searchKeywords) }}>
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-col text-left w-full truncate">
                      <span className="text-lg text-default-800 font-thin truncate">{item.title}</span>
                      <span className="text-tiny text-default-400 truncate">{item.description}</span>
                    </div>
                  </div>
                </ListboxItem>
              )
            }
          }
        </Listbox>



      </div>
    </div>
  )
}
