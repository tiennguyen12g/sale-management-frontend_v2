import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./CreateTag.module.scss";
import { v4 as uuidv4 } from "uuid";
import { MdDelete } from "react-icons/md";
import { MdModeEditOutline } from "react-icons/md";
const cx = classNames.bind(styles);

interface CreateTagProps {
  onClose: () => void;
  onSave: (arrayNew: TagType[]) => void;
}
import { type TagType } from "../../zustand/branchStore";
export function CreateTag({ onClose, onSave }: CreateTagProps) {
  const [tagName, setTagName] = useState("");
  const [color, setColor] = useState("#00b11d");
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [listNewAdd, setListNewAdd] = useState<TagType[]>([]);

  const presetColors = ["#2E2E2E", "#FF6B00", "#FFB703", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#FACC15", "#10B981"];

  const handleSubmit = () => {
    if (listNewAdd.length === 0) return alert("Không có thẻ nào được thêm.");
    onSave(listNewAdd);
    onClose();
  };

  const handleDeleteTag = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xoá thẻ này?")) {
      setListNewAdd((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleAddNew = () => {
    const newTag = {
      id: uuidv4(),
      tagName,
      color,
    };
    setListNewAdd((prev) => {
      return [...prev, newTag];
    });
    setColor("#00b11d");
    setTagName("");
  };
  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("header")}>
          <h3>Thêm mới thẻ</h3>
          <button className={cx("close-btn")} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={cx("form-group")}>
          <label>Tên thẻ</label>
          <input type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="Nhập tên thẻ..." />
        </div>

        <div className={cx("form-group")}>
          <label>Bộ chọn màu</label>
          <div className={cx("color-row")}>
            {/* ✅ Custom color picker */}
            <label className={cx("color-picker-label")}>
              🎨
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            {presetColors.map((c) => (
              <div key={c} className={cx("color-box", color === c && "active")} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>

        <div className={cx("form-group")}>
          <label>Xem trước Màu chủ đề sẽ được hiển thị</label>
          <div className={cx("color-preview")} style={{ backgroundColor: color }}>
            {tagName || "Thẻ mới"}
          </div>
        </div>

        {/* <div className={cx("form-group")}>
          <label>Mô tả thẻ</label>
          <textarea
            rows={3}
            placeholder="Nhập mô tả..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div> */}

        {/* <div className={cx("form-group", "checkbox")}>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          <span>Ngừng sử dụng thẻ này</span>
        </div> */}
        <div className={cx("new-added")}>
          <div className={cx("table-wrapper")}>
            <table className={cx("table")}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên thẻ</th>
                  <th>Màu sắc</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {listNewAdd.map((tag, index) => (
                  <tr key={tag.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={cx("tag-item")}>
                        <span className={cx("tag-color")} style={{ backgroundColor: tag.color }} />
                        {tag.tagName}
                      </div>
                    </td>
                    <td>
                      <div className={cx("color-preview")} style={{ backgroundColor: tag.color }} />
                    </td>
                    <td>
                      <button className={cx("delete-btn")} onClick={() => handleDeleteTag(tag.id)}>
                        <MdDelete size={22} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cx("footer")}>
          {/* <button className={cx("cancel")} onClick={onClose}>Đóng</button> */}
          <button className={cx("add")} onClick={handleAddNew}>
            Thêm thẻ
          </button>
          <button className={cx("save")} onClick={handleSubmit}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditTagProps {
  tagInfo: { id: string; tagName: string; color: string };
  onClose: () => void;
  onSave: (tag: { id: string; tagName: string; color: string }) => void;
}
export function EditTag({ tagInfo, onClose, onSave }: EditTagProps) {
  const [tagName, setTagName] = useState(tagInfo.tagName);
  const [color, setColor] = useState(tagInfo.color);
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  const presetColors = ["#2E2E2E", "#FF6B00", "#FFB703", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#FACC15", "#10B981"];

  const handleSubmit = () => {
    if (!tagName.trim()) return alert("Vui lòng nhập tên thẻ");
    onSave({ id: tagInfo.id, tagName, color });
    onClose();
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("header")}>
          <h3>Thêm mới thẻ</h3>
          <button className={cx("close-btn")} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={cx("form-group")}>
          <label>Tên thẻ</label>
          <input type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="Nhập tên thẻ..." />
        </div>

        <div className={cx("form-group")}>
          <label>Bộ chọn màu</label>
          <div className={cx("color-row")}>
            {/* ✅ Custom color picker */}
            <label className={cx("color-picker-label")}>
              🎨
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            {presetColors.map((c) => (
              <div key={c} className={cx("color-box", color === c && "active")} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>

        <div className={cx("form-group")}>
          <label>Xem trước Màu chủ đề sẽ được hiển thị</label>
          <div className={cx("color-preview")} style={{ backgroundColor: color }}>
            {tagName || "Thẻ mới"}
          </div>
        </div>

        {/* <div className={cx("form-group")}>
          <label>Mô tả thẻ</label>
          <textarea
            rows={3}
            placeholder="Nhập mô tả..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div> */}

        <div className={cx("form-group", "checkbox")}>
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
          <span>Ngừng sử dụng thẻ này</span>
        </div>

        <div className={cx("footer")}>
          <button className={cx("cancel")} onClick={onClose}>
            Đóng
          </button>
          <button className={cx("save")} onClick={handleSubmit}>
            Lưu chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
