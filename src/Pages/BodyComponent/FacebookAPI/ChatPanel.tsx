import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./ChatPanel.module.scss";
const cx = classNames.bind(styles);


// Icons
import { FaRegSmile, FaPaperclip } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { LuReply } from "react-icons/lu";
import { RiCloseCircleFill } from "react-icons/ri";
import { IoIosCloseCircle } from "react-icons/io";
import { IoVideocam } from "react-icons/io5";
import { FaVideo } from "react-icons/fa6";
import { AiFillLike } from "react-icons/ai";
import { FcLike } from "react-icons/fc";
import { FaPhoneSquare } from "react-icons/fa";
import { FaAddressCard } from "react-icons/fa6";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { PiSealCheckFill } from "react-icons/pi";
import { FaTimesCircle } from "react-icons/fa";
import { FaShippingFast } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

// Components and Types
import MessageEmoji from "./ultility/MessageEmoji";
import FastAnswer from "./ultility/FastAnswer";
import CustomSelect from "../../../ultilitis/CustomSelect";

// Hooks
import { type ConversationType, type ChatMessageType, useMessagingStore } from "../../../zustand/messagingStore";
import { useAuthStore } from "../../../zustand/authStore";
import { type TagType, type MediaLinkedType , useBranchStore} from "../../../zustand/branchStore";

// Libraries
import { v4 as uuidv4 } from "uuid";

interface Props {
  messagesByConversation: ChatMessageType[];
  onSendMessage: (conversationId: string, msg: ChatMessageType) => void;
  conversationInfo: ConversationType | null;
  branchId: string | null; // 🔑 Changed from currentPageId to branchId
}

