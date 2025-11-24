// src/components/pages/ImportExport/sections/ExportSection.tsx
import React, { useState } from "react";
import classNames from 'classnames/bind'
import styles from './ImportExportInventort_v2.module.scss'
const cx = classNames.bind(styles)
import UploadExcelBox from "../../../../utils/UploadExcelBox";
import AddManualForm from "./AddManualForm";
import AddExportModel from "./AddExportModel";
import ExportTable from "./ExportTable";
import type { ExportRecord, ImportRecord } from "../../../../zustand/importExportStore";


interface Props {
  data: ExportRecord[];
  importData: ImportRecord[]

}

export default function ExportSection({ data , importData}: Props) {
  const [showExcel, setShowExcel] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <section className={cx("section")}>
      <div className={cx("actions")}>
        <div style={{fontSize: 20, fontWeight: 600}}>⬆️ Exports</div>
        <div>
          <button onClick={() => setShowExcel(true)}>⬆️ Upload Excel</button>
          <button className={cx("btn-primary")} style={{marginLeft: 10, height: 35}} onClick={() => setShowModal(true)}>Add Export</button>
        </div>
      </div>

      <ExportTable data={data}  />

      {showExcel && <UploadExcelBox onUpload={(f) => console.log("Export Upload", f)} onClose={() => setShowExcel(false)} />}
      {showModal && <AddExportModel open={showModal} onClose={() => setShowModal(false)}  importData={importData}/>}
    </section>
  );
}
