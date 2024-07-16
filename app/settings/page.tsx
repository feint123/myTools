"use client";
import { Button, Selection, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Snippet, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, useDisclosure, Chip, Spinner, ScrollShadow, Progress } from "@nextui-org/react";
import { SlOptionsVertical, SlRefresh } from "react-icons/sl";
import { AiOutlineCopy, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { CiCircleList, CiFileOn } from "react-icons/ci";
import { message, open } from "@tauri-apps/plugin-dialog";
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { invoke } from "@tauri-apps/api/core";
import moment from "moment";
import { AsyncListData, AsyncListLoadOptions, useAsyncList } from "@react-stately/data";
import { download } from "@tauri-apps/plugin-upload";
import { appDataDir } from "@tauri-apps/api/path";
import { emit } from "@tauri-apps/api/event";
import { UserEvents } from "@/config/userevent";

export interface ToolsSource {
  id: number | undefined;
  source_id: string | undefined;
  name: string | undefined;
  url: string | undefined;
  version: number | undefined;
  last_sync: string | undefined;
}

export interface ToolsItem {
  id: number | undefined;
  tool_id?: number | undefined;
  title: string | undefined;
  description: string | undefined;
  target_url: string | undefined;
  categorys: string[] | undefined;
  content: string | undefined;
  cover_image_url: string | undefined;
  preview_image_url: string[] | undefined;
  tool_type: string | undefined;
  author: string | undefined;
  tools_source_id: string | undefined;
}
export default function SettingsPage() {

  const [sourceList, setSourceList] = useState<Array<ToolsSource>>(new Array())
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isToolsOpen, onOpen: onToolsOpen, onOpenChange: onToolsOpenChange } = useDisclosure();
  const [currentSourceId, setCurrentSourceId] = useState<String | undefined>(undefined);

  useEffect(() => {
    // Perform your side effect here.
    // For example, fetch data from an API:
    fetchSource(setSourceList)
    // Clean up the side effect if necessary:
    return () => {
      // Code here will run on component unmount.
    };
  }, []);


  function fetchSource(setData: Dispatch<SetStateAction<ToolsSource[]>>) {
    invoke("get_all_source", {})
      .then((result) => {
        console.log(result)
        if (result instanceof Array) {
          setData(result)
        }
      })
      .catch((e) => {
        console.log(e)
      })
  }


  function ToolsListModal() {

    const [isToolsLoading, setIsToolsLoading] = useState(true);
    let toolsList: AsyncListData<ToolsItem> = useAsyncList({
      async load(state: AsyncListLoadOptions<ToolsItem, string>) {

        if (isToolsOpen) {
          console.log("source id", currentSourceId)
          let result: ToolsItem[] = await invoke("get_source_item", { id: currentSourceId })
          setIsToolsLoading(false)
          return {
            items: result
          }
        } else {
          return {
            items: []
          }
        }
      },

      async sort(state: AsyncListLoadOptions<ToolsItem, string>) {
        return {
          items: state.items.sort((a: ToolsItem, b: ToolsItem) => {
            let first = a["title"];
            let second = b["title"];
            let cmp = first ?? "" < (second ?? "") ? -1 : 1;

            if (state.sortDescriptor.direction === "descending") {
              cmp *= -1;
            }

            return cmp;
          }),
        };
      }
    })



    return (
      <>
        <Modal isOpen={isToolsOpen} onOpenChange={onToolsOpenChange} size="2xl" backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">工具列表</ModalHeader>
                <ModalBody>
                  <ScrollShadow hideScrollBar orientation="vertical" className="h-[360px]">
                    <Table shadow="none" isHeaderSticky isStriped aria-label="tools source table" className="text-left"
                      onSortChange={toolsList.sort} sortDescriptor={toolsList.sortDescriptor}>
                      <TableHeader>
                        <TableColumn allowsSorting>标题</TableColumn>
                        <TableColumn >简介</TableColumn>
                        <TableColumn>分类</TableColumn>

                      </TableHeader>
                      <TableBody emptyContent={"工具不存在"} items={toolsList.items}
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
                              <TableCell>

                                <div className="flex flex-row gap-1">
                                  {item.categorys?.map(cate => <Chip key={cate} size="sm" variant="flat" color="primary">{cate}</Chip>)}
                                </div>
                              </TableCell>
                            </TableRow>)
                          }
                        }

                      </TableBody>
                    </Table>
                  </ScrollShadow>
                </ModalBody>
                <ModalFooter>
                  {/* <Button color="danger" variant="flat" size="sm" onPress={onClose}>
                    关闭
                  </Button> */}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )
  }

  function AddSourceModal() {
    const [selectType, setSelectType] = useState<string | number | null | undefined>("1")
    const [filePath, setFilePath] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    async function chooseSourceFile() {
      await open({
        directory: false,
        multiple: false,
        title: '选择工具源配置文件',
        filters: [
          {
            name: 'JSON',
            extensions: ['json'],
          },
        ],
      }).then(async file => {
        if (file) {
          setFilePath(file.path);
        }
      });
    }
    /**
     * 加载在线源
     * @param onClose 
     * @param path 
     */
    async function downloadSource(onClose: () => void, url: string) {
      let appDataDirPath = await appDataDir()
      startLoading()
      let tempPath = appDataDirPath + "/temp.json"
      // 下载临时文件到appdata，（或者文件名使用url的md5值）
      download(url, tempPath, () => {
      }).then(() => {
        appendSource(onClose, 0, tempPath, url)
      }).catch(async (e)=>{
        await message(`下载工具源失败【${e}】`, { title: '工具源导入', kind: 'error' });
        finishLoading()
      })
    }
    /**
     * 加载本地源
     * @param onClose 
     * @param path 
     */
    function localSource(onClose: () => void, path: string) {
      startLoading()
      appendSource(onClose, 1, path, "")
    }

    function startLoading() {
      setIsLoading(true)
      emit(UserEvents.CHANGE_LOADING, { isLoading: true, tips: "正在导入工具源" })
    }

    function finishLoading() {
      setIsLoading(false)
      emit(UserEvents.CHANGE_LOADING, { isLoading: false, tips: "正在导入工具源" })
    }

    function appendSource(onClose: () => void,sourceType: number, path: string, url: string) {
      
      invoke("append_source", { "sourceType": sourceType, "path": path, "url": url })
        .then(async () => {
          fetchSource(setSourceList)
          await message(`导入工具源成功`, { title: '工具源导入', kind: 'info' });
        })
        .catch(async (e) => {
          await message(`导入工具源失败【${e}】`, { title: '工具源导入', kind: 'error' });
        })
        .finally(() => {
          finishLoading()
          onClose()
        });
    }
    return (
      <Modal isOpen={isOpen} backdrop="blur" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">添加工具源</ModalHeader>
              <ModalBody>
                <Tabs selectedKey={selectType} onSelectionChange={setSelectType}>
                  <Tab key="0" title="网络">
                    <div className="flex flex-col gap-4">
                      <Input startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">https://</span>
                        </div>
                      } type="url" label="源地址" placeholder="请输入你想添加的源"
                        value={sourceUrl} onValueChange={setSourceUrl} description="注意：下载过程中，请勿关闭设置窗口哦" />
                    </div>
                  </Tab>
                  <Tab key="1" title="本地">
                    <div className="flex flex-col gap-4">
                      {(filePath && filePath.length > 0) ?
                        <Snippet classNames={{ pre: "break-words line-clamp-1" }}>{filePath}</Snippet>
                        :
                        <></>
                      }
                      <Button variant="faded" startContent={<CiFileOn />} onClick={chooseSourceFile}>请选择文件</Button>
                    </div>

                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                {selectType as string === "0" ? (
                  <Button isLoading={isLoading} color="primary" variant="faded" size="sm" onClick={() => { downloadSource(onClose, sourceUrl) }}
                    isDisabled={!(sourceUrl && sourceUrl.length > 0)}>
                    添加
                  </Button>
                ) : (
                  <Button isLoading={isLoading} color="primary" variant="faded" size="sm" onClick={() => { localSource(onClose, filePath) }}
                    isDisabled={!(filePath && filePath.length > 0)}>
                    添加
                  </Button>
                )
                }

              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    )
  }


  function ToolSourcesSettings() {
    const [selectedSource, setSelectedSource] = useState<Selection>(new Set([]))
    function deleteSources() {
      let selectId: string[] = []
      if (selectedSource == 'all') {
        selectId = sourceList.map(item => item.source_id as string)
      } else {
        selectId = Array.from(selectedSource).map(item => item.toString())
      }
      deleteSourcesById(selectId)
    }

    function deleteSourcesById(sourceId: string[]) {
      invoke("delete_source", { "sourceIds": sourceId })
        .then(() => {
          fetchSource(setSourceList)
        })
        .catch((e) => {
          console.log(e)
        })
    }

    const topContent = useMemo(() => {
      return (
        <div className="flex flex-row gap-2 justify-end">
          <Button size="sm" variant="flat" startContent={<SlRefresh />} isDisabled>更新</Button>
          <Button size="sm" color="danger" variant="flat" startContent={<AiOutlineDelete />} onClick={deleteSources}>删除</Button>

          <Button color="primary" size="sm" variant="flat" startContent={<AiOutlinePlus />} onPress={onOpen}>
            新增
          </Button>
        </div>
      )
    }, [deleteSources, onOpen])

    function formatSyncTime(timestamp: string) {
      return moment.unix(Number.parseInt(timestamp) / 1000).format('YYYY-MM-DD HH:mm:ss'); // "2023-09-05 12:34:56"
    }
    return (
      <div className="w-full flex flex-col gap-4">
        <AddSourceModal />
        <ToolsListModal />
        <ScrollShadow hideScrollBar orientation="vertical" className="h-[480px]">

          <Table shadow="none" aria-label="tools source table" className="text-left w-full"
            selectedKeys={selectedSource}
            onSelectionChange={setSelectedSource}
            selectionMode="multiple"
            topContent={topContent}
          >
            <TableHeader>
              <TableColumn>名称</TableColumn>
              <TableColumn>源地址</TableColumn>
              <TableColumn>版本号</TableColumn>
              <TableColumn>上次同步时间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"没有任何的工具源"} items={sourceList}>
              {
                (item: ToolsSource) => {
                  return (<TableRow key={item.source_id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.url}</TableCell>
                    <TableCell><Chip size="sm" radius="sm">{item.version}</Chip></TableCell>
                    <TableCell>{formatSyncTime(item.last_sync ?? "")}</TableCell>
                    <TableCell>  <div className="relative flex justify-end items-center gap-2">
                      <Dropdown >
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <SlOptionsVertical className="text-default-300" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu disabledKeys={["update"]}>
                          <DropdownItem key="delete" startContent={<AiOutlineDelete />} onClick={() => { deleteSourcesById([item.source_id ?? ""]) }}>删除</DropdownItem>
                          <DropdownItem key="update" startContent={<SlRefresh />}>更新</DropdownItem>
                          <DropdownItem key="toolsList" startContent={<CiCircleList />} onClick={() => { setCurrentSourceId(item.source_id); onToolsOpen() }}>工具列表</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div></TableCell>
                  </TableRow>)
                }
              }

            </TableBody>
          </Table>
        </ScrollShadow>
      </div>
    )
  }

  return (
    <ToolSourcesSettings />
  );
}
