"use client";
import { title } from "@/components/primitives";
import { Button, useTabs, Selection, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Snippet, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, useDisclosure, Chip, Spinner, SortDescriptor } from "@nextui-org/react";
import { SlOptionsVertical, SlRefresh } from "react-icons/sl";
import { AiOutlineCopy, AiOutlineDelete, AiOutlineEye, AiOutlinePlus, AiOutlinePushpin, AiOutlineTool, AiTwotoneDelete } from "react-icons/ai";
import { CiCircleList, CiFileOn } from "react-icons/ci";
import { open } from "@tauri-apps/plugin-dialog";
import { useState, useEffect, Key, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { StringToBoolean } from "tailwind-variants";
import moment from "moment";
import { AsyncListData, AsyncListLoadOptions, useAsyncList } from "@react-stately/data";

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

  return (<div>hello</div>)
}
