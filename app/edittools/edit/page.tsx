"use client"


import { Button, Input, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { AiOutlineAppstore, AiOutlineAudio, AiOutlineBug, AiOutlineCloud, AiOutlineCode, AiOutlineFileWord, AiOutlineInbox, AiOutlinePicture, AiOutlineRobot, AiOutlineVideoCamera } from "react-icons/ai";
import { ConfigProvider, theme, Upload, UploadProps } from "antd";

import { RcFile, UploadFile } from "antd/es/upload";
import { ToolsItem } from "@/app/settings/page";
import { invoke } from "@tauri-apps/api/core";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { listen, TauriEvent, UnlistenFn } from "@tauri-apps/api/event";
import { useRouter, useSearchParams } from "next/navigation";
import { boldCommand, imageCommand, italicCommand, linkCommand, useTextAreaMarkdownEditor } from "react-headless-mde";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css"
import { motion } from "framer-motion";




const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    }
    reader.onerror = (error) => {
      console.log(error)
      reject(error);
    }
  });




function isValidUrl(url: string): boolean {
  url = url.trim();
  if (url.length == 0) {
    return false
  }
  if (!url.startsWith("http://") || !url.startsWith("https://")) {
    url = "https://" + url
  }
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}


export type SelectType = 'all' | Iterable<string | number> | undefined

function FileUploaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0 w-full bg-default-100 rounded-medium shadow-sm px-3 py-2 mb-2">
      {children}
    </div>
  )
}


export default function EditToolsEditPage() {
  const params = useSearchParams()
  const toolId = params.get("toolId")
  const categorys = [{ name: "音频", icon: (<AiOutlineAudio />) }, { name: "视频", icon: (<AiOutlineVideoCamera />) },
  { name: "图片", icon: (<AiOutlinePicture />) }, { name: "AI", icon: (<AiOutlineRobot />) },
  { name: "编程", icon: (<AiOutlineCode />) }, { name: "文档", icon: (<AiOutlineFileWord />) },
  { name: "聚合", icon: (<AiOutlineInbox />) }, { name: "其他", icon: (<AiOutlineBug />) }]
  const toolTypes = [{ name: "App", value: "app", icon: (<AiOutlineAppstore />) }, { name: "网站", value: "web", icon: (<AiOutlineCloud />) }]
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);
  const [previewFileList, setPreviewFileList] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [pressSubmit, setPressSubmit] = useState(false);
  const [content, setContent] = useState<string>("")
  const [selectToolTypes, setSelectToolTypes] = useState<SelectType>()
  const [selectToolCates, setSelectToolCates] = useState<SelectType>()
  const [targetUrl, setTargetUrl] = useState<string>("")
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [antTheme, setAntdTheme] = useState("light");

  const router = useRouter()
  useEffect(() => {
    getCurrent().theme().then(theme => {
      setAntdTheme(theme as string)
    })
    listen(TauriEvent.WINDOW_THEME_CHANGED, (event) => {
      if (typeof event.payload === "string") {
        setAntdTheme(event.payload)
      }
    });
  }, [setAntdTheme])

  const submitTools = async () => {
    setPressSubmit(true)
    if (title.trim().length == 0 || content.trim().length == 0
      || description.trim().length == 0 || targetUrl.trim().length == 0
      || selectToolTypes == undefined || selectToolCates == undefined || !isValidUrl(targetUrl)) {
      return
    }
    setIsSubmitLoading(true)
    let coverUrl = ""
    let file = coverFileList[0]
    if (file && !file.url && file.originFileObj) {
      coverUrl = await getBase64(file.originFileObj) as string;
    } else if (file) {
      coverUrl = file.url ?? ""
    }
    let previewUrls: string[] = []
    for (let i = 0; i < previewFileList.length; i++) {
      let previewFile = previewFileList[i]
      let url = ""
      if (previewFile && previewFile.originFileObj && !previewFile.url) {
        url = await getBase64(previewFile.originFileObj) as string;
      } else if (previewFile) {
        url = previewFile.url ?? ""
      }
      previewUrls.push(url)
    }
    let targetUrlC = targetUrl.trim()
    if (targetUrlC.startsWith("http://")) {
      targetUrlC.replace("http://", "https://")
    } else if (!targetUrlC.includes("https://")) {
      targetUrlC = "https://" + targetUrlC;
    }
    const toolsItem: ToolsItem = {
      id: 0,
      title: title.trim(),
      description: description.trim(),
      target_url: targetUrlC,
      categorys: Array.from(selectToolCates).map(item => item.toString()),
      content: content.trim(),
      cover_image_url: coverUrl,
      preview_image_url: previewUrls,
      tool_type: Array.from(selectToolTypes).map(item => item.toString())[0],
      author: "hello",
      tools_source_id: "",
    }


    try {
      let id = await invoke("save_local_source_item", { sourceItem: toolsItem });
      setIsSubmitLoading(false)
      router.push(`/edittools?toolId=${id}`)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (toolId) {
      invoke<ToolsItem[]>("get_source_item_by_id", { itemId: Number.parseInt(toolId) })
        .then((result: ToolsItem[]) => {
          if (result && result.length > 0) {
            setTitle(result[0].title ?? "")
            setDescription(result[0].description ?? "")
            setContent(result[0].content ?? "")
            setTargetUrl((result[0].target_url ?? "").replace("https://", ""))
            setSelectToolTypes(Array.of(result[0].tool_type as string))
            setSelectToolCates(result[0].categorys)
            setCoverFileList([{
              uid: '0',
              name: `image.png`,
              status: 'done',
              url: result[0].cover_image_url,
            }])
            let previewImageUrls = result[0].preview_image_url
            let previewImages: UploadFile[] = []
            if (previewImageUrls && previewImageUrls.length > 0) {
              for (let i = 0; i < previewImageUrls.length; i++) {
                previewImages.push({
                  uid: `${i}`,
                  name: `image-${i}.png`,
                  status: 'done',
                  url: previewImageUrls[i],
                })
              }
            }
            setPreviewFileList(previewImages)
          }
        }).catch(e => {
          console.log(e)
        })
    }
    let uninstalSave: UnlistenFn;
    listen("SAVE_TOOLS_INFO", (e) => {
      submitTools()
    }).then(fn => {
      uninstalSave = fn
    })
    return () => {
      if (uninstalSave) {
        uninstalSave()
      }
    }
  }, [setTitle, setDescription, setContent, setTargetUrl, setSelectToolTypes, setSelectToolCates,
    setCoverFileList, setPreviewFileList, toolId, submitTools
  ])

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setCoverFileList(newFileList);

  const handlePreviewChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setPreviewFileList(newFileList);

  async function createMenu(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()

    let linkItem = await MenuItem.new({
      text: "添加链接",
      accelerator: "CmdOrCtrl+Shift+L",
      action: () => {
        commandController.executeCommand('link');
      }
    })

    let imageItem = await MenuItem.new({
      text: "插入图片",
      accelerator: "CmdOrCtrl+Shift+I",
      action: () => {
        commandController.executeCommand('image');
      }
    })
    let boldItem = await MenuItem.new({
      text: "加粗",
      accelerator: "CmdOrCtrl+Shift+B",
      action: () => {
        commandController.executeCommand('bold');
      }
    })
    let menu = await Menu.new({
      items: [linkItem, imageItem, boldItem]
    });
    menu.popup()
  }




  const { ref, commandController } = useTextAreaMarkdownEditor({
    commandMap: {
      bold: boldCommand,
      italic: italicCommand,
      link: linkCommand,
      image: imageCommand,
    },
  });

  return (

    <form className="flex flex-col gap-4">
      {/* <Button color="primary" variant="faded" onClick={submitTools} isLoading={isSubmitLoading} className="sticky top-0">保存</Button> */}
      <div className="grid lg:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-2">
        <div className="flex flex-col gap-2 w-full">
          <Input isRequired type="text" size="lg" label="标题" placeholder="请输入标题"
            errorMessage="标题不能为空"
            isInvalid={title.trim().length == 0 && pressSubmit} value={title} onValueChange={setTitle} />
          <FileUploaderWrapper>
            <p className="text-xs text-default-600">封面</p>
            <ConfigProvider theme={{ algorithm: antTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>

              {/* <ImgCrop modalClassName="backdrop-blur-md" aspect={3 / 2} modalOk="确定" zoomSlider modalCancel="取消"> */}
              <Upload
                action={getBase64}
                listType="picture-card"
                fileList={coverFileList}
                onChange={handleChange}
                accept="image/*"
                className="my-2"
                showUploadList={{ "showPreviewIcon": false }}
              >
                {coverFileList.length >= 1 ? null : '+ 上传'}
              </Upload>
              {/* </ImgCrop> */}
            </ConfigProvider>
            <p className="text-xs text-foreground-400 text-right">尺寸：600x400；格式：webp</p>
          </FileUploaderWrapper>
          <Input isRequired type="text" label="描述" placeholder="请输入描述,10~30个字左右"
            errorMessage="描述不能为空"
            isInvalid={description.trim().length == 0 && pressSubmit} value={description} onValueChange={setDescription} />
          <Input isRequired type="url" label="工具地址" placeholder="www.abc.com" startContent={<span className="text-default-400 text-small">https://</span>}
            value={targetUrl} onValueChange={setTargetUrl} isInvalid={!isValidUrl(targetUrl) && pressSubmit}
            errorMessage="请输入正确的网址" />

          <div className="flex flex-row gap-4">
            <Select
              isRequired
              label="类型"
              selectionMode="single"
              placeholder="请选择工具类型"
              selectedKeys={selectToolTypes}
              onSelectionChange={setSelectToolTypes}
              errorMessage="工具类型是必选的哦"
              isInvalid={selectToolTypes == undefined && pressSubmit}
              items={toolTypes}
            >
              {
                item => {
                  return <SelectItem key={item.value} startContent={item.icon}>
                    {item.name}
                  </SelectItem>
                }
              }
            </Select>
            <Select
              isRequired
              label="分类"
              selectionMode="multiple"
              placeholder="请选择一个分类"
              selectedKeys={selectToolCates}
              onSelectionChange={setSelectToolCates}
              errorMessage="请至少选择一个分类"
              isInvalid={selectToolCates == undefined && pressSubmit}
              items={categorys}
            >
              {
                item => {
                  return <SelectItem startContent={item.icon} key={item.name}>
                    {item.name}
                  </SelectItem>
                }
              }
            </Select>
          </div>
          <FileUploaderWrapper>
            <p className="text-xs text-default-600">预览图</p>
            <ConfigProvider theme={{ algorithm: antTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
              {/* <ImgCrop modalClassName="backdrop-blur-md" fillColor="none" aspect={3 / 2} modalOk="确定" zoomSlider modalCancel="取消"> */}
              <Upload
                action={getBase64}
                listType="picture-card"
                fileList={previewFileList}
                onChange={handlePreviewChange}
                accept="image/*"
                className="my-2"
                showUploadList={{ "showPreviewIcon": false }}
              >
                {coverFileList.length >= 16 ? null : '+ 上传'}
              </Upload>
              {/* </ImgCrop> */}
            </ConfigProvider>
            <p className="text-xs text-foreground-400 text-right">尺寸：1200x800；格式：webp</p>
          </FileUploaderWrapper>
        </div>
        <div className="2xl:grid 2xl:grid-cols-2 xl:flex xl:flex-col gap-2 2xl:col-span-2">
          <Textarea
            value={content}
            onValueChange={setContent}
            isRequired
            minRows={8}
            label="工具内容"
            placeholder="请输入有用的描述"
            errorMessage="内容不能为空"
            isInvalid={content.trim().length == 0 && pressSubmit}
            ref={ref}
            onContextMenu={(e) => { createMenu(e) }}
            classNames={{
              input: "resize-y min-h-[40px]",
            }}
            description="可以补充工具的优缺点、使用教程或是功能点等信息"
          />

          <Markdown remarkPlugins={[remarkGfm]} className="markdown-body bg-default-100 rounded-medium min-h-40
           px-3 py-2 text-wrap break-words border-small border-default-100">
            {content}
          </Markdown>
        </div>

      </div>
    </form>
  );
}
