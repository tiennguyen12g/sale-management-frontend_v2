import React, { useState } from "react";
import classNames from 'classnames/bind'
import styles from './ImportExportInventort_v2.module.scss'
const cx = classNames.bind(styles)
import UploadExcelBox from "../../../../utils/UploadExcelBox";
import AddManualForm from "./AddManualForm";
import AddImportModal from "./AddImportModal";
import ImportTable from "./ImportTable";
import type { ImportRecord } from "../../../../zustand/importExportStore";


interface Props {
  data: ImportRecord[];
//   onEdit: (item: ImportRecord) => void;
//   onDelete: (id: string) => void;
}

export default function ImportSection({ data}: Props) {
  const [showExcel, setShowExcel] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <section className={cx("section")}>
      <div className={cx("actions")} style={{display: "flex", alignItems: "center"}}>
        <div style={{fontSize: 20, fontWeight: 600}}>⬇️ Imports</div>
        <div>
          <button style={{}} onClick={() => setShowExcel(true)}>⬆️ Upload Excel</button>
          <button className={cx("btn-primary")} style={{marginLeft: 10, height: 35}} onClick={() => setShowModal(true)}>Add Import</button>
        </div>
      </div>

      <ImportTable data={data} />

      {showExcel && <UploadExcelBox onUpload={(f) => console.log("Import Upload", f)} onClose={() => setShowExcel(false)} />}
      {showModal && <AddImportModal open={showModal} onClose={() => setShowModal(false)} />}
    </section>
  );
}