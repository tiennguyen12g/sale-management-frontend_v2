// FastMessage.jsx
import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./FastMessage.module.scss";
const cx = classNames.bind(styles);


// Icons
import { X, Plus, MapPin, Image, Paperclip, Video, Shirt, Code } from "lucide-react";
import { BsEmojiGrinFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

// Libraries
import { v4 as uuidv4 } from "uuid";

// Components & Type
import MediaStore, { type MediaSelectType } from "./MediaStore";
import MessageEmoji from "../BodyComponent/FacebookAPI/ultility/MessageEmoji";

// Hooks
// import { useSettingStore, type FastMessageType, type ISettings } from "../../zustand/settingStore";
import { useBranchStore, type FastMessageType, type IBranchSetting } from "../../zustand/branchStore";

import { AddButton, ButtonDeleteIcon, ButtonEditIcon, ButtonCloseIcon, ButtonCommon } from "@tnbt/react-favorit-style";
import {useTranslation} from "react-i18next";
export default function FastMessage() {
  const { t } = useTranslation();
  const { branchSettings, addFastMessage, deleteFastMessage, updateFastMessage, setUpdateBranchSettings,selectedBranch, fetchBranchSettings } = useBranchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMediaStore, setShowMediaStore] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaSelectType[]>([]);

  const [fastMessageData, setFastMessageData] = useState<FastMessageType[]>(branchSettings ? branchSettings.fastMessages : []);
  const [shortKey, setShortKey] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<string>("");

  const [editData, setEditData] = useState<FastMessageType | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null); // wrapper ref (icon + picker)
  const handleSelectMedia = (mediaList: MediaSelectType[]) => {
    setSelectedMedia(mediaList);
  };



  const handleSaveFastMessage = () => {
    try {
      console.log("gfgd");
      if (!shortKey || !branchSettings) return console.log("2");
      console.log("sda", selectedMedia.length, messageContent);
      if (selectedMedia.length === 0 && messageContent === "") return console.log("3");
      console.log('dfgdfg');
      if(!fastMessageData) return console.log('5');;
      console.log("4");
      const newFastMessage: FastMessageType = {
        id: uuidv4(),
        keySuggest: shortKey.replaceAll(" ", ""),
        listMediaUrl: selectedMedia,
        messageContent: messageContent,
      };

      console.log("ffs", newFastMessage);
      const newSetting: IBranchSetting = { ...branchSettings, fastMessages: [...fastMessageData, newFastMessage] };
      setFastMessageData([...fastMessageData, newFastMessage]);

      setUpdateBranchSettings(newSetting);
      addFastMessage(newFastMessage);

      setShortKey(null);
      setSelectedMedia([]);
      setMessageContent("");
      setShowMediaStore(false);
      setIsModalOpen(false);
    } catch (error) {
      console.log("errr", error);
    }
  };

  const handleDeleteFastMessage = (id: string) => {
    let userConfirmed = confirm(t("setting.fastMessage.confirmDelete", "Bạn có chắc chắn muốn xóa?"));

    if (!branchSettings) return;

    if (userConfirmed) {
      const newFastMessage = fastMessageData.filter((data) => data.id !== id);

      const newSetting: IBranchSetting= { ...branchSettings, fastMessages: newFastMessage };
      setFastMessageData(newFastMessage);

      setUpdateBranchSettings(newSetting);
      deleteFastMessage(id);
    } else {
      console.log("User clicked Cancel.");
      // Perform action if canceled
    }
  };

  const handleOpenEditFastMessage = (editData: FastMessageType) => {
    setEditData(editData);
    setShortKey(editData.keySuggest);
    setSelectedMedia(editData.listMediaUrl);
    setMessageContent(editData.messageContent);
    setShowEdit(true);
  };
  const handleSaveEdit = () => {
    if (!shortKey || !branchSettings || !editData) return;

    if (selectedMedia.length === 0 && messageContent === "") return;
    const updateFastMessageData: FastMessageType = {
      id: editData.id,
      keySuggest: shortKey.replaceAll(" ", ""),
      listMediaUrl: selectedMedia,
      messageContent: messageContent,
    };
    const newUpdateArray = fastMessageData.map((data) => {
      if (data.id === editData.id) {
        return updateFastMessageData;
      } else {
        return data;
      }
    });

    const newSetting: IBranchSetting = { ...branchSettings, fastMessages: newUpdateArray };
    setFastMessageData(newUpdateArray);

    setUpdateBranchSettings(newSetting);
    updateFastMessage(editData.id, updateFastMessageData);

    setShortKey(null);
    setSelectedMedia([]);
    setMessageContent("");
    setShowMediaStore(false);
    setShowEdit(false);
  };

  useEffect(() => {
    console.log("fdas", showMediaStore);
  }, [showMediaStore]);

  // ✅ Handle emoji selection (append to text)
  const handleEmojiSelect = (emoji: string) => {
    setMessageContent((prev) => prev + emoji);
  };
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

  return (
    <div className={cx("main")}>
      <h2 className={cx("title")}>{t("setting.fastMessage.title", "Hỗ trợ trả lời")}</h2>

      <div className={cx("card")}>
        <div className={cx("header")}>
          <h3 className={cx("header-title")}>{t("setting.fastMessage.quickReply", "Trả lời nhanh")}</h3>
          <AddButton onClick={() => setIsModalOpen(true)}>{t("setting.fastMessage.button.addForm","Thêm câu trả lời nhanh")}</AddButton>
        </div>

        <div className={cx("table-wrapper")}>
          <table className={cx("table")}>
            <thead>
              <tr className={cx("table-header-row")}>
                <th className={cx("table-header", "stt")}>{t("setting.fastMessage.table.stt", "STT")}</th>
                <th className={cx("table-header", "short-key")}>{t("setting.fastMessage.table.shortKey", "Ký tự tắt")}</th>
                <th className={cx("table-header", "search-header")}>
                  <div className={cx("header-content")}>{t("setting.fastMessage.table.messageContent", "Nội dung tin nhắn")}</div>
                </th>
                <th className={cx("table-header")}>{t("setting.fastMessage.table.media", "Ảnh/Video")}</th>
                <th className={cx("table-header", "action-header")}>{t("setting.fastMessage.table.action", "Hành động")}</th>
              </tr>
            </thead>
            <tbody>
              {fastMessageData && fastMessageData.map((msg, index) => (
                <tr key={msg.id} className={cx("table-row")}>
                  <td className={cx("table-cell")}>{index + 1}</td>
                  <td className={cx("table-cell")}>/{msg.keySuggest}</td>
                  <td className={cx("table-cell", "message-cell")}>{msg.messageContent}</td>
                  <td className={cx("table-cell", "media-cell")}>
                    {msg.listMediaUrl.slice(0, 3).map((media, k) => (
                      <React.Fragment key={k}>
                        {media.type === "image" && <img src={media.url} alt={String(k)} className={cx("small-preview")} />}
                        {media.type === "video" && <video src={media.url} controls className={cx("small-preview")} />}
                      </React.Fragment>
                    ))}
                    {msg.listMediaUrl.length > 3 && (
                      <div className={cx("more-image-number")}>
                        <div className={cx("number-image")}>+{msg.listMediaUrl.length - 3}</div>
                      </div>
                    )}
                  </td>

                  <td >
                    <div className="flex items-center gap-2.5 justify-center">
                      <ButtonEditIcon onClick={() => handleOpenEditFastMessage(msg)} size={22} />
                      <ButtonDeleteIcon onClick={() => handleDeleteFastMessage(msg.id)} size={22} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <div className={cx("modal-header")}>
              <h3 className={cx("modal-title")}>{t("setting.fastMessage.addQuickReply", "Thêm câu trả lời nhanh")}</h3>
              <ButtonCloseIcon onClick={() => setIsModalOpen(false)} size={22} />
            </div>

            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>{t("setting.fastMessage.shortKey", "Ký tự tắt")}</label>
                <div className={cx("input-wrapper")}>
                  <span className={cx("input-prefix")}>/</span>
                  <input
                    type="text"
                    placeholder={t("setting.fastMessage.shortKeyPlaceholder", "Nhập ký tự")}
                    value={shortKey || ""}
                    onChange={(e) => setShortKey(e.target.value)}
                    className={cx("input-keyword")}
                  />
                </div>
              </div>
              {/* Image/Video Section */}
              <div className={cx("content-block")}>
                <div className={cx("content-block-inner")}>
                  <div className={cx("content-block-header")}>
                    <span className={cx("content-label")}>{t("setting.fastMessage.imageContent", "Nội dung hình ảnh")}</span>
                  </div>

                  <div className={cx("media-added")}>
                    {selectedMedia.length === 0 && <p>{t("setting.fastMessage.noMediaSelected", "Chưa chọn hình ảnh / video")}</p>}
                    <div className={cx("image-media")}>
                      {selectedMedia
                        .filter((media) => media.type === "image")
                        .map((m) => (
                          <div key={m.url} className={cx("preview-item")}>
                            {m.type === "image" && <img src={m.url} alt="preview" className={cx("preview-img")} />}
                          </div>
                        ))}
                    </div>
                    <div className={cx("video-media")}>
                      {selectedMedia
                        .filter((media) => media.type === "video")
                        .map((m) => (
                          <div key={m.url} className={cx("preview-item")}>
                            {m.type === "video" && <video src={m.url} controls className={cx("preview-video")} />}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className={cx("content-actions")}>
                    <button className={cx("action-btn")} onClick={() => setShowMediaStore(true)}>
                      <Image size={20} />
                    </button>
                    <button
                      className={cx("action-btn")}
                      onClick={() => {
                        console.log("2");
                        setShowMediaStore(true);
                      }}
                    >
                      <Video size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Text message */}
              <div className={cx("content-block")}>
                <div className={cx("content-block-inner")}>
                  <div className={cx("content-block-header")}>
                    <span className={cx("content-label")}>{t("setting.fastMessage.messageContent", "Nội dung tin nhắn")}</span>
                    <div ref={emojiRef} className={cx("emoji-wrapper")}>
                      <BsEmojiGrinFill
                        size={20}
                        color="#ff9900"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowEmoji((prev) => !prev)}
                        className={cx("icon")}
                      />
                      {showEmoji && <MessageEmoji onSelect={handleEmojiSelect} />}
                    </div>
                  </div>
                  <textarea
                    value={messageContent}
                    placeholder={t("setting.fastMessage.messagePlaceholder", "Nhập nội dung ... (Nhấn Shift + Enter để xuống dòng)")}
                    className={cx("textarea")}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
              </div>

              <div className={cx("modal-footer")}>
                <ButtonCommon onClick={() => setIsModalOpen(false)}>{t("button.close", "Đóng")}</ButtonCommon>
                <ButtonCommon variant="agree" onClick={handleSaveFastMessage}>{t("setting.fastMessage.saveTemplate", "Lưu mẫu")}</ButtonCommon>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && editData && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <div className={cx("modal-header")}>
              <h3 className={cx("modal-title")}>{t("setting.fastMessage.editQuickReply", "Chỉnh sửa câu trả lời nhanh")}</h3>
              <ButtonCloseIcon onClick={() => setShowEdit(false)} size={22} />
            </div>

            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label className={cx("form-label")}>{t("setting.fastMessage.shortKey", "Ký tự tắt")}</label>
                <div className={cx("input-wrapper")}>
                  <span className={cx("input-prefix")}>/</span>
                  <input
                    type="text"
                    placeholder={t("setting.fastMessage.shortKeyPlaceholder", "Nhập ký tự")}
                    value={shortKey || ""}
                    onChange={(e) => setShortKey(e.target.value)}
                    className={cx("input-keyword")}
                  />
                </div>
              </div>
              {/* Image/Video Section */}
              <div className={cx("content-block")}>
                <div className={cx("content-block-inner")}>
                  <div className={cx("content-block-header")}>
                    <span className={cx("content-label")}>{t("setting.fastMessage.imageContent", "Nội dung hình ảnh")}</span>
                  </div>

                  <div className={cx("media-added")}>
                    {selectedMedia.length === 0 && <p>{t("setting.fastMessage.noMediaSelected", "Chưa chọn hình ảnh / video")}</p>}
                    <div className={cx("image-media")}>
                      {selectedMedia
                        .filter((media) => media.type === "image")
                        .map((m) => (
                          <div key={m.url} className={cx("preview-item")}>
                            {m.type === "image" && <img src={m.url} alt="preview" className={cx("preview-img")} />}
                          </div>
                        ))}
                    </div>
                    <div className={cx("video-media")}>
                      {selectedMedia
                        .filter((media) => media.type === "video")
                        .map((m) => (
                          <div key={m.url} className={cx("preview-item")}>
                            {m.type === "video" && <video src={m.url} controls className={cx("preview-video")} />}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className={cx("content-actions")}>
                    <button className={cx("action-btn")} onClick={() => setShowMediaStore(true)}>
                      <Image size={20} />
                    </button>
                    <button className={cx("action-btn")} onClick={() => setShowMediaStore(true)}>
                      <Video size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Text message */}
              <div className={cx("content-block")}>
                <div className={cx("content-block-inner")}>
                  <div className={cx("content-block-header")}>
                    <span className={cx("content-label")}>{t("setting.fastMessage.messageContent", "Nội dung tin nhắn")}</span>
                    <div ref={emojiRef} className={cx("emoji-wrapper")}>
                      <BsEmojiGrinFill
                        size={20}
                        color="#ff9900"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowEmoji((prev) => !prev)}
                        className={cx("icon")}
                      />
                      {showEmoji && <MessageEmoji onSelect={handleEmojiSelect} />}
                    </div>
                  </div>
                  <textarea
                    value={messageContent}
                    placeholder={t("setting.fastMessage.messagePlaceholder", "Nhập nội dung ... (Nhấn Shift + Enter để xuống dòng)")}
                    className={cx("textarea")}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
              </div>

              <div className={cx("modal-footer")}>
               <ButtonCommon onClick={() => setShowEdit(false)}>{t("button.close", "Đóng")}</ButtonCommon>
                <ButtonCommon variant="agree" onClick={handleSaveEdit}>{t("setting.fastMessage.saveTemplate", "Lưu mẫu")}</ButtonCommon>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMediaStore && <MediaStore onClose={setShowMediaStore} onSelect={handleSelectMedia} multiSelect={true} />}
    </div>
  );
}
