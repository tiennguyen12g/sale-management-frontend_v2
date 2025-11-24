import React, { useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import classNames from "classnames/bind";
import styles from "./UploadExcelBox.module.scss";

const cx = classNames.bind(styles);

interface Props {
  onUpload: (file: File) => void;
  onClose: () => void; // ✅ allow closing modal
}

export default function UploadExcelBox({ onUpload, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleSave = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    }
  };

  return (
    <div className={cx("overlay")}>
      <div
        className={cx("upload-box", { dragOver })}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <FiUploadCloud size={36} />
        <p>Drop Excel file here or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) {
              setSelectedFile(e.target.files[0]);
            }
          }}
        />
        <button className={cx("select-btn")} onClick={handleClick}>
          Choose File
        </button>

        {selectedFile && <p className={cx("file-name")}>{selectedFile.name}</p>}

        <div className={cx("actions")}>
          <button className={cx("save-btn")} onClick={handleSave} disabled={!selectedFile}>
            Save
          </button>
          <button className={cx("close-btn")} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
