import React, { useState, useEffect, type Dispatch } from "react";
import classNames from "classnames/bind";
import styles from "./AddUserInfo.module.scss";
const cx = classNames.bind(styles);

import { AddStaff_API, EditStaffInfo_API } from "../configs/api";
import { useStaffStore, type IStaff } from "../zustand/staffStore";
import { useAuthStore, type UserInfoType } from "../zustand/authStore";
import { SalaryByPosition } from "../zustand/staffStore";
import type { ListBankType, BankInfoType } from "../assets/fullVietNamBanks";
import CustomSelectGlobal from "../ultilitis/CustomSelectGlobal";
import Select from "react-select";
import { fullVietNamBanks } from "../assets/fullVietNamBanks";
interface AddUserInfoProps {
  fullUserData: IStaff; // optional (empty when creating)
  setIsOpenAddForm: Dispatch<React.SetStateAction<boolean>>;
  setFullUserData: Dispatch<React.SetStateAction<IStaff>>;
  listBanks: ListBankType;
}

export default function AddUserInfo({ setIsOpenAddForm, fullUserData, setFullUserData, listBanks }: AddUserInfoProps) {
  const { updateYourStaffProfile } = useStaffStore();
  const { getAuthHeader } = useAuthStore();
  const [selectBank, setSelectBank] = useState<string | null>(null);

  // ✅ initialize from fullUserData if exists (edit), else defaults (create)
  const [staffForm, setStaffForm] = useState<IStaff | Omit<IStaff, "_id">>(fullUserData);

  // auto-update salary if role changes
  useEffect(() => {
    setStaffForm((prev) => ({
      ...prev,
      salary: SalaryByPosition[prev.role] || 0,
    }));
  }, [staffForm.role]);

  const handleChange = (field: string, value: string | number) => {
    setStaffForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInfoChange = (field: keyof UserInfoType, value: string) => {
    setStaffForm((prev) => ({
      ...prev,
      staffInfo: { ...prev.staffInfo, [field]: value },
    }));
  };

  const handleBankChange = (field: "bankAccountNumber" | "bankOwnerName" | "bankName" | "bankShortName" | "bankCode", value: string) => {
    setStaffForm((prev) => ({
      ...prev,
      bankInfos: { ...prev.bankInfos, [field]: value },
    }));
  };

  useEffect(() => {
    if (staffForm.staffInfo.name !== "" && staffForm.staffInfo.phone !== "") {
      const staffID = `${toSlug(staffForm.staffInfo.name)}-${staffForm.staffInfo.phone}`;
      // console.log('staffID', staffID);
      setStaffForm((prev) => ({
        ...prev,
        staffID: staffID,
      }));
    }
  }, [staffForm.staffInfo.name, staffForm.staffInfo.phone]);

  // ✅ submit handler (create vs update)
  const handleSubmit = async () => {
    try {
      if (fullUserData?.userId) {
        // --- update existing staff ---
        console.log("update");
        const res = await fetch(`${EditStaffInfo_API}/${fullUserData.staffID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(staffForm),
        });

        const data = await res.json();
        if (res.ok) {
          updateYourStaffProfile(data); // Zustand update
          setFullUserData(data); // update parent state
          alert("Cập nhật hồ sơ thành công!");
          setIsOpenAddForm(false);
        } else {
          alert("Error: " + data.message);
        }
      } else {
        // --- create new staff ---
        const res = await fetch(AddStaff_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(staffForm),
        });

        const data = await res.json();
        if (res.ok) {
          setFullUserData(data);
          staffForm;
          alert("Tạo hồ sơ thành công!");
          setIsOpenAddForm(false);
        } else {
          alert("Error: " + data.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu hồ sơ");
    }
  };

  const handleChangeBankInfo = (bankShortName: string) => {
    const bankInfo = listBanks.data.find((bank) => bank.shortName === bankShortName);
    if (bankInfo) {
      handleBankChange("bankCode", bankInfo.code);
      handleBankChange("bankName", bankInfo.name);
      handleBankChange("bankShortName", bankInfo.shortName);
      setSelectBank(`${bankInfo.code} - ${bankInfo.shortName}`);
    }
  };

  const bankOptions = listBanks.data.map((b) => ({
    value: b.shortName,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={b.logo} width={45} style={{ marginRight: 8 }} />
        {b.code} - {b.shortName}
      </div>
    ),
  }));

  return (
    <div className={cx("add-staff-form")}>
      <h4>{fullUserData ? "Sửa hồ sơ" : "Tạo hồ sơ mới"}</h4>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>Họ và tên:</label>
          <input type="text" value={staffForm.staffInfo.name} onChange={(e) => handleInfoChange("name", e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>Ngày sinh:</label>
          <input type="date" value={staffForm.staffInfo.birthday} onChange={(e) => handleInfoChange("birthday", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>Số CCCD:</label>
          <input type="text" value={staffForm.staffInfo.identityId} onChange={(e) => handleInfoChange("identityId", e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>Số điện thoại:</label>
          <input type="text" value={staffForm.staffInfo.phone} onChange={(e) => handleInfoChange("phone", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row2")}>
        <label>Địa chỉ:</label>
        <input type="text" value={staffForm.staffInfo.address} onChange={(e) => handleInfoChange("address", e.target.value)} />
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>Số tài khoản ngân hàng:</label>
          <input type="text" value={staffForm.bankInfos.bankAccountNumber} onChange={(e) => handleBankChange("bankAccountNumber", e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>Tên chủ tài khoản:</label>
          <input type="text" value={staffForm.bankInfos.bankOwnerName} onChange={(e) => handleBankChange("bankOwnerName", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>Tên ngân hàng:</label>
          {/* <select  onChange={(e) => handleChangeBankInfo(e.target.value)}>
            <option>Chọn ngân hàng</option>
            {listBanks &&
              listBanks.data.map((bankInfo, i) => {
                return (
                  <option key={i} className={cx("option-bank")} value={bankInfo.shortName}>
                    {bankInfo.code} - {bankInfo.shortName}
                  </option>
                );
              })}
          </select> */}
          <Select placeholder="Chọn ngân hàng" options={bankOptions} onChange={(e) => handleChangeBankInfo(e!.value)} />
        </div>
        <div className={cx("field")}>
          <label>Lương:</label>
          <input type="number" value={staffForm.salary} disabled />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>Tôn giáo:</label>
          <select value={staffForm.staffInfo.religion} onChange={(e) => handleInfoChange("religion", e.target.value)}>
            <option value="No Religion">Không</option>
            <option value="Catholic">Thiên chúa</option>
            <option value="Buddhist">Phật giáo</option>
            <option value="Muslim">Hồi giáo</option>
          </select>
        </div>
        <div className={cx("field")}>
          <label>Hôn nhân:</label>
          <select value={staffForm.staffInfo.relationshipStatus} onChange={(e) => handleInfoChange("relationshipStatus", e.target.value)}>
            <option value="single">Độc thân</option>
            <option value="married">Đã cưới</option>
            <option value="divorced">Ly hôn</option>
            <option value="complicated">Phức tạp</option>
          </select>
        </div>
      </div>

      <div className={cx("form-row2")}>
        <label>Giới thiệu bản thân:</label>
        <textarea value={staffForm.staffInfo.description} onChange={(e) => handleInfoChange("description", e.target.value)} />
      </div>

      <div className={cx("form-actions")}>
        <button className={cx("btn", "primary")} onClick={handleSubmit}>
          {fullUserData ? "Lưu thay đổi" : "Tạo mới"}
        </button>
        <button className={cx("btn", "secondary")} onClick={() => setIsOpenAddForm(false)}>
          Đóng
        </button>
      </div>
    </div>
  );
}

// convert name to lowercase and remove vietnamese character
function toSlug(str: string) {
  return str
    .normalize("NFD") // Tách dấu khỏi ký tự
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu
    .replace(/đ/g, "d") // Thay đ -> d
    .replace(/Đ/g, "d") // Thay Đ -> d
    .replace(/\s+/g, "") // Xóa khoảng trắng
    .toLowerCase(); // Viết thường
}
