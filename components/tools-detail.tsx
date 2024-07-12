import { ToolsItem } from "@/app/settings/page"
import { Avatar, Button, Divider, Image } from "@nextui-org/react"
import { AsyncListData, AsyncListLoadOptions, useAsyncList } from "@react-stately/data"
import { invoke } from "@tauri-apps/api/core"
import { useMemo } from "react"
import { Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import 'swiper/css';
import 'swiper/css/navigation';
import { open } from "@tauri-apps/plugin-shell"

export default function ToolsDetail({toolsId}:{toolsId: string}) {
 
    const tools: AsyncListData<ToolsItem> = useAsyncList({
      async load(state: AsyncListLoadOptions<ToolsItem, string>) {
        let result: ToolsItem[] = []
        try {
          result = await invoke("get_source_item_by_id", { itemId: Number.parseInt(toolsId) })
        } catch (err) {
          console.log(err)
        }
        return {
          items: result
        }
  
      },
    })
  
  
  
    const swiperSlides = useMemo(() => tools.items[0]?.preview_image_url?.map((image, index) => (
      <SwiperSlide key={index} className="item-center justify-center align-center">
        <Image
          removeWrapper
          className="w-full h-full "
          alt="NextUI hero Image with delay"
          src={image}
        />
      </SwiperSlide>
  
    )), [tools])
  
  
    const categorySections = []
  
  
    function openOnBroswer(target_url: string | undefined) {
      if (target_url) {
        open(target_url);
      }
    }
  
    return (
      tools.items[0] ? (
      <div className="w-full pb-8">
        <div className="flex flex-row mb-8 gap-4 justify-between text-left">
          <Avatar size="lg" isBordered radius="lg" className="min-w-[64px] h-[64px]" src={tools.items[0]?.cover_image_url} />
  
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-semibold">{tools.items[0]?.title}</h2>
            <p className="font-light text-base text-gray-500 line-clamp-1 max-w-lg">{tools.items[0]?.description}</p>
          </div>
          <Button color="primary" className="my-auto" size="sm" variant="flat" radius="full" onClick={() => { openOnBroswer(tools.items[0]?.target_url) }}>获取</Button>
  
        </div>
        <Divider />
        {tools.items[0]?.preview_image_url ? (
          <div>
            <h2 className="text-xl font-semibold mt-8 mb-4 text-left">预览</h2>
            <Swiper slidesPerView={3}
              // centeredSlides={true}
              spaceBetween={10}
              navigation={true}
              modules={[Pagination, Navigation]}
              className="mb-8">
  
              {swiperSlides}
            </Swiper>
          </div>
        ) : (
          <></>
        )
        }
  
        <h2 className="text-xl font-semibold mt-8 mb-4 text-left">说明</h2>
  
        <pre className="mb-8 text-left bg-default-100 rounded-medium shadow-sm p-4 text-balance break-words">
          {tools.items[0]?.content}
        </pre>
      </div>
      ): (
        <div></div>
      )
    );
  }
  