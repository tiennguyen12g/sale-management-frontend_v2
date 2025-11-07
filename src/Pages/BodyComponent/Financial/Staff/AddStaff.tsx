import React, { useState, type Dispatch } from "react";
import classNames from "classnames/bind";
import styles from "./AddStaff.module.scss";
const cx = classNames.bind(styles);

import { AddStaff_API } from "../../../../configs/api";
import { useStaffStore } from "../../../../zustand/staffStore";
import { useAuthStore } from "../../../../zustand/authStore";
export default function AddStaff({ setIsOpenAddForm }: { setIsOpenAddForm: Dispatch<React.SetStateAction<boolean>> }) {
  // --- state for Add Staff form ---
  const { addStaffToCompany } = useStaffStore();
  const { getAuthHeader } = useAuthStore();

  const [staffForm, setStaffForm] = useState({
    name: "",
    birthday: "",
    address: "",
    phone: "",
    relationshipStatus: "single",
    religion: "No Religion",
    role: "Sale-Staff",
    baseSalary: 6000000,
    joinedDate: new Date().toISOString().split("T")[0],
    diligenceCount: 0,
    bankAccountNumber: "",
    bankOwnerName: "",
    description: "",
    accountLogin: "",
    identityId: "",
  });

  const handleStaffFormChange = (field: string, value: string | number) => {
    setStaffForm((prev) => ({ ...prev, [field]: value }));
  };
  function toSlug(str: string) {
    return str
      .normalize("NFD") // Tách dấu khỏi ký tự
      .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu
      .replace(/đ/g, "d") // Thay đ -> d
      .replace(/Đ/g, "d") // Thay Đ -> d
      .replace(/\s+/g, "") // Xóa khoảng trắng
      .toLowerCase(); // Viết thường
  }
  const handleStaffSubmit = async () => {
    try {
      const payload = {
        role: staffForm.role,
        salary: staffForm.baseSalary,
        joinedDate: staffForm.joinedDate,
        diligenceCount: staffForm.diligenceCount,
        staffID: `${toSlug(staffForm.name)}-${staffForm.phone}`,
        staffInfo: {
          name: staffForm.name,
          birthday: staffForm.birthday,
          address: staffForm.address,
          phone: staffForm.phone,
          relationshipStatus: staffForm.relationshipStatus,
          religion: staffForm.religion,
          description: staffForm.description,
          identityId: staffForm.identityId,
          accountLogin : staffForm.accountLogin,
        },
        bankInfos: {
          bankAccountNumber: staffForm.bankAccountNumber,
          bankOwnerName: staffForm.bankOwnerName,
        },
        salaryHistory: [],
        attendance: [],
      };

      const res = await fetch(AddStaff_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader()},
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Staff added successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error adding staff");
    }
  };

  return (
    <div className={cx("add-staff-form")}>
      <h4>Add New Staff</h4>

      <div className={cx("form-row")}>
        <div className={cx('field')}>
          <label>Name:</label>
          <input type="text" value={staffForm.name} onChange={(e) => handleStaffFormChange("name", e.target.value)} />
        </div>
        <div className={cx('field')}>
          <label>Birthday:</label>
          <input type="date" value={staffForm.birthday} onChange={(e) => handleStaffFormChange("birthday", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx('field')}>
          <label>Identity ID:</label>
          <input type="text" value={staffForm.identityId} onChange={(e) => handleStaffFormChange("identityId", e.target.value)} />
        </div>
        <div className={cx('field')}>
          <label>Account Login</label>
          <input type="text" value={staffForm.accountLogin} onChange={(e) => handleStaffFormChange("accountLogin", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row2")}>
        <label>Address:</label>
        <input type="text" value={staffForm.address} onChange={(e) => handleStaffFormChange("address", e.target.value)} />
      </div>

      <div className={cx("form-row")}>
        <div className={cx('field')}>
          <label>Phone:</label>
          <input type="text" value={staffForm.phone} onChange={(e) => handleStaffFormChange("phone", e.target.value)} />
        </div>
        <div className={cx('field')}>
          <label>Salary:</label>
          <input type="number" value={staffForm.baseSalary} onChange={(e) => handleStaffFormChange("salary", Number(e.target.value))} />
        </div>
      </div>

      <div className={cx("form-row")}></div>

      <div className={cx("form-row")}>
        <div className={cx('field')}>
          <label>Religion:</label>
          <select value={staffForm.religion} onChange={(e) => handleStaffFormChange("religion", e.target.value)}>
            <option value="No Religion">No Religion</option>
            <option value="Catholic">Catholic</option>
            <option value="Buddhist">Buddhist</option>
            <option value="Muslim">Muslim</option>
          </select>
        </div>
        <div className={cx('field')}>
          <label>Relationship:</label>
          <select value={staffForm.relationshipStatus} onChange={(e) => handleStaffFormChange("relationshipStatus", e.target.value)}>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="complicated">Complicated</option>
          </select>
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx('field')}>
          <label>Role:</label>
          <select value={staffForm.role} onChange={(e) => handleStaffFormChange("role", e.target.value)}>
            <option value="Director">Director</option>
            <option value="Manager">Manager</option>
            <option value="Sale-Staff">Sale-Staff</option>
            <option value="Security">Security</option>
            <option value="Packer">Packer</option>
          </select>
        </div>
        <div className={cx('field')}>
          <label>Joined Date:</label>
          <input type="date" value={staffForm.joinedDate} onChange={(e) => handleStaffFormChange("joinedDate", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx('field')}>
          <label>Bank Account Number:</label>
          <input type="text" value={staffForm.bankAccountNumber} onChange={(e) => handleStaffFormChange("bankAccountNumber", e.target.value)} />
        </div>
        <div className={cx('field')}>
          <label>Bank Owner Name:</label>
          <input type="text" value={staffForm.bankOwnerName} onChange={(e) => handleStaffFormChange("bankOwnerName", e.target.value)} />
        </div>
      </div>
      <div className={cx("form-row2")}>
        <label>Description:</label>
        <textarea value={staffForm.description} onChange={(e) => handleStaffFormChange("description", e.target.value)} />
      </div>

      <div className={cx("form-actions")}>
        <button className={cx("btn", "primary")} onClick={handleStaffSubmit}>
          Add Staff
        </button>
        <button className={cx("btn", "secondary")} onClick={() => setIsOpenAddForm(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
