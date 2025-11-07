import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosApiCall from "./axiosApiClient";
import { useAuthStore } from "./authStore";
import { facebookAPIBase } from "../configs/api";
import { type TagType } from "./branchStore";
import { useBranchStore, type IBranch } from "./branchStore";
interface FBUser {
  id: string;
  name: string;
  email?: string;
  picture?: { data: { url: string } };
  accessToken?: string; // not persisted
}

interface FBPage {
  pageId: string;
  pageName: string;
  page_access_token: string;
  picture?: { data: { url: string } };
}
export interface PageInfoType {
  userId: string; // owner
  pageId: string | number;
  pageName: string;
  pageAccessToken: string;
  platform: "facebook" | "instagram" | "zalo" | "tiktok" | "shopee" | string;
  meta?: Record<string, any>;
  pageAvatarURL?: string;
}

export interface ConversationType {
  _id: string;
  platform: "facebook" | "zalo" | "tiktok" | "instagram" | string | "website" | "shopee";

  pageId: string;
  pageName?: string;

  assignedStaffId: string; //mongoose.Types.ObjectId; // 🔑 link to User
  assignedStaffName?: string;

  customerId: string; // external sender id (facebook psid)
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

interface ConversationUpdateType {
  _id: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: string | number;
  typeEmit: "new" | "update";
}
export interface ChatMessageType {
  _id: string;
  localMsg_Id?: string;
  newMessageType?: "shop-new-msg" | "customer-new-msg";

  pageId?: string;
  pageName?: string;

  conversationId?: string; // is _id of ConversationType
  facebookMessageId: string;

  senderType: "customer" | "agent" | "bot" | "shop" | string;
  senderId?: string; // external id (customer) or internal staff id
  recipientId?: string; // for shop messages, the recipient is the customer

  content: string;
  contentType: "text" | "image" | "video" | "file" | "sticker" | "audio" | "fallback" | string;
  timestamp: string | Date;
  status?: "sent" | "delivered" | "seen" | "failed" | "sending";
  attachments?: {
    type: "text" | "image" | "video" | "file" | "sticker" | "fallback" | string;
    payload: {
      url?: string;
      attachment_id?: string;
      sticker_id?: string | number;
      [k: string]: any;
    };
    [k: string]: any;
  }[];
  metadata?: {
    fileName?: string;
    fileSize?: number;
    thumbnail?: string;
    mimeType?: string;
    facebookURL?: string; // actual CDN URL
    attachmentId?: string;
    [k: string]: any;
  };
  replyTo?: {
    senderName: string;
    content: string;
    messageIdRoot: string;
    replyContentType: "text" | "image" | "video" | "file" | "sticker" | "fallback" | string;
  };
}
interface FacebookState {
  user: FBUser | null;
  pages: PageInfoType[];
  loading: boolean;
  errorSend: string | null;
  conversations: ConversationType[];
  pageSelected: PageInfoType | null;
  messageList: { [conversationId: string]: ChatMessageType[] };
  selectedConversationId: string | null;
  currentConversationInfo: ConversationType | null;

  // actions
  setUser: (user: FBUser | null) => void;
  setPages: (pages: PageInfoType[]) => void;
  clearFacebookData: () => void;

  // HTTP methods
  saveFacebookUser: (userData: FBUser) => Promise<{ status: string; message?: string }>;

  // Get list conversations from a page
  fetchConversationFromPage: () => Promise<{ status: string; data?: any[] }>;

  // Get messages from a conversation
  fetchMessagesFromConversation: (conversationId: string, pageId: string, limit?: number) => Promise<{ status: string; data?: ChatMessageType[] }>;

  // Facebook SDK session check
  checkFacebookStatus: () => Promise<void>;

  setPageSelected: (page: PageInfoType | null) => void;

  setConversationId: (id: string, conversationInfo: ConversationType) => void;

  setMessageList: (conversationId: string, messages: ChatMessageType[]) => void;

  sendMessageToFacebook: (
    pageId: string,
    conversationId: string,
    recipientId: string,
    messageObj: Record<string, any>
  ) => Promise<{ status: string; data?: any }>;
  sendMessageWithGroupMediaToFacebook: (
    pageId: string,
    conversationId: string,
    recipientId: string,
    messageObj: Record<string, any>
  ) => Promise<{ status: string; data?: any }>;

  addIncomingMessage: (data: { message: ChatMessageType; conversationUpdate: ConversationType & { typeEmit: "new" | "update" } }) => void;

