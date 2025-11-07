import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./ManageTags.module.scss";
import { CreateTag, EditTag } from "./CreateTag";
import { MdDelete } from "react-icons/md";
import { MdModeEditOutline } from "react-icons/md";

import { useBranchStore, type IBranchSetting, type TagType } from "../../zustand/branchStore";
import { v4 as uuidv4 } from "uuid";
const cx = classNames.bind(styles);

const test1 = [
  { id: "1", tagName: "Kiểm hàng", color: "#636276" },
  { id: "2", tagName: "Câu hỏi", color: "#7b2cbf" },
  { id: "3", tagName: "Mua hàng", color: "#007bff" },
  { id: "4", tagName: "Đã gửi", color: "#008000" },
  { id: "5", tagName: "Hết hàng", color: "#22a7f0" },
];
export const exapmleTagList = [
  { id: "1", tagName: "Chốt-Đang đóng hàng", color: "#00b11dff" },
  { id: "2", tagName: "Đã gửi hàng", color: "#d10374ff" },
  { id: "3", tagName: "Khách hủy", color: "#e40000ff" },
  { id: "4", tagName: "Không trả lời", color: "#b8b8b8ff" },
  { id: "5", tagName: "Đã nhận hàng", color: "#04aa2dff" },
];

export default function ManageTags() {
  const { addTag, deleteTag, updateTag, branchSettings, setUpdateBranchSettings } = useBranchStore();

  if (!branchSettings) {
    console.log('null');
    return null;
  }
  const [tagList, setTagList] = useState<TagType[]>(branchSettings.shopTagList || []);

  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState<TagType | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const handleAddTag = (arrayNew: TagType[]) => {
    // In one time added, I can set multiple tag and click Save. so arrayNew is new array tag .

    const newList = [...tagList, ...arrayNew];

    setTagList(newList);
    const newSetting: IBranchSetting = { ...branchSettings, shopTagList: newList };

    setUpdateBranchSettings(newSetting);
    addTag(arrayNew);
  };

  const handleDeleteTag = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xoá thẻ này?")) {
      const newTagList = tagList.filter((tag) => tag.id !== id);
      setTagList(newTagList);
      const newSetting = { ...branchSettings, shopTagList: newTagList };
      setUpdateBranchSettings(newSetting);
      deleteTag(id);
    }
  };
  const handleEditTag = (tagInfo: TagType) => {
    setEditTag(tagInfo);
    setShowEdit(true);
  };
  const handleSaveEdit = async (newTagInfo: TagType) => {
    let newTagList: TagType[] = [];
    setTagList((prev) => {
      const newList = prev.map((tagInfo) => {
        if (tagInfo.id === newTagInfo.id) {
          return newTagInfo;
        } else {
          return tagInfo;
        }
      });
      newTagList = [...newList];
      return newList;
    });
    const newSetting = { ...branchSettings, shopTagList: newTagList };
    setUpdateBranchSettings(newSetting);
    updateTag(newTagInfo.id, newTagInfo);
  };

  return (
    <div className={cx("main")}>
      <div className={cx("header")}>
        <h3>Thẻ hội thoại</h3>
        <div className={cx("info")}>{tagList.length} Thẻ</div>
        <button className={cx("add-btn")} onClick={() => setShowModal(true)}>
          Thêm thẻ
        </button>
      </div>

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
            {tagList.map((tag, index) => (
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
                  <button className={cx("")} onClick={() => handleEditTag(tag)}>
                    <MdModeEditOutline size={20} />
                  </button>
                  <button className={cx("delete-btn")} onClick={() => handleDeleteTag(tag.id)}>
                    <MdDelete size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <CreateTag onClose={() => setShowModal(false)} onSave={(tag) => handleAddTag(tag)} />}
      {showEdit && editTag && <EditTag tagInfo={editTag} onClose={() => setShowEdit(false)} onSave={(tag) => handleSaveEdit(tag)} />}
    </div>
  );
}
