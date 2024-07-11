"use client"


import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { AiOutlineAppstore, AiOutlineAudio, AiOutlineBug, AiOutlineCloud, AiOutlineCode, AiOutlineFileWord, AiOutlineInbox, AiOutlinePicture, AiOutlineRobot, AiOutlineVideoCamera } from "react-icons/ai";
import { ConfigProvider, theme, Upload, UploadProps } from "antd";

import { RcFile, UploadFile } from "antd/es/upload";
import ImgCrop from 'antd-img-crop';
import { ToolsItem } from "@/app/settings/page";
import { invoke } from "@tauri-apps/api/core";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { useRouter } from "next/navigation";


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
    <div className="flex flex-col gap-0 w-full bg-default-100 rounded-medium shadow-sm px-3 py-2">
      {children}
    </div>
  )
}


export default function EditToolsEditPage() {
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

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setCoverFileList(newFileList);

  const handlePreviewChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setPreviewFileList(newFileList);


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
    if (file && file.originFileObj) {
      coverUrl = await getBase64(file.originFileObj) as string;
    }
    let previewUrls: string[] = []
    for (let i = 0; i < previewFileList.length; i++) {
      let previewFile = previewFileList[i]
      if (previewFile && previewFile.originFileObj) {
        let url = await getBase64(previewFile.originFileObj) as string;
        previewUrls.push(url)
      }
    }
    let targetUrlC = targetUrl.trim()
    if (targetUrlC.startsWith("http://")) {
      targetUrlC.replace("http://", "https://")
    } else if (targetUrlC.includes("https://")) {
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
    }


    try {
      let id = await invoke("save_local_source_item", { sourceItem: toolsItem });
      setIsSubmitLoading(false)
      router.push(`/edittools?toolId=${id}`)
      location.reload()
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <form className="flex flex-col gap-4 w-full">
      <Input isRequired type="text" size="lg" label="标题" placeholder="请输入标题"
        errorMessage="标题不能为空"
        isInvalid={title.trim().length == 0 && pressSubmit} value={title} onValueChange={setTitle} />
      <FileUploaderWrapper>
        <p className="text-xs text-foreground-500 font-bold">封面</p>
        <ConfigProvider theme={{ algorithm: antTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>

          <ImgCrop modalClassName="backdrop-blur-md" aspect={3 / 2} modalOk="确定" zoomSlider modalCancel="取消">
            <Upload
              action={getBase64}
              listType="picture-card"
              fileList={coverFileList}
              onChange={handleChange}
              accept="image/*"
              className="mt-2"
              showUploadList={{ "showPreviewIcon": false }}
            >
              {coverFileList.length >= 1 ? null : '+ 上传'}
            </Upload>
          </ImgCrop>
        </ConfigProvider>
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
        <p className="text-xs text-foreground-500 font-bold">预览图</p>
        <ConfigProvider theme={{ algorithm: antTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
          <ImgCrop modalClassName="backdrop-blur-md" aspect={3 / 2} modalOk="确定" zoomSlider modalCancel="取消">
            <Upload
              action={getBase64}
              listType="picture-card"
              fileList={previewFileList}
              onChange={handlePreviewChange}
              accept="image/*"
              className="mt-2"
              showUploadList={{ "showPreviewIcon": false }}
            >
              {coverFileList.length >= 16 ? null : '+ 上传'}
            </Upload>
          </ImgCrop>
        </ConfigProvider>
      </FileUploaderWrapper>
      <Textarea
        minRows={8}
        value={content}
        onValueChange={setContent}
        isRequired
        label="详细说明"
        placeholder="请详细描述下这个站点的优缺点"
        errorMessage="内容不能为空"
        isInvalid={content.trim().length == 0 && pressSubmit}
      />
      <Button color="primary" variant="flat" onClick={submitTools} isLoading={isSubmitLoading}>保存</Button>

    </form>
  );
}
