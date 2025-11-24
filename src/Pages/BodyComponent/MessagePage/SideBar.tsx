import React, { useState, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./SideBar.module.scss";
const cx = classNames.bind(styles);

// Hooks
import { useMessagingStore } from "@/zustand/messagingStore";
import { useBranchStore } from "@/zustand/branchStore";
import { useTranslation } from "react-i18next";
// Types
import type { ConversationType } from "@/zustand/messagingStore";
// Components
import CustomSelectGlobal from "@/utils/CustomSelectGlobal";
// Libraries
// Icons
import { IoCamera } from "react-icons/io5";
import { BiSolidVideos } from "react-icons/bi";
// Utils
interface SidebarProps {
  conversationData: ConversationType[];
}

type FilterType = "all" | "unread" | "read";
type TagFilterType = "all" | string; // "all" or tag id

export default function Sidebar({ conversationData }: SidebarProps) {
  const { fetchMessages, selectedConversationId, setConversationId } = useMessagingStore();
  const { selectedBranch, branchSettings } = useBranchStore();
  const {t} = useTranslation();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [readFilter, setReadFilter] = useState<FilterType>("all");
  const [tagFilter, setTagFilter] = useState<TagFilterType>("all");

  const handleSelectConversation = (id: string, conversationInfo: ConversationType) => {
    if (!selectedBranch?._id) {
      console.error("No branch selected");
      return;
    }
    setConversationId(id, conversationInfo);
    fetchMessages(selectedBranch._id, id,);
  };

  // Filter conversations based on search and filters
  const filteredConversations = useMemo(() => {
    return conversationData.filter((conversation) => {
      // Search filter - search by customer name
      if (searchQuery.trim()) {
        const customerName = (conversation.customerName || "").toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        if (!customerName.includes(searchLower)) {
          return false;
        }
      }

      // Read/Unread filter
      if (readFilter === "unread") {
        if (!conversation.unreadCount || conversation.unreadCount === 0) {
          return false;
        }
      } else if (readFilter === "read") {
        if (conversation.unreadCount && conversation.unreadCount > 0) {
          return false;
        }
      }

      // Tag filter
      if (tagFilter !== "all") {
        if (!conversation.tags || conversation.tags.id !== tagFilter) {
          console.log('1', tagFilter);
          return false;
        }
      }

      return true;
    });
  }, [conversationData, searchQuery, readFilter, tagFilter]);

  // Get available tags from branch settings
  const availableTags = branchSettings?.shopTagList || [];
  const convertToOptionsType = availableTags.map((tag) => {
    const obj = {
      name: tag.tagName,
      key: tag.id,
      color: tag.color,
    };
    return obj;
  });
  convertToOptionsType.unshift({
      name: "Tất cả",
      key: "all",
      color: "black",
  })

  const optionForStatus = [
    {
      name: "Tất cả",
      key: "all",
    },
    {
      name: "Chưa đọc",
      key: "unread",
    },
    {
      name: "Đã đọc",
      key: "read",
    },
  ];
  return (
    <aside className={cx("sidebar")}>
      <div className={cx("filter-search-box")}>
        <div className={cx("search")}>
          <input type="text" placeholder={t("messagePage.sidebar.searchPlaceholder", "Tìm kiếm theo tên khách hàng...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className={cx("filters")}>
          <div className={cx("filter-group")}>
            <CustomSelectGlobal options={optionForStatus} onChange={(id) => setReadFilter(id as FilterType)} dropdownPosition="bottom" isUseBorder={true} isUsePlaceHolder={false}/>
          </div>
          <div className={cx("filter-group", "group-2")}>
            <label htmlFor="tag-filter">{t("messagePage.sidebar.tagFilter","Thẻ")}:</label>
            <CustomSelectGlobal
              isUsePlaceHolder={false}
              options={convertToOptionsType}
              onChange={(id) => setTagFilter(id as TagFilterType)}
              dropdownPosition="bottom"
              isUseBorder={true}
            />
          </div>
        </div>
      </div>

      <div className={cx("conversation-list")}>
        {filteredConversations.length === 0 ? (
          <div className="px-2.5 py-2.5">{t("messagePage.sidebar.noConversation", "Không tìm thấy cuộc trò chuyện nào")}</div>
        ) : (
          filteredConversations.map((c) => {
            if (c) {
              return (
                <div
                  key={c._id}
                  className={cx("conversation-item", { active: selectedConversationId === c._id })}
                  onClick={() => handleSelectConversation(c._id, c)}
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
                      {c.lastMessage === "[image]" && (
                        <div className={cx("last-message")}>
                          <IoCamera size={20} color="#277af7" /> Ảnh
                        </div>
                      )}
                      {c.lastMessage === "[video]" && (
                        <div className={cx("last-message")}>
                          <BiSolidVideos size={19} color="#277af7" /> Video
                        </div>
                      )}
                      {c.lastMessage !== "[image]" && c.lastMessage !== "[video]" && <div className={cx("last-message")}>{c.lastMessage}</div>}
                      <div>{c.unreadCount && <span className={cx("badge")}>{c.unreadCount}</span>}</div>
                    </div>
                    <div className={cx("line3")}>
                      <div>
                        {c && c.tags && (
                          <span style={{ backgroundColor: c.tags.color }} className={cx("tag-decor")}>
                            {c.tags.tagName}
                          </span>
                        )}
                      </div>
                      <div>{""}</div>
                    </div>
                    <div className={cx("horizontal-line")}></div>
                  </div>
                </div>
              );
            } else {
              return null;
            }
          })
        )}
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
