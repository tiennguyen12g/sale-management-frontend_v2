// components/ChatLayout/ChatLayout.tsx
import React, { useState } from "react";
import Sidebar from "./SideBar";
import ChatPanel from "./ChatPanel";
import { useChatStore } from "../../../zustand/chatStore";
import classNames from "classnames/bind";
import styles from "./ChatLayout.module.scss";
const cx = classNames.bind(styles);



export default function ChatLayout() {


  return (
    <div className={cx("layout")}>

    </div>
  );
}