export default function ChatPanel({ messagesByConversation, onSendMessage, conversationInfo, branchId }: Props) {
  const {
    messageList,
    selectedConversationId,
    fetchMessages,
    hasMoreMessages,
    fetchMoreMessages,
    updateConversation,
    sendMediaGroup,
    sendMedia,
    errorSend,
    updateErrorSend,
  } = useMessagingStore();
  const { branchSettings } = useBranchStore();
  const initFastMessageData = branchSettings ? branchSettings.fastMessages : [];
  const [input, setInput] = useState("");
  const [fastMegAttachedMedia, setFastMsgAttachedMedia] = useState<MediaLinkedType[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const emojiRef = useRef<HTMLDivElement | null>(null); // wrapper ref (icon + picker)
  const fastStateRef = useRef<any>(null);
  const [replyTo, setReplyTo] = useState<ChatMessageType | null>(null);
  // refs at the top of component
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedRef = useRef(false); // skip "load more" on initial render
  const isAutoScrollingRef = useRef(false); // ignore scroll events while auto-scrolling
  const isFetchingRef = useRef(false); // avoid concurrent fetchMore calls

  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    if (selectedConversationId && branchId && fetchMessages) {
      fetchMessages(branchId, selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages, branchId]);

  // ✅ Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  const sendMessage = (type: "text" | "image" | "video" | "sticker", content: string) => {
    updateErrorSend(null)
    if (!content.trim()) return;
    if (!selectedConversationId) return;

    const newMsg: ChatMessageType = {
      _id: Date.now().toString(),
      senderType: "shop",
      contentType: type,
      content: type === "text" ? content.trim() : content,
      timestamp: new Date().toISOString(),
      facebookMessageId: replyTo?.facebookMessageId || "",
      recipientId: conversationInfo?.customerId || "",
      metadata: type === "image" ? { thumbnail: content } : undefined,
      replyTo: replyTo
        ? {
            senderName: replyTo.senderType === "customer" ? conversationInfo?.customerName || "Khách" : "Bạn",
            content: replyTo.content,
            messageIdRoot: replyTo.facebookMessageId || replyTo._id || "none",
            replyContentType: replyTo.contentType,
          }
        : undefined,
    };
    if (fastMegAttachedMedia.length > 1) {
      handleSendGroupImage(type, content, newMsg);
    } else {
      console.log("2", newMsg);

      onSendMessage(selectedConversationId, newMsg);
      setReplyTo(null);
      setInput("");
    }
        if (!bodyRef.current) return false;
        console.log('scroll');
        bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
      
    });
    
  };

  //-- Send message with multiple images
  const handleSendGroupImage = async (type: "text" | "image" | "video" | "sticker", content: string, newMsg: ChatMessageType) => {
    if (!selectedConversationId) return;

    console.log("2", newMsg);
    const localIdForMedia = uuidv4();

    const attachments = fastMegAttachedMedia.map((media) => {
      return {
        type: media.type,
        payload: {
          url: media.url,
        },
      };
    });
    const objForMediaFastMessage: ChatMessageType = {
      ...newMsg,
      _id: localIdForMedia,
      attachments,
      content: "",
    };
    // update messageList in store
    const existingMessages = messageList[selectedConversationId] || [];
    let updatedMessages = [];
    if (newMsg.content.length > 0) {
      updatedMessages = [...existingMessages, objForMediaFastMessage, newMsg];
    } else {
      updatedMessages = [...existingMessages, objForMediaFastMessage];
    }
    useMessagingStore.getState().setMessageList(selectedConversationId, updatedMessages);

    //send to unified messaging API
    if (branchId) {
      sendMediaGroup(branchId, newMsg.recipientId || "", {
        message: newMsg.content,
        fastMegAttachedMedia: fastMegAttachedMedia,
        _id: newMsg._id,
        localIdForMedia: localIdForMedia,
      });
    }

    setReplyTo(null);
    setInput("");
    setFastMsgAttachedMedia([]);
  };

  // ✅ Handle emoji selection (append to text)
  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  // -- This part for handle flasing / jumping when load new message
  useEffect(() => {
    if (!bodyRef.current) return;

    // If this is the initial render, do the initial scroll differently:
    if (!hasInitializedRef.current) {
      // initial jump-to-bottom without triggering load-more
      const el = bodyRef.current;
      el.scrollTop = el.scrollHeight;
      // give browser time to settle and then mark initialized
      setTimeout(() => {
        hasInitializedRef.current = true;
      }, 120); // small delay
      return;
    }

    // for subsequent message arrivals: only auto-scroll if user is already near bottom
    if (!isNearBottom()) return;

    const el = bodyRef.current;
    isAutoScrollingRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });

    // clear auto-scrolling flag after a short delay
    // (or listen for 'scroll' event and detect when it finishes)
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 300);
  }, [messagesByConversation.length]); // triggers on new message added

  // Track if user is near the bottom
  const isNearBottom = () => {
    if (!bodyRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    return scrollHeight - scrollTop - clientHeight < 150; // px threshold
  };

  // 1️⃣ Auto-scroll when NEW message arrives (but only if user near bottom)
  useEffect(() => {
    if (!bodyRef.current) return;
    if (!isNearBottom()) return; // ✅ skip if user scrolling up / loading old msgs

    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesByConversation.length]);

  // 2️⃣ Infinite scroll for older messages
  useEffect(() => {
    if (!bodyRef.current || !selectedConversationId) return;
    const body = bodyRef.current;

    const handleScroll = async () => {
      // ignore while we are programmatically auto-scrolling or during initial setup
      if (isAutoScrollingRef.current) return;
      if (!hasInitializedRef.current) return;

      // classic guard: avoid concurrent calls
      if (isFetchingRef.current) return;

      if (body.scrollTop === 0 && hasMoreMessages[selectedConversationId]) {
        const firstMsg = messagesByConversation[0];
        if (!firstMsg) return;

        isFetchingRef.current = true;
        setLoadingOlder(true);

        const prevHeight = body.scrollHeight;
        try {
          if (branchId) {
            await fetchMoreMessages(branchId, selectedConversationId, firstMsg.timestamp.toString());
          }
          // maintain scroll position
          requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight - prevHeight;
            setLoadingOlder(false);
            isFetchingRef.current = false;
          });
        } catch (err) {
          setLoadingOlder(false);
          isFetchingRef.current = false;
        }
      }
    };

    body.addEventListener("scroll", handleScroll, { passive: true });
    return () => body.removeEventListener("scroll", handleScroll);
  }, [selectedConversationId, messagesByConversation, hasMoreMessages]);

  //-- Ended --//

  // ✅ Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversationId) return;

    const localUrl = URL.createObjectURL(file);

    // ✅ Create temp message for instant preview
    const newMsg: ChatMessageType = {
      _id: Date.now().toString(),
      facebookMessageId: "",
      senderType: "shop",
      contentType: "image",
      content: localUrl,
      timestamp: new Date().toISOString(),
      recipientId: conversationInfo?.customerId || "",
      status: "sending",
      metadata: { thumbnail: localUrl },
    };
    console.log("old image", newMsg);

    const existingMessages = useMessagingStore.getState().messageList[selectedConversationId] || [];
    useMessagingStore.getState().setMessageList(selectedConversationId, [...existingMessages, newMsg]);

    // ✅ Upload to backend using unified messaging API
    if (branchId) {
      sendMedia(branchId, conversationInfo?.customerId || "", file, newMsg._id);
    }
  };

  // ✅ Handle image upload
  const handleSendSticker = async (platform: string, stickerId: number) => {
    if (!selectedConversationId) return;
    // ✅ Create temp message for instant preview
    const newMsg: ChatMessageType = {
      _id: Date.now().toString(),
      facebookMessageId: "",
      senderType: "shop",
      contentType: "image",
      content: "",
      timestamp: new Date().toISOString(),
      recipientId: conversationInfo?.customerId || "",
      status: "sending",
    };
    console.log("old image", newMsg);

    const existingMessages = useMessagingStore.getState().messageList[selectedConversationId] || [];
    useMessagingStore.getState().setMessageList(selectedConversationId, [...existingMessages, newMsg]);

    // ✅ Upload to backend using unified messaging API (sticker is sent as image)
    if (branchId) {
      // For stickers, we still need to send them, but this is a placeholder
      // You may need to implement sticker-specific handling
      console.warn("Sticker sending not yet implemented in unified messaging");
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversationId) return;

    const localUrl = URL.createObjectURL(file);
    const type = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "file";
    console.log("Upload media", type);

    const tempMsg: ChatMessageType = {
      _id: Date.now().toString(),
      facebookMessageId: "",
      senderType: "shop",
      contentType: type,
      content: localUrl,
      timestamp: new Date().toISOString(),
      recipientId: conversationInfo?.customerId || "",
      status: "sending",
      metadata: { thumbnail: localUrl },
    };

    // instantly show
    const existing = useMessagingStore.getState().messageList[selectedConversationId] || [];
    useMessagingStore.getState().setMessageList(selectedConversationId, [...existing, tempMsg]);

    // upload to backend using unified messaging API
    if (branchId) {
      sendMedia(branchId, conversationInfo?.customerId || "", file, tempMsg._id);
    }
  };

  const handleAddTag = (conversationId: string, tagId: string) => {
    if (!branchSettings) return;
    const tagInfo = branchSettings.shopTagList.find((tag: TagType) => tag.id === tagId);
    if (tagInfo) {
      updateConversation(conversationId, tagInfo);
    }
  };

  const handleRemoveFastMsgInTextArea = (id: string) => {
    setFastMsgAttachedMedia((prev) => {
      return prev.filter((fastMsg) => fastMsg.id !== id);
    });
  };
  return (
    <React.Fragment>
      {!selectedConversationId ? (
        <div className={cx("chat-empty")}>Chọn cuộc trò chuyện bên trái</div>
      ) : (
        <section className={cx("chat")}>
          <header className={cx("chat-header")}>
            <div className={cx("left-part")}>
              <div className={cx("header-avatar")}>
                {conversationInfo &&
                conversationInfo?.customerAvatarURL &&
                conversationInfo.customerAvatarURL !== "" &&
                conversationInfo.customerAvatarURL !== null ? (
                  <img src={conversationInfo.customerAvatarURL} className={cx("img-avatar")} />
                ) : (
                  "🧑"
                )}
              </div>
              {conversationInfo?.customerName || "Khách hàng"}
            </div>
            <div className={cx("right-part")}>
              <div className={cx("customer-phone")}>
                <div>
                  <FaPhoneSquare color="#06be00" size={18} /> 0972.123.821
                </div>
                <div>
                  <FaAddressCard color="#4997f0" size={18} /> Xóm chợ Khánh Mậu Yên Khánh Ninh Bình
                </div>
              </div>
              <div className={cx("customer-order")}>
                <div>
                  <FaShippingFast color="#0086d3" size={19} /> Đang giao: 15
                </div>
                <div>
                  <PiSealCheckFill color="#06be00" size={20} /> Thành công: 10
                </div>
                <div>
                  <FaTimesCircle color="#f32323" size={18} /> Thất bại: 25
                </div>
              </div>
            </div>
          </header>

          <div className={cx("chat-body")} ref={bodyRef}>
            {loadingOlder && <div className={cx("loading-older")}>Loading older messages...</div>}
            {messagesByConversation.map((m, i) => {
              const isLastMessageOfCustomer = messagesByConversation[i + 1]?.senderType !== "customer";
              const attachments = m.attachments || [];
              return (
                <div key={`${m._id}`} className={cx("message-row", m.senderType === "shop" ? "from-shop" : "from-customer")}>
                  {isLastMessageOfCustomer && m.senderType === "customer" ? (
                    <div className={cx("avatar-small")}>
                      {conversationInfo &&
                      conversationInfo?.customerAvatarURL &&
                      conversationInfo.customerAvatarURL !== "" &&
                      conversationInfo.customerAvatarURL !== null ? (
                        <img src={conversationInfo.customerAvatarURL} className={cx("img-avatar-small")} />
                      ) : (
                        "🧑"
                      )}
                    </div>
                  ) : m.senderType === "customer" ? (
                    <div className={cx("virtual-space")}></div>
                  ) : (
                    ""
                  )}

                  <div className={cx("bubble-wrapper")}>
                    <div className={cx("bubble")}>
                      {m.replyTo && m.replyTo.messageIdRoot !== "none" && (
                        <div className={cx("reply-quote")}>
                          <div className={cx("reply-header")}>
                            <strong>{m.replyTo.senderName || "Unknown"}</strong>
                          </div>

                          {m.replyTo.replyContentType === "text" && <div className={cx("reply-text")}>{m.replyTo.content}</div>}

                          {m.replyTo.replyContentType === "image" && (
                            <div className={cx("reply-image")}>
                              <img src={m.replyTo.content} alt="Replied image" className={cx("reply-thumb")} loading="lazy" />
                            </div>
                          )}
                        </div>
                      )}

                      {attachments.length === 1 && m.contentType === "image" && m.attachments && !m.attachments[0].payload.sticker_id && (
                        <div className={cx("wrap-image")} onClick={() => setPreviewUrl(m.metadata?.facebookURL || m.content)}>
                          <img src={m.metadata?.facebookURL || m.content} alt="uploaded" className={cx("img-message")} loading="lazy" />
                        </div>
                      )}
                      <div className={cx("wrap-group-image-multi")} data-count={attachments.length}>
                        {attachments.length > 1 &&
                          attachments.map((attachment, p) => (
                            <React.Fragment key={p}>
                              {attachment.payload?.url && (
                                <div className={cx("wrap-image-multi")} onClick={() => setPreviewUrl(attachment.payload.url ?? null)}>
                                  <img src={attachment.payload.url} alt="uploaded" className={cx("img-message")} loading="lazy" />
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                      </div>

                      {m.contentType === "image" && m.attachments && m.attachments[0].payload.sticker_id && (
                        <div className={cx("icon-image")}>
                          <AiFillLike size={25} color="#186ceb" />
                        </div>
                      )}
                      {m.contentType === "text" && <div style={{ whiteSpace: "pre-line" }}>{m.content}</div>}

                      {/* //-- This is for showing website link */}
                      {m.contentType === "fallback" ? (
                        m.attachments && m.attachments[0] ? (
                          <div>
                            <a href={m.attachments[0].payload?.url || m.content} target="_blank" rel="noopener noreferrer" className={cx("link-preview")}>
                              <div className={cx("link-preview-container")}>
                                {m.attachments[0].payload?.image && (
                                  <img src={m.attachments[0].payload.image} alt="preview" className={cx("link-preview-image")} />
                                )}

                                <div className={cx("link-preview-info")}>
                                  <div className={cx("link-preview-title")}>{m.attachments[0].payload?.title || m.content}</div>
                                  <div className={cx("link-preview-domain")}>{new URL(m.content).hostname.replace("www.", "")}</div>
                                </div>
                              </div>
                            </a>
                            <div style={{ whiteSpace: "pre-line", margin: "8px 0px" }}>{m.content}</div>
                          </div>
                        ) : (
                          <div style={{ whiteSpace: "pre-line", margin: "8px 0px" }}>{m.content}</div>
                        )
                      ) : (
                        <div style={{ whiteSpace: "pre-line" }}>{""}</div>
                      )}

                      {/* 🎥 Video messages */}
                      {m.contentType === "video" && (
                        <div className={cx("wrap-video")}>
                          <video src={m.metadata?.facebookURL || m.content} className={cx("video-message")} controls playsInline preload="metadata">
                            Sorry, your browser doesn’t support embedded videos.
                          </video>
                        </div>
                      )}

                    </div>

                    {/* ✅ Show reply button when hovering */}
                    <div className={cx("actions", m.senderType === "shop" ? "left-actions" : "right-actions")}>
                      <LuReply className={cx("reply-btn")} onClick={() => setReplyTo(m)} size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
            {errorSend && <div className={cx('error-send')}>Tin nhắn tạm không gửi được, thử lại sau!</div>}
          </div>
          {/* ✅ Fullscreen image overlay */}
          {previewUrl && (
            <div className={cx("fullscreen-preview")} onClick={() => setPreviewUrl(null)}>
              <img src={previewUrl} alt="Preview" onClick={(e) => e.stopPropagation()} />
              <div className={cx("close-btn")} onClick={() => setPreviewUrl(null)}>
                Đóng <IoIosCloseCircle size={40} color="white" />
              </div>
            </div>
          )}

          <footer className={cx("chat-input")}>
            <div className={cx("tools")}>
              <div className={cx("add-tag-conversation")}>
                <label>Gắn thẻ: </label>
                <CustomSelect options={branchSettings?.shopTagList || []} onChange={(id) => handleAddTag(selectedConversationId, id)} dropdownPosition="top" />
              </div>
              <div className={cx("wrap-icons")}>
                <div ref={emojiRef} className={cx("emoji-wrapper")}>
                  <FaRegSmile size={18} onClick={() => setShowEmoji((prev) => !prev)} className={cx("icon")} />
                  {showEmoji && <MessageEmoji onSelect={handleEmojiSelect} />}
                </div>
                <label htmlFor="fileUpload" className={cx("icon")}>
                  <FaImage size={18} />
                </label>
                <label htmlFor="fileUpload-video" className={cx("icon")}>
                  <FaVideo size={20} />
                </label>
                <input id="fileUpload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleMediaUpload} />
                <input id="fileUpload-video" type="file" accept="video/*" style={{ display: "none" }} onChange={handleMediaUpload} />
              </div>
            </div>

            <div>
              {replyTo && (
                <div className={cx("reply-preview")}>
                  <div className={cx("reply-preview-left")}>
                    <div className={cx("reply-header")}>
                      <strong>{replyTo.senderType === "customer" ? conversationInfo?.customerName : conversationInfo?.pageName}</strong>
                    </div>

                    {replyTo.contentType === "text" && <div className={cx("reply-text")}>{replyTo.content}</div>}

                    {replyTo.contentType === "image" && (
                      <div className={cx("reply-image")}>
                        <img src={replyTo.content} alt="reply-preview" className={cx("reply-thumb")} loading="lazy" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => setReplyTo(null)} className={cx("close-reply")} title="Cancel reply">
                    <RiCloseCircleFill size={20} color="red" />
                  </button>
                </div>
              )}

              <div className={cx("input-area")}>
                <textarea
                  value={input}
                  placeholder="Nhập nội dung tin nhắn...(Nhấn Shift + Enter để xuống dòng)"
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    const handled = FastAnswer.useKeyHandler(
                      e,
                      input,
                      (msg) => {
                        // ✅ msg = { text: string, media?: { url, type }[] }
                        setInput(msg.text);

                        // ✅ if fast message has media (images/videos)
                        if (msg.media?.length) {
                          setFastMsgAttachedMedia(msg.media); // <- you should have this state
                        }
                      },
                      fastStateRef,
                      initFastMessageData // ✅ Pass your real data list
                    );

                    if (handled) return; // stop if FastAnswer handled the key

                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage("text", input); // ✅ optionally include attached media
                    }
                  }}
                  className={cx("textarea")}
                  rows={1}
                />

                {/* FastAnswer: pass inputValue, onSelect and the onConsumeEnter handler */}
                <FastAnswer
                  inputValue={input}
                  onSelect={(msg) => {
                    setInput(msg.text);
                    if (msg.media?.length) setFastMsgAttachedMedia(msg.media);
                  }}
                />
                <div className={cx("group-send-and-like")}>
                  <div className={cx("media-attachment")}>
                    {fastMegAttachedMedia.map((attachmentMedia, h) => {
                      return (
                        <React.Fragment key={h}>
                          {attachmentMedia.type === "image" ? (
                            <div>
                              <img src={attachmentMedia.url} alt="image" className={cx("small-preview")} />
                              <FaTimesCircle color="red" style={{ cursor: "pointer" }} onClick={() => handleRemoveFastMsgInTextArea(attachmentMedia.url)} />
                            </div>
                          ) : (
                            <div>
                              <video src={attachmentMedia.url} controls className={cx("small-preview")} />
                              <FaTimesCircle color="red" style={{ cursor: "pointer" }} onClick={() => handleRemoveFastMsgInTextArea(attachmentMedia.id)} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className={cx("icon-send")}>
                    <AiFillLike size={25} color="#186ceb" className={cx("icon")} onClick={() => sendMessage("text", "👍")} title="Send Like" />
                    <FcLike size={25} className={cx("icon")} onClick={() => sendMessage("text", "❤️")} title="Send Heart" />
                    <IoSend size={20} color="#186ceb" onClick={() => sendMessage("text", input)} />
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </section>
      )}
    </React.Fragment>
  );
}
