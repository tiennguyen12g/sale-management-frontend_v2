import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./MediaStore.module.scss";
import { useShopMediaStore } from "../../zustand/shopMediaStore";
import { MdDelete } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useBranchStore } from "../../zustand/branchStore";
const cx = classNames.bind(styles);
import { useFacebookStore } from "../../zustand/facebookStore";

export interface MediaSelectType {
  id: string;
  url: string;
  type: "image" | "video";
}
interface Props {
  onClose: (v: boolean) => void;
  onSelect?: (selected: MediaSelectType[]) => void;
  multiSelect?: boolean;
}

export default function MediaStore({ onClose, onSelect, multiSelect = true }: Props) {
  const { images, videos, fetchMedia, addMedia, deleteMedia } = useShopMediaStore();
  const {selectedBranch} = useBranchStore();
  const [selected, setSelected] = useState<MediaSelectType[]>([]);
  const [notify, setNotify] = useState<string | null>(null);
  const { pageSelected } = useFacebookStore();
  if (!selectedBranch) {
    return <div>Shop ID does not found</div>;
  }
  const branch_id = selectedBranch._id;

  useEffect(() => {
    fetchMedia(branch_id);
  }, [branch_id, fetchMedia]);
  useEffect(() => {
    if (selected.length > 6 && notify === null) {
      setNotify("Giới hạn chọn tối đa 6 ảnh/video");
    } else if (notify !== null && selected.length < 7) {
      setNotify(null);
    }
  }, [selected, notify]);

  const toggleSelect = (id: string, url: string, type: "image" | "video") => {
    setSelected((prev) => {
      const exists = prev.find((m) => m.id === id);
      if (exists) return prev.filter((m) => m.url !== url);
      if (!multiSelect) return [{ url, type, id }];
      return [...prev, { url, type, id }];
    });
  };

  const confirmSelection = () => {
    if (onSelect) onSelect(selected);
    onClose(false);
  };

  const handleDeleteMedia = (shopId: string, type: "image" | "video", url: string) => {
    let userConfirmed = confirm("Bạn có chắc chắn muốn xóa?");

    if (userConfirmed) {
      console.log("User clicked OK.");
      deleteMedia(shopId, type, url);
      // Perform action if confirmed
    } else {
      console.log("User clicked Cancel.");
      // Perform action if canceled
    }
  };
  return (
    <div className={cx("main")}>
      <div className={cx("body-box")}>
        <div className={cx("header")}>
          <div className={cx("header-title")}>Hình ảnh/video hay dùng</div>
        </div>

        <div className={cx("body")}>
          <div className={cx("upload")}>
            <label className={cx("btn-add-media")}>
              Thêm ảnh/video
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const type = file.type.startsWith("image") ? "image" : "video";
                    addMedia(branch_id, file, type);
                  }
                }}
              />
            </label>
          </div>

          <div className={cx("media-section")}>
            <h4>Ảnh</h4>
            <div className={cx("grid")}>
              {images.map((img) => {
                const isSelect = selected.find((imageInfo) => imageInfo.url === img.url);
                return (
                  <div
                    key={img.url}
                    className={cx("item")}
                    onClick={() => toggleSelect(img.id, img.url, "image")}
                    style={{ border: isSelect ? "4px solid #12da00" : "4px solid transparent" }}
                  >
                    <img src={img.url} alt={img.name} />
                    <button onClick={() => handleDeleteMedia(branch_id, "image", img.url)}>
                      <MdDelete size={22} color="white" />
                    </button>
                  </div>
                );
              })}
            </div>

            <h4>Video</h4>
            <div className={cx("grid")}>
              {videos.map((vid) => {
                const isSelect = selected.find((videoInfo) => videoInfo.url === vid.url);
                return (
                  <div
                    key={vid.url}
                    className={cx("item")}
                    onClick={() => toggleSelect(vid.id, vid.url, "video")}
                    style={{ border: isSelect ? "4px solid #12da00" : "4px solid transparent" }}
                  >
                    <video src={vid.url} controls />
                    <button onClick={() => handleDeleteMedia(branch_id, "video", vid.url)}>
                      <MdDelete size={22} color="#ffffff" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={cx("footer")}>
          <div style={{ color: "red", display: "flex", alignItems: "center" }}>{notify !== null ? notify : ""}</div>
          <div className={cx("footer-btn")}>
            <button className={cx("btn-decor", "btn-nomal")} onClick={() => onClose(false)}>
              Đóng
            </button>
            <button
              className={cx("btn-primary", "btn-decor")}
              onClick={confirmSelection}
              disabled={selected.length > 6 ? true : false}
              style={{ backgroundColor: selected.length > 6 ? "gray" : "" }}
            >
              Chọn ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ✖
