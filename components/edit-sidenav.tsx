"use client"

import React, { useEffect, useMemo, useState } from "react";
import { Button, Link, Listbox, ListboxItem, Avatar, Modal, ModalContent, ModalHeader, ModalBody, Table, TableHeader, TableColumn, TableBody, Spinner, TableRow, TableCell, ModalFooter, useDisclosure, ScrollShadow } from "@nextui-org/react";
import { AsyncListData, AsyncListLoadOptions, useAsyncList } from "@react-stately/data";
import { ToolsItem } from "@/app/settings/page";
import { invoke } from "@tauri-apps/api/core";
import { AiOutlineExport, AiOutlinePlus } from "react-icons/ai";
import { useSearchParams } from "next/navigation";
import { SelectType } from "@/app/edittools/edit/page";


export const EditSidenav = () => {
  const tools: AsyncListData<ToolsItem> = useAsyncList({
    async load(state: AsyncListLoadOptions<ToolsItem, string>) {
      let result: ToolsItem[] = await invoke("get_source_item", { id: "" })
      return {
        items: result
      }

    },
  })

  const { isOpen: isToolsOpen, onOpen: onToolsOpen, onOpenChange: onToolsOpenChange } = useDisclosure();
  function ToolsListModal() {
    const [selectedSource, setSelectedSource] = useState<SelectType>()

    const [isToolsLoading, setIsToolsLoading] = useState(true);
    let toolsList: AsyncListData<ToolsItem> = useAsyncList({
      async load(state: AsyncListLoadOptions<ToolsItem, string>) {

        if (isToolsOpen) {
          let result: ToolsItem[] = await invoke("get_source_item", { id: "" })
          setIsToolsLoading(false)
          return {
            items: result
          }
        } else {
          return {
            items: []
          }
        }
      }
    })

    function exportData() {
      invoke("export_tools", {})
    }


    return (
      <>
        <Modal isOpen={isToolsOpen} onOpenChange={onToolsOpenChange} size="2xl" backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">导出</ModalHeader>
                <ModalBody>
                <ScrollShadow hideScrollBar orientation="vertical" className="h-[calc(100vh-280px)]">
                  <Table shadow="none" isHeaderSticky isStriped aria-label="tools source table" selectionMode="multiple"
                    selectedKeys={selectedSource}
                    onSelectionChange={setSelectedSource} className="text-left"
                  >
                    <TableHeader>
                      <TableColumn allowsSorting>标题</TableColumn>
                      <TableColumn >简介</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"你还有添加任何工具哟"} items={toolsList.items}
                      isLoading={isToolsLoading}
                      loadingContent={<Spinner label="Loading..." />}>
                      {
                        (item: ToolsItem) => {
                          return (<TableRow key={item.target_url}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <p className="truncate">{item.description}</p>
                                <p className="text-xs text-foreground-500">{item.target_url}</p>
                              </div></TableCell>
                          </TableRow>)
                        }
                      }

                    </TableBody>
                  </Table>
                  </ScrollShadow>
                </ModalBody>
                <ModalFooter>
                  <Button startContent={<AiOutlineExport />} color="default" size="sm" variant="flat" onClick={exportData}>导出</Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )
  }
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-row gap-2 justify-start p-2 border-b border-default-200">
        <Button startContent={<AiOutlinePlus />} color="default" size="sm" variant="flat" as={Link} href="/edittools/edit">新建</Button>
        <Button startContent={<AiOutlineExport />} color="default" size="sm" variant="flat" onClick={onToolsOpen}>导出</Button>
      </div>
    )
  }, [onToolsOpen])

  const params = useSearchParams();
  const [selectedToolId, setSelectedToolId] = useState<SelectType>()
  useEffect(() => {
    const toolId = params.get("toolId")
    if (toolId) {
      setSelectedToolId(toolId)
    }
  }, [setSelectedToolId, params])
  return (
    <div>
      <ToolsListModal />
      <Listbox topContent={topContent} label="工具列表" emptyContent="没有工具哦" className="rounded-tr-lg bg-default-100 shadow h-[calc(100vh-64px)]"
        selectedKeys={selectedToolId} onSelectionChange={setSelectedToolId} selectionMode="single" items={tools.items}
        classNames={{
          list: "max-h-[calc(100vh-64px)] overflow-scroll",
        }}>
        {
          (item: ToolsItem) => {
            return (
              <ListboxItem textValue={item.title} key={item.id ?? 0} href={`/edittools?toolId=${item.id}`} >
                <div className="flex gap-2 items-center">     
                  <Avatar alt={item.title} className="flex-shrink-0" size="sm" src={item.cover_image_url} />

                  <div className="flex flex-col text-left w-full truncate">
                    <span className="text-small truncate">{item.title}</span>
                    <span className="text-tiny text-default-400 truncate">{item.description}</span>
                  </div>
                </div>
              </ListboxItem>
            )
          }
        }
      </Listbox>
    </div>


  );
}