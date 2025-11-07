import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./SideBar.module.scss";
const cx = classNames.bind(styles);
import type { ConversationType } from "../../../zustand/messagingStore";
import { useMessagingStore } from "../../../zustand/messagingStore";
import { useBranchStore } from "../../../zustand/branchStore";
import { IoCamera } from "react-icons/io5";
import { BiSolidVideos } from "react-icons/bi";

interface SidebarProps {
  conversationData: ConversationType[];
}

export default function Sidebar({ conversationData }: SidebarProps) {
  console.log("conversationData ", conversationData);
  const { fetchMessages, selectedConversationId, setConversationId } = useMessagingStore();
  const { selectedBranch } = useBranchStore();

  const handleSelectConversation = (id: string, conversationInfo: ConversationType) => {
    if (!selectedBranch?._id) {
      console.error("No branch selected");
      return;
    }
    setConversationId(id, conversationInfo);
    fetchMessages(selectedBranch._id, id);
  };

  return (
    <aside className={cx("sidebar")}>
      <div className={cx("filter-search-box")}>
        <div className={cx("search")}>
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
        <div className={cx("filter")}>
          <label htmlFor="filter">Lọc:</label>
          <select>
            <option>Tất cả</option>
            <option>Chưa đọc</option>
            <option>Đã đọc</option>
            <option>Có gắn thẻ</option>
          </select>
        </div>
      </div>

      <div className={cx("conversation-list")}>
        {conversationData.map((c) => {
          if (c) {
            return (
              <div
                key={c._id}
                className={cx("conversation-item", { active: selectedConversationId === c._id })}
                onClick={() => handleSelectConversation(c._id, c)}
                // onClick={() => handleSelect(c.id)}
              >
                <div className={cx("avatar_2")}>
                  {c.customerAvatarURL ? <img src={c.customerAvatarURL} alt={c.customerName || ""} className={cx("img-decor")} /> : "🧑"}
                </div>

                <div className={cx("conversation-info")}>
                  <div className={cx("line1")}>
                    <div className={cx("name")}>{c.customerName || ""}</div>
                    <div style={{ fontSize: 12 }}>{c.lastMessageAt ? formatTime(c.lastMessageAt) : "00:00"}</div>
                  </div>

                  <div className={cx("line2")}>
                    {c.lastMessage === "[image]" && <div className={cx("last-message")}><IoCamera size={20} color="#277af7"/> Ảnh</div>}
                    {c.lastMessage === "[video]" && <div className={cx("last-message")}><BiSolidVideos size={19} color="#277af7"/> Video</div>}
                    {c.lastMessage !== "[image]" &&  c.lastMessage !== "[video]" && <div className={cx("last-message")}>{c.lastMessage}</div>}
                    <div>{c.unreadCount && <span className={cx("badge")}>{c.unreadCount}</span>}</div>
                  </div>
                  <div className={cx("line3")}>
                    <div>{c && c.tags && <span style={{backgroundColor: c.tags.color,}} className={cx('tag-decor')}>{c.tags.tagName}</span>}</div>
                    <div>{""}</div>
                  </div>
                  <div className={cx("horizontal-line")}></div>
                </div>
              </div>
            );
          } else {
            return;
          }
        })}
      </div>
    </aside>
  );
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const timePart = `${hours}:${minutes}`;

  // Normalize both dates to remove time part (for comparison of just the date)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateOnly.getTime() === today.getTime()) {
    return `Hôm nay ${timePart}`;
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return `Hôm qua ${timePart}`;
  } else {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year} ${timePart}`;
  }
}
