import React, { useState, useEffect, } from "react";
import classNames from "classnames/bind";
import styles from "./PageMessage.module.scss";
const cx = classNames.bind(styles);

import Sidebar from "./SideBar";
import ChatPanel from "./ChatPanel";

import type { ConversationType, ChatMessageType } from "../../../zustand/messagingStore";
import CallPagePermission from "./CallPagePermission";
import { useAuthStore } from "../../../zustand/authStore";
import PageSelect from "./PageSelect";
import { useMessagingStore } from "../../../zustand/messagingStore";
import InitialMessageShow from "./InitialMessageShow";
import { useBranchStore } from "../../../zustand/branchStore";
export default function PageMessage() {
  const [showListPage, setShowListPage] = useState(false);
  const {
    currentConversationInfo,
    fetchConversations,
    conversations,
    messageList,
    selectedConversationId,
    sendMessage,
    setSelectedBranch,
  } = useMessagingStore();
  const {yourStaffId} = useAuthStore();
  const {selectedBranch} = useBranchStore();

  const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
  
  // Sync selectedBranch to messagingStore
  useEffect(() => {
    setSelectedBranch(selectedBranch);
  }, [selectedBranch, setSelectedBranch]);

  useEffect(() => {
    if (selectedConversationId) {
      const msgs = messageList[selectedConversationId] || [];
      setCurrentMessages(msgs);
    } else {
      setCurrentMessages([]);
    }
  }, [selectedConversationId, messageList]);

  // Fetch conversations when branch changes
  useEffect(() => {
    if (selectedBranch?._id && yourStaffId) {
      fetchConversations(selectedBranch._id, yourStaffId);
    }
  }, [selectedBranch?._id, fetchConversations, yourStaffId]);

  const handleSendMessage = (conversationId: string, msg: ChatMessageType) => {
    if (!selectedBranch?._id) {
      console.error("No branch selected");
      return;
    }

    // update messageList in store
    const existingMessages = messageList[conversationId] || [];
    const updatedMessages = [...existingMessages, msg];
    useMessagingStore.getState().setMessageList(conversationId, updatedMessages);

    // send to unified messaging API
    sendMessage(selectedBranch._id, conversationId, msg.recipientId || "", {
      message: msg.content,
      contentType: msg.contentType,
      _id: msg._id,
      replyTo: msg.replyTo,
    });
  };


  return (
    <div className={cx("main")}>
      {selectedBranch === null ? (
        <InitialMessageShow />
      ) : (
        <React.Fragment>
          {showListPage && <PageSelect setShowListPage={setShowListPage} />}
          <div className={cx("header-menu")}>
            <div>
              <button className={cx("btn-decor")} onClick={() => setShowListPage(true)}>
                Danh sách shop
              </button>
              {/* <button onClick={() => }>Create Tag</button> */}
            </div>
            <div className={cx("shop-name")}>TNBT Shop</div>
            <div> </div>
          </div>

          <div className={cx("message-container")}>
            {/* Left Sidebar: Conversation List */}
            <aside className={cx("sidebar")}>
              <Sidebar conversationData={conversations} />
            </aside>

            {/* Middle Chat Section */}
            <section className={cx("chat")}>
              <ChatPanel branchId={selectedBranch?._id || null} messagesByConversation={currentMessages} onSendMessage={handleSendMessage} conversationInfo={currentConversationInfo} />
            </section>

            {/* Right Info Panel */}
            <aside className={cx("info-panel")}>
              <div>
                <button className={cx("btn-decor")}>Tạo đơn hàng</button>
              </div>
            </aside>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

import axios from "axios";

export async function checkNgrokConnection() {
  const ngrokUrl = "https://marceline-goadlike-pseudoprosperously.ngrok-free.dev";
  try {
    const res = await axios.get(`https://marceline-goadlike-pseudoprosperously.ngrok-free.dev/ping`, { timeout: 5000 });
    if (res.data?.success) {
      console.log(`✅ Ngrok connected successfully: ${ngrokUrl}`);
      return true;
    } else {
      console.log(`⚠️ Ngrok responded but not OK:`, res.data);
      return false;
    }
  } catch (err: any) {
    console.error(`❌ Cannot reach server via ngrok: ${ngrokUrl}`);
    console.error(err.message);
    return false;
  }
}
