import { create } from "zustand";
import axiosApiCall from "./axiosApiClient";
import { useAuthStore } from "./authStore";
import {
  MessagingAPIBase,
  GetConversations_API,
  GetMessages_API,
  SendMessage_API,
  SendMediaGroup_API,
  SendMedia_API,
  UpdateConversation_API,
} from "../configs/api";
import { type TagType } from "./branchStore";
import type { IBranch } from "./branchStore";

export interface ConversationType {
  _id: string;
  platform: "facebook" | "zalo" | "tiktok" | "instagram" | string | "website" | "shopee";
  branch_id?: string; // 🔑 NEW
  pageId: string; // Keep for backward compatibility
  pageName?: string;
  assignedStaffId: string;
  assignedStaffName?: string;
  customerId: string;
  customerName?: string;
  customerAvatarURL?: string;
  customerPhone?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isMuted?: boolean;
  isPinned?: boolean;
  tags?: TagType;
}

export interface ChatMessageType {
  _id: string;
  localMsg_Id?: string;
  newMessageType?: "shop-new-msg" | "customer-new-msg";
  branch_id?: string; // 🔑 NEW
  pageId?: string; // Keep for backward compatibility
  pageName?: string;
  conversationId?: string;
  facebookMessageId?: string; // Keep for backward compatibility
  senderType: "customer" | "agent" | "bot" | "shop" | string;
  senderId?: string;
  recipientId?: string;
  content: string;
  contentType: "text" | "image" | "video" | "file" | "sticker" | "audio" | "fallback" | string;
  timestamp: string | Date;
  status?: "sent" | "delivered" | "seen" | "failed" | "sending";
  attachments?: any[];
  metadata?: any;
  replyTo?: {
    senderName: string;
    content: string;
    messageIdRoot: string;
    replyContentType: string;
  };
}

interface MessagingState {
  loading: boolean;
  errorSend: string | null;
  conversations: ConversationType[];
  messageList: { [conversationId: string]: ChatMessageType[] };
  selectedConversationId: string | null;
  currentConversationInfo: ConversationType | null;
  selectedBranch: IBranch | null;
  hasMoreMessages: Record<string, boolean>;

  // Actions
  setSelectedBranch: (branch: IBranch | null) => void;
  setConversationId: (id: string, conversationInfo: ConversationType) => void;
  setMessageList: (conversationId: string, messages: ChatMessageType[]) => void;

  // HTTP methods
  fetchConversations: (branch_id: string, assignedStaffId: string,) => Promise<{ status: string; data?: ConversationType[] }>;
  fetchMessages: (
    branch_id: string,
    conversationId: string,
    limit?: number
  ) => Promise<{ status: string; data?: ChatMessageType[] }>;
  fetchMoreMessages: (
    branch_id: string,
    conversationId: string,
    before?: string,
    limit?: number
  ) => Promise<{ status: string; data?: ChatMessageType[] }>;

  // Send messages
  sendMessage: (
    branch_id: string,
    conversationId: string,
    recipientId: string,
    messageObj: {
      message: string;
      contentType: string;
      _id: string;
      replyTo?: any;
    }
  ) => Promise<{ status: string; data?: any }>;

  sendMediaGroup: (
    branch_id: string,
    recipientId: string,
    messageObj: {
      message: string;
      fastMegAttachedMedia: any[];
      _id?: string;
      localIdForMedia?: string;
    }
  ) => Promise<{ status: string; data?: any }>;

  sendMedia: (
    branch_id: string,
    recipientId: string,
    file: File,
    localMessageId: string
  ) => Promise<{ status: string; data?: any }>;

  // Handle incoming messages (from websocket)
  addIncomingMessage: (data: {
    message: ChatMessageType;
    conversationUpdate: ConversationType & { typeEmit: "new" | "update" };
  }) => void;

  handleIncomingConversation: (conversation: ConversationType & { typeEmit: "new" | "update" }) => void;

  // Update conversation
  updateConversation: (conversationId: string, tags: TagType) => Promise<void>;

  updateErrorSend: (errorMessage: any) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  loading: false,
  errorSend: null,
  conversations: [],
  messageList: {},
  hasMoreMessages: {},
  selectedConversationId: null,
  currentConversationInfo: null,
  selectedBranch: null,

  setSelectedBranch: (branch) => set({ selectedBranch: branch }),

  setConversationId: (id, conversationInfo) => {
    set({ selectedConversationId: id, currentConversationInfo: conversationInfo });
  },

  setMessageList: (conversationId, messages) => {
    const currentMessageList = get().messageList;
    set({ messageList: { ...currentMessageList, [conversationId]: messages } });
  },

  fetchConversations: async (branch_id, assignedStaffId) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axiosApiCall.get(`${GetConversations_API}/${branch_id}/${assignedStaffId}`, {
        headers: { ...getAuthHeader() },
      });

      const conversations = res.data || [];
      set({ conversations });
      return { status: "success", data: conversations };
    } catch (err: any) {
      console.error("❌ Failed to fetch conversations:", err);
      return { status: "failed", message: err.message };
    }
  },

  fetchMessages: async (branch_id, conversationId, limit = 25, ) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axiosApiCall.get(`${GetMessages_API}/${branch_id}/${conversationId}?limit=${limit}`, {
        headers: getAuthHeader(),
      });

      const data = res.data;
      const messages = Array.isArray(data?.messages) ? data.messages : [];

      set((state) => ({
        messageList: {
          ...state.messageList,
          [conversationId]: messages.reverse(), // newest at bottom
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [conversationId]: data.hasMore ?? false,
        },
        conversations: state.conversations.map((conv: ConversationType) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              unreadCount: 0,
            };
          } else {
            return conv;
          }
        }),
        errorSend: null,
      }));

      return { status: "success", data: messages };
    } catch (err: any) {
      console.error("❌ Failed to fetch messages:", err);
      return { status: "failed", message: err.message };
    }
  },

  fetchMoreMessages: async (branch_id, conversationId, before, limit = 15) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const url = before
        ? `${GetMessages_API}/${branch_id}/${conversationId}?before=${before}&limit=${limit}`
        : `${GetMessages_API}/${branch_id}/${conversationId}?limit=${limit}`;

      const res = await axiosApiCall.get(url, {
        headers: getAuthHeader(),
      });

      const data = res.data;
      const messages = Array.isArray(data?.messages) ? data.messages : [];

      if (!messages.length) {
        set((state) => ({
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: false,
          },
        }));
        return { status: "success", data: [] };
      }

      const existing = get().messageList[conversationId] || [];

      set((state) => ({
        messageList: {
          ...state.messageList,
          [conversationId]: [...messages.reverse(), ...existing],
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [conversationId]: data.hasMore ?? true,
        },
      }));

      return { status: "success", data: messages };
    } catch (error: any) {
      console.error("❌ Failed to fetch messages:", error);
      return { status: "failed", message: error.message };
    }
  },

  sendMessage: async (branch_id, conversationId, recipientId, messageObj) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axiosApiCall.post(
        SendMessage_API,
        { branch_id, conversationId, recipientId, messageObj },
        { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
      );
      return { status: "success", data: res.data };
    } catch (err: any) {
      console.error("❌ Failed to send message:", err);
      set({ errorSend: err.message });
      return { status: "failed", message: err.message };
    }
  },

  sendMediaGroup: async (branch_id, recipientId, messageObj) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await axiosApiCall.post(
        SendMediaGroup_API,
        { branch_id, recipientId, messageObj },
        { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
      );
      return { status: "success", data: res.data };
    } catch (err: any) {
      console.error("❌ Failed to send media group:", err);
      return { status: "failed", message: err.message };
    }
  },

  sendMedia: async (branch_id, recipientId, file, localMessageId) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("branch_id", branch_id);
      formData.append("recipientId", recipientId);
      formData.append("_id", localMessageId);

      // Detect content type
      let contentType = "file";
      if (file.type.startsWith("image")) contentType = "image";
      else if (file.type.startsWith("video")) contentType = "video";
      else if (file.type.startsWith("audio")) contentType = "audio";

      formData.append("contentType", contentType);

      const res = await axiosApiCall.post(SendMedia_API, formData, {
        headers: { ...getAuthHeader() },
      });

      return { status: "success", data: res.data };
    } catch (err: any) {
      console.error("❌ Failed to send media:", err);
      return { status: "failed", message: err.message };
    }
  },

  addIncomingMessage: (data) => {
    const newMsg = data.message;
    const conversationUpdate = data.conversationUpdate;
    const conversationId = newMsg.conversationId;
    if (!conversationId) return;

    const existingMessages = get().messageList[conversationId] || [];
    const newMessageType = newMsg.newMessageType;

    if (newMessageType === "customer-new-msg") {
      set((state) => ({
        messageList: {
          ...state.messageList,
          [conversationId]: [...existingMessages, newMsg],
        },
      }));
    } else if (newMessageType === "shop-new-msg") {
        console.log("match", newMsg);
      // Match by localMsg_Id to replace temporary message with real one
      const newMessageArray = existingMessages.map((msg) => {
        if (msg._id === newMsg.localMsg_Id || msg.localMsg_Id === newMsg.localMsg_Id) {
          return newMsg;
        } else {
          return msg;
        }
      });
      set((state) => ({
        messageList: {
          ...state.messageList,
          [conversationId]: newMessageArray,
        },
      }));
    }

    // Handle conversation update
    get().handleIncomingConversation(conversationUpdate);
  },

  handleIncomingConversation: (conversation) => {
    const conversationId = conversation._id;
    if (!conversationId) return;

    const existingConversations = get().conversations || [];

    if (conversation.typeEmit === "new") {
      set({ conversations: [...existingConversations, conversation] });
    } else if (conversation.typeEmit === "update") {
      const updated = existingConversations.map((conv) => {
        if (conv._id === conversation._id) {
          return conversation;
        } else {
          return conv;
        }
      });
      set({ conversations: updated });
    }
  },

  updateConversation: async (conversationId, tagInfo) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      await axiosApiCall.put(
        `${UpdateConversation_API}/${conversationId}`,
        { tags: tagInfo },
        { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
      );

      set((state) => ({
        conversations: state.conversations.map((conv: ConversationType) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              tags: tagInfo,
            };
          } else {
            return conv;
          }
        }),
      }));
    } catch (err) {
      console.error("❌ Failed to update conversation:", err);
    }
  },

  updateErrorSend: (error) => {
    set({ errorSend: error });
  },
}));

