import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./CreateTag.module.scss";
import { v4 as uuidv4 } from "uuid";
import { MdDelete } from "react-icons/md";
import { MdModeEditOutline } from "react-icons/md";
const cx = classNames.bind(styles);
import { AddButton, ButtonCommon, Button , ButtonCloseIcon, ButtonDeleteIcon, ButtonEditIcon } from "@tnbt/react-favorit-style";
import {useTranslation} from "react-i18next";
import { icons } from "@/components/ui/icons/Icons";
interface CreateTagProps {
  onClose: () => void;
  onSave: (arrayNew: TagType[]) => void;
}
import { type TagType } from "../../zustand/branchStore";
export function CreateTag({ onClose, onSave }: CreateTagProps) {
  const [tagName, setTagName] = useState("");
  const {t} = useTranslation();
  const [color, setColor] = useState("#00b11d");
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [listNewAdd, setListNewAdd] = useState<TagType[]>([]);

  const presetColors = ["#2E2E2E", "#FF6B00", "#FFB703", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#FACC15", "#10B981"];

  const handleSubmit = () => {
    if (listNewAdd.length === 0) return alert(t("setting.tags.create.noTagsAdded", "Không có thẻ nào được thêm."));
    onSave(listNewAdd);
    onClose();
  };

  const handleDeleteTag = (id: string) => {
    if (window.confirm(t("setting.tags.create.confirmDelete", "Bạn có chắc muốn xoá thẻ này?"))) {
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
          <h3>{t("setting.tags.create.title", "Thêm mới thẻ")}</h3>
          <ButtonCloseIcon onClick={onClose} size={22} className= "text-gray-400 hover:text-gray-600"/>
        </div>

        <div className={cx("form-group")}>
          <label>{t("setting.tags.create.tagName", "Tên thẻ")}</label>
          <input type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder={t("setting.tags.create.tagNamePlaceholder", "Nhập tên thẻ...")} />
        </div>

        <div className={cx("form-group")}>
          <label>{t("setting.tags.create.colorPicker", "Bộ chọn màu")}</label>
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
          <label>{t("setting.tags.create.colorPreview", "Xem trước Màu chủ đề sẽ được hiển thị")}</label>
          <div className={cx("color-preview")} style={{ backgroundColor: color }}>
            {tagName || t("setting.tags.create.tagNameAndColor", "Tên thẻ và màu sắc")}
          </div>
        </div>

        <div className={cx("new-added")}>
          <div className={cx("table-wrapper")}>
            <table className={cx("table")}>
              <thead>
                <tr>
                  <th>{t("setting.tags.create.table.stt", "STT")}</th>
                  <th>{t("setting.tags.create.table.tagName", "Tên thẻ")}</th>
                  <th>{t("setting.tags.create.table.color", "Màu sắc")}</th>
                  <th>{t("setting.tags.create.table.action", "Hành động")}</th>
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
                      <ButtonDeleteIcon onClick={() => handleDeleteTag(tag.id)} size={22}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cx("footer")}>
          <AddButton className="bg-blue-500 hover:bg-blue-600" size="sm" onClick={handleAddNew}>{t("button.addNew","Thêm thẻ")}</AddButton>
          <ButtonCommon variant="agree" size="sm" onClick={handleSubmit}>{t("button.save", "Lưu")}</ButtonCommon>
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
  const { t } = useTranslation();
  const [tagName, setTagName] = useState(tagInfo.tagName);
  const [color, setColor] = useState(tagInfo.color);
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  const presetColors = ["#2E2E2E", "#FF6B00", "#FFB703", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#FACC15", "#10B981"];

  const handleSubmit = () => {
    if (!tagName.trim()) return alert(t("setting.tags.edit.enterTagName", "Vui lòng nhập tên thẻ"));
    onSave({ id: tagInfo.id, tagName, color });
    onClose();
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("header")}>
          <h3>{t("setting.tags.edit.title", "Chỉnh sửa thẻ")}</h3>
          <ButtonCloseIcon onClick={onClose} size={22}/>
        </div>

        <div className={cx("form-group")}>
          <label>{t("setting.tags.edit.tagName", "Tên thẻ")}</label>
          <input type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder={t("setting.tags.edit.tagNamePlaceholder", "Nhập tên thẻ...")} />
        </div>

        <div className={cx("form-group")}>
          <label>{t("setting.tags.edit.colorPicker", "Bộ chọn màu")}</label>
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
          <label>{t("setting.tags.edit.colorPreview", "Xem trước Màu chủ đề sẽ được hiển thị")}</label>
          <div className={cx("color-preview")} style={{ backgroundColor: color }}>
            {tagName || t("setting.tags.edit.newTag", "Thẻ mới")}
          </div>
        </div>

        <div className={cx("form-group", "checkbox")}>
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
          <span>{t("setting.tags.edit.disableTag", "Ngừng sử dụng thẻ này")}</span>
        </div>

        <div className={cx("footer")}>
          <ButtonCommon variant="cancel" size="sm" onClick={onClose}>{t("button.close", "Đóng")}</ButtonCommon>
          <ButtonCommon variant="agree" size="sm" onClick={handleSubmit}>{t("setting.tags.edit.saveEdit", "Lưu chỉnh sửa")}</ButtonCommon>
        </div>
      </div>
    </div>
  );
}
