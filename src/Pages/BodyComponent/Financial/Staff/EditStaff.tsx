import React, { useState } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./EditStaff.module.scss";
const cx = classNames.bind(styles);
// import type { StaffDataType, SalaryHistoryType, RelationshipStatus } from "../DataTest/DataForStaffSalary";
import type { StaffDataType, RelationshipStatus } from "../../../../zustand/staffStore";
import { EditStaffInfo_API } from "../../../../config/api";
import { useStaffStore } from "../../../../zustand/staffStore";
import { useAuthStore } from "../../../../zustand/authStore";
interface EditStaffProps {
  staffData: StaffDataType;
  setIsOpenEditForm: (value: boolean) => void;
}

const EditStaff: React.FC<EditStaffProps> = ({ staffData, setIsOpenEditForm }) => {
  const [formData, setFormData] = useState<StaffDataType>(staffData);
    const { updateStaff } = useStaffStore();
    const { getAuthHeader } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await axios.put(`${EditStaffInfo_API}/${formData.staffID}`, formData,
      { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
    );
    alert("Staff updated successfully!");

    // ✅ Update Zustand store with new staff data
    useStaffStore.getState().updateStaff(res.data);

    setIsOpenEditForm(false);
  } catch (error) {
    console.error(error);
    alert("Failed to update staff.");
  }
};


  return (
    <div className={styles["edit-staff-container"]}>
      <form className={styles["edit-staff-form"]} onSubmit={handleSubmit}>
        <h3 >Edit Staff</h3>

        {/* Basic Info */}
        <div className={cx("form-row")}>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={formData.staffInfo.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  staffInfo: { ...formData.staffInfo, name: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              type="text"
              value={formData.staffInfo.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  staffInfo: { ...formData.staffInfo, phone: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div className={cx("form-row")}>
          <div>
            <label>Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffDataType["role"] })}>
              <option value="Director">Director</option>
              <option value="Manager">Manager</option>
              <option value="Sale-Staff">Sale-Staff</option>
              <option value="Packer">Packer</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <div>
            <label>Relationship:</label>
            <select
              value={formData.staffInfo.relationshipStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  staffInfo: { ...formData.staffInfo, relationshipStatus: e.target.value as RelationshipStatus },
                })
              }
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="complicated">Complicated</option>
            </select>
          </div>
        </div>
        <div className={cx('form-row')}>
          <div>
            <label>Staff ID</label>
            <input type="text" value={formData.staffID} disabled onChange={(e) => setFormData({ ...formData, staffID: e.target.value })} />
          </div>
          {/* <div>
            <label>Diligence Count</label>
            <input type="number" value={formData.diligenceCount} onChange={(e) => setFormData({ ...formData, diligenceCount: Number(e.target.value) })} />
          </div> */}
                  <div>
          <label>Joined Date:</label>
          <input type="date" value={formData.joinedDate} onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })} />
        </div>
        </div>

        <div className={cx("form-row2")}>
          <label>Address</label>
          <input
            type="text"
            value={formData.staffInfo.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                staffInfo: { ...formData.staffInfo, address: e.target.value },
              })
            }
          />
        </div>

        {/* Bank Info */}
        <h4>Bank Information</h4>
        <div className={cx("form-row")}>
          <div>
            <label>Bank Account</label>
            <input
              type="text"
              value={formData.bankInfos.bankAccountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfos: { ...formData.bankInfos, bankAccountNumber: e.target.value },
                })
              }
            />
          </div>

          <div>
            <label>Bank Owner Name</label>
            <input
              type="text"
              value={formData.bankInfos.bankOwnerName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfos: { ...formData.bankInfos, bankOwnerName: e.target.value },
                })
              }
            />
          </div>
        </div>
        {/* Actions */}
        <div className={styles["form-actions"]}>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsOpenEditForm(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;