  hasMoreMessages: Record<string, boolean>; // track if older messages still exist

  fetchMoreMessages: (conversationId: string, pageId: string, before?: string, limit?: number) => Promise<{ status: string; data?: ChatMessageType[] }>;

  handleIncomingConversation: (conversation: ConversationType & { typeEmit: "new" | "update" }) => void;

  updateConversationById: (conversationId: string, tag: TagType) => void;
  updateErrorSend: (errorMessage: any) => void;
}

export const useFacebookStore = create<FacebookState>()(
  persist(
    (set, get) => ({
      user: null,
      pages: [],
      loading: false,
      errorSend: null,
      conversations: [],
      messageList: {},
      hasMoreMessages: {},
      pageSelected: (() => {
        const saved = localStorage.getItem("facebook-page-selected");
        return saved ? (JSON.parse(saved) as PageInfoType) : null;
      })(),
      selectedConversationId: null,
      currentConversationInfo: null,

      setUser: (user) => set({ user }),
      setPages: (pages: PageInfoType[]) => set({ pages }),

      clearFacebookData: () => {
        localStorage.removeItem("facebook-storage"); // ✅ remove persisted data
        localStorage.removeItem("facebook-page-selected"); // also clear selection
        set({ user: null, pages: [], pageSelected: null });
      },

      fetchConversationFromPage: async () => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const { pageSelected, selectedConversationId } = get();
          // const pageSelected = get().pageSelected;

          const finalPageId = pageSelected?.pageId;
          if (!finalPageId) {
            console.warn("⚠️ No page selected, cannot fetch conversations.");
            return { status: "failed", message: "No page selected" };
          }

          const res = await axiosApiCall.get(`${facebookAPIBase}/conversations/${finalPageId}`, { headers: { ...getAuthHeader() } });

          const conversations = res.data || [];
          console.log("📩 Conversations fetched:", conversations);
          set({ conversations: conversations });
          return { status: "success", data: conversations };
        } catch (err: any) {
          console.error("❌ Failed to fetch conversations:", err);
          return { status: "failed", message: err.message };
        }
      },
      fetchMessagesFromConversation: async (conversationId, pageId, limit = 25) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.get(`${facebookAPIBase}/messages/${pageId}/${conversationId}?limit=${limit}`, { headers: getAuthHeader() });
          const data = res.data;

          const messages = Array.isArray(data?.messages) ? data.messages : [];
          console.log("initial fetch", messages);

          set((state) => ({
            messageList: {
              ...state.messageList,
              [conversationId]: messages.reverse(), // newest at bottom
            },
            hasMoreMessages: {
              ...state.hasMoreMessages,
              [conversationId]: data.hasMore ?? false, // ✅ use backend flag
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

      // ✅ Fetch older messages (pagination)
      fetchMoreMessages: async (conversationId, pageId, before, limit = 15) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.get(`${facebookAPIBase}/messages/${pageId}/${conversationId}?before=${before}&limit=${limit}`, {
            headers: getAuthHeader(),
          });

          const data = res.data;
          const messages = Array.isArray(data?.messages) ? data.messages : [];
          console.log("fetch more", messages);
          if (!messages.length) {
            // mark as no more messages
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

      // ✅ Save Facebook user to backend
      saveFacebookUser: async (userData) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.post(`${facebookAPIBase}/save-user`, userData, {
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
          });
          console.log("res", res);
          const data = res.data;
          console.log("data", data, data.data);
          const branches: IBranch[] = data.data.branches || [];
          console.log("branches", branches);
          const currentBranch = useBranchStore.getState().branches || [];
          // 1. Combine both arrays into one
          const combinedBranches = [...currentBranch, ...branches];

          // 2. Use a Map to keep track of unique _id values, keeping the last one encountered
          const uniqueBranchesMap = new Map();
          for (const branch of combinedBranches) {
            // This overwrites any previous entry with the same _id, ensuring uniqueness
            uniqueBranchesMap.set(branch._id, branch);
          }

          // 3. Convert the Map values back into an array
          const uniqueBranches = Array.from(uniqueBranchesMap.values());
          useBranchStore.getState().setUpdateBranches(uniqueBranches);

          return { status: "success" };
        } catch (err: any) {
          console.error("❌ Failed to save Facebook user:", err);
          return { status: "failed", message: err.message };
        }
      },

      // ✅ Automatically check Facebook login status
      checkFacebookStatus: async () => {
        if (!window.FB) {
          console.warn("⚠️ Facebook SDK not loaded yet");
          return;
        }

        set({ loading: true });

        window.FB.getLoginStatus(async function (response: any) {
          if (response.status === "connected") {
            const accessToken = response.authResponse.accessToken;

            // Fetch profile info
            window.FB.api("/me", { fields: "id,name,email,picture" }, async (profile: any) => {
              const userData = { ...profile, accessToken };
              set({ user: userData });

              // Optional: sync to backend
              await get().saveFacebookUser(userData);

              set({ loading: false });
            });
          } else {
            console.log("ℹ️ User not connected to Facebook");
            set({ loading: false });
          }
        });
      },

      // ✅ update both store + localStorage when page changes
      setPageSelected: (page: PageInfoType | null) => {
        if (page) {
          localStorage.setItem("facebook-page-selected", JSON.stringify(page));
        } else {
          localStorage.removeItem("facebook-page-selected");
        }
        set({ pageSelected: page });
      },

      setConversationId: (id: string, conversationInfo: ConversationType) => {
        console.log("running setConversationId with id:", id, "and conversationInfo:", conversationInfo);
        set({ selectedConversationId: id, currentConversationInfo: conversationInfo });
      },
      setMessageList: (conversationId: string, messages: ChatMessageType[]) => {
        const currentMessageList = get().messageList;
        set({ messageList: { ...currentMessageList, [conversationId]: messages } });
      },

      sendMessageToFacebook: async (pageId, conversationId, recipientId, messageObj) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.post(
            `${facebookAPIBase}/send-message`,
            { pageId, conversationId, recipientId, messageObj },
            { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
          );
          console.log("res", res);
          return { status: "success", data: res.data };
        } catch (err: any) {
          console.error("❌ Failed to send message to Facebook:", err);
          set({ errorSend: err.message });
          return { status: "failed", message: err.message };
        }
      },
      sendMessageWithGroupMediaToFacebook: async (pageId, conversationId, recipientId, messageObj) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.post(
            `${facebookAPIBase}/send-media-group`,
            { pageId, conversationId, recipientId, messageObj },
            { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
          );
          console.log("res", res);
          return { status: "success", data: res.data };
        } catch (err: any) {
          console.error("❌ Failed to send message to Facebook:", err);
          return { status: "failed", message: err.message };
        }
      },
      addIncomingMessage: (data) => {
        // Handle update message
        const newMsg = data.message;
        const conversationUpdate = data.conversationUpdate;
        const conversationId = newMsg.conversationId;
        if (!conversationId) return;

        const existingMessages = useFacebookStore.getState().messageList[conversationId] || [];
        const newMessageType = newMsg.newMessageType;
        if (newMessageType === "customer-new-msg") {
          useFacebookStore.getState().setMessageList(conversationId, [...existingMessages, newMsg]);
        } else if (newMessageType === "shop-new-msg") {
          console.log("match", newMsg);
          if (newMsg.contentType === "image" || newMsg.contentType === "video") return console.log("Use local url first");
          const newMessageArray = existingMessages.map((msg, i) => {
            if (msg._id === newMsg.localMsg_Id) {
              return newMsg;
            } else {
              return msg;
            }
          });
          useFacebookStore.getState().setMessageList(conversationId, newMessageArray);
        }

        // Handle update conversation
        useFacebookStore.getState().handleIncomingConversation(conversationUpdate);
      },
      handleIncomingConversation: (conversation: ConversationType & { typeEmit: "new" | "update" }) => {
        const conversationId = conversation._id;
        if (!conversationId) return;

        const existingConversation = useFacebookStore.getState().conversations || [];

        if (conversation.typeEmit === "new") {
          set({ conversations: [...existingConversation, conversation] });
        } else if (conversation.typeEmit === "update") {
          console.log("match", conversation);
          const updated = existingConversation.map((conv) => {
            if (conv._id === conversation._id) {
              return conversation;
            } else {
              return conv;
            }
          });

          set((state) => ({
            conversations: updated,
          }));
        }
      },
      updateConversationById: async (conversationId, tagInfo) => {
        try {
          const { getAuthHeader } = useAuthStore.getState();
          const res = await axiosApiCall.put(
            `${facebookAPIBase}/conversations/edit/${conversationId}`,
            { tags: tagInfo },
            { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
          );
          console.log("res", res);
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
      updateErrorSend: (error: any) => {
        set({ errorSend: error });
      },
    }),
    {
      name: "facebook-storage",
      storage: {
        getItem: (name) => JSON.parse(localStorage.getItem(name) || "null"),
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
