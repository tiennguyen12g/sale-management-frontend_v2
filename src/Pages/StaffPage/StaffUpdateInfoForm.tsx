import React, { useState, useEffect, type Dispatch } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames/bind";
import styles from "./StaffUpdateInfoForm.module.scss";
const cx = classNames.bind(styles);

import { AddStaff_API } from "@/config/api";
import { useStaffStore, type IStaff } from "@/zustand/staffStore";
import { useAuthStore, type UserInfoType } from "@/zustand/authStore";
import { SalaryByPosition } from "@/zustand/staffStore";
import type { ListBankType} from "@/assets/fullVietNamBanks";
import Select from "react-select";
import { useToastSeri, SelectGray } from "@tnbt/react-favorit-style";
interface AddUserInfoProps {
  fullUserData: IStaff; // optional (empty when creating)
  setIsOpenAddForm: Dispatch<React.SetStateAction<boolean>>;
  setFullUserData: Dispatch<React.SetStateAction<IStaff>>;
  listBanks: ListBankType;
}

export default function StaffUpdateInfoForm({ setIsOpenAddForm, fullUserData, setFullUserData, listBanks }: AddUserInfoProps) {
  const { t } = useTranslation();
  const { notificationToasts, successToast, errorToast, warningToast, infoToast, loadingToast, removeToast, setNotificationToasts, addToast } = useToastSeri();
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

  // ✅ submit handler (create vs update)
  const handleSubmit = async () => {
    try {
      if (fullUserData) {
        // --- update existing staff ---
        console.log("update");
        const res = await updateYourStaffProfile(fullUserData.staffID, fullUserData.company_id, staffForm); // Zustand update
        if (res.status === "success") {
         
          successToast(t("staffUpdateInfoForm.updateSuccess", "Cập nhật hồ sơ thành công!"));
          setIsOpenAddForm(false);
        } else {
          errorToast(t("staffUpdateInfoForm.updateError", "Lỗi:") + " " + (res.message || t("staffUpdateInfoForm.unknownError", "Lỗi không xác định")));
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
          successToast(t("staffUpdateInfoForm.createSuccess", "Tạo hồ sơ thành công!"));
          setIsOpenAddForm(false);
        } else {
          errorToast(t("staffUpdateInfoForm.createError", "Lỗi:") + " " + (data.message || t("staffUpdateInfoForm.unknownError", "Lỗi không xác định")));
        }
      }
    } catch (error) {
      console.error(error);
      errorToast(t("staffUpdateInfoForm.saveError", "Lỗi khi lưu hồ sơ"));
    }
  };

  const handleChangeBankInfo = (bankShortName: string) => {
    console.log('bank', bankShortName);
    const bankInfo = listBanks.data.find((bank) => bank.shortName === bankShortName);
    if (bankInfo) {
      handleBankChange("bankCode", bankInfo.code);
      handleBankChange("bankName", bankInfo.name);
      handleBankChange("bankShortName", bankInfo.shortName);
      setSelectBank(`${bankInfo.code} - ${bankInfo.shortName}`);
    }
  };

  const bankOptions = listBanks.data.map((b) => ({
    key: b.shortName,
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={b.logo} width={45} style={{ marginRight: 8 }} />
        {b.code} - {b.shortName}
      </div>
    ),
  }));

  const religionOptions = [
    {key: "No Religion", label: t("staffUpdateInfoForm.noReligion", "Không")},
    {key: "Catholic", label: t("staffUpdateInfoForm.catholic", "Thiên chúa")},
    {key: "Buddhist", label: t("staffUpdateInfoForm.buddhist", "Phật giáo")},
    {key: "Muslim", label: t("staffUpdateInfoForm.muslim", "Hồi giáo")},
  ];

  const relationshipOptions = [
    {key: "single", label: t("staffUpdateInfoForm.single", "Độc thân")},
    {key: "married", label: t("staffUpdateInfoForm.married", "Đã cưới")},
    {key: "divorced", label: t("staffUpdateInfoForm.divorced", "Ly hôn")},
    {key: "complicated", label: t("staffUpdateInfoForm.complicated", "Phức tạp")},
  ];

  return (
    <div className={cx("add-staff-form")}>
      <h4>{fullUserData ? t("staffUpdateInfoForm.editProfile", "Sửa hồ sơ") : t("staffUpdateInfoForm.createNewProfile", "Tạo hồ sơ mới")}</h4>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.fullName", "Họ và tên")}:</label>
          <input type="text" value={staffForm.staffInfo.name} onChange={(e) => handleInfoChange("name", e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.birthday", "Ngày sinh")}:</label>
          <input type="date" value={staffForm.staffInfo.birthday} onChange={(e) => handleInfoChange("birthday", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.identityId", "Số CCCD")}:</label>
          <input type="text" value={staffForm.staffInfo.identityId} onChange={(e) => handleInfoChange("identityId", e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.phone", "Số điện thoại")}:</label>
          <input type="text" value={staffForm.staffInfo.phone} onChange={(e) => handleInfoChange("phone", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row2")}>
        <label>{t("staffUpdateInfoForm.address", "Địa chỉ")}:</label>
        <input className="w-full" type="text" value={staffForm.staffInfo.address} onChange={(e) => handleInfoChange("address", e.target.value)} />
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.bankAccountNumber", "Số tài khoản ngân hàng")}:</label>
          <input type="text" value={staffForm.bankInfos.bankAccountNumber} onChange={(e) => handleBankChange("bankAccountNumber", e.target.value)} />
        </div>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.bankOwnerName", "Tên chủ tài khoản")}:</label>
          <input type="text" value={staffForm.bankInfos.bankOwnerName} onChange={(e) => handleBankChange("bankOwnerName", e.target.value)} />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.bankName", "Tên ngân hàng")}:</label>
          {/* <Select placeholder={t("staffUpdateInfoForm.selectBank", "Chọn ngân hàng")} options={bankOptions} onChange={(e) => handleChangeBankInfo(e!.value)} /> */}
          <SelectGray value={staffForm.bankInfos.bankShortName} placeHolder={t("staffUpdateInfoForm.selectBank", "Chọn ngân hàng")} options={bankOptions} onChange={(e) => handleChangeBankInfo(e)}/>
        </div>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.salary", "Lương")}:</label>
          <input type="number" value={staffForm.salary} disabled />
        </div>
      </div>

      <div className={cx("form-row")}>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.religion", "Tôn giáo")}:</label>
          <SelectGray value={staffForm.staffInfo.religion} onChange={(e) => handleInfoChange("religion", e)} options={religionOptions}/>
        </div>
        <div className={cx("field")}>
          <label>{t("staffUpdateInfoForm.relationshipStatus", "Hôn nhân")}:</label>
          <SelectGray value={staffForm.staffInfo.relationshipStatus} onChange={(e) => handleInfoChange("relationshipStatus", e)} options={relationshipOptions}/>
        </div>
      </div>

      <div className={cx("form-row2")}>
        <label>{t("staffUpdateInfoForm.description", "Giới thiệu bản thân")}:</label>
        <textarea value={staffForm.staffInfo.description} onChange={(e) => handleInfoChange("description", e.target.value)} />
      </div>

      <div className={cx("form-actions")}>
        <button className={cx("btn", "primary")} onClick={handleSubmit}>
          {fullUserData ? t("staffUpdateInfoForm.saveChanges", "Lưu thay đổi") : t("staffUpdateInfoForm.create", "Tạo mới")}
        </button>
        <button className={cx("btn", "secondary")} onClick={() => setIsOpenAddForm(false)}>
          {t("staffUpdateInfoForm.close", "Đóng")}
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
