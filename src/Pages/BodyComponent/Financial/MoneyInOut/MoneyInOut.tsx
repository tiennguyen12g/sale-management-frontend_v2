import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./MoneyInOut.module.scss";
const cx = classNames.bind(styles);
// import { moneyInOutData } from "../DataTest/DataForMoney";
import type {
  MoneyInOutDataType,
  MoneyInOut_Action_Type,
  MoneyInOut_SourceFund_Type,
  MoneyInOut_DestinationFund_Type,
  MoneyBankAccounts_Type,
} from "../DataTest/DataForMoney";

import { ArrayDestinationfund, ArraySourceFund, ArrayBankAcc } from "../DataTest/DataForMoney";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useMoneyInOutStore } from "../../../../zustand/moneyInOutStore";
import UploadExcelBox from "../../../../ultilitis/UploadExcelBox";
import { UploadMoneyInOut_API } from "../../../../config/api";
import MoneyInOutDiagram from "./MoneyInOutDiagram";
import type { MoneyTransitionType, SegmentType, DiagramProps } from "./MoneyInOutDiagram";

import { useMoneyBankStore } from "../../../../zustand/bankStore";
import {useAuthStore} from "../../../../zustand/authStore"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface FilterOptions {
  mode: "month" | "year" | "all";
  action: string; // "all" | "deposit" | "send" | "withdraw" | "payment"
  selectedMonth?: number;
  selectedYear?: number;
  source?: MoneyInOut_SourceFund_Type | "None";
  destination?: MoneyInOut_DestinationFund_Type | "None";
}

export function filterMoneyInOuts(data: MoneyInOutDataType[], opts: FilterOptions): MoneyInOutDataType[] {
  return data.filter((item) => {
    const d = new Date(item.date);

    // 1. Filter by time
    if (opts.mode === "month") {
      if (d.getMonth() + 1 !== opts.selectedMonth || d.getFullYear() !== opts.selectedYear) {
        return false;
      }
    }
    if (opts.mode === "year") {
      if (d.getFullYear() !== opts.selectedYear) return false;
    }

    // 2. Filter by action
    if (opts.action !== "all" && item.action.toLowerCase() !== opts.action.toLowerCase()) {
      return false;
    }

    // 3. Filter by source
    if (opts.source && opts.source !== "None" && item.sourceFund !== opts.source) {
      return false;
    }

    // 4. Filter by destination
    if (opts.destination && opts.destination !== "None" && item.destinationFund !== opts.destination) {
      return false;
    }

    return true;
  });
}
export default function MoneyInOut() {
  const { getAuthHeader } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("all");
  const [filterMode, setFilterMode] = useState<"month" | "year" | "all">("all");
  const [filterBySource, setFilterBySource] = useState("None");
  const [filterByDestination, setFilterByDestination] = useState("None");

  const [isShowBankBox, setIsShowBankBox] = useState(false);
  const [isShowEditBankBox, setIsShowEditBankBox] = useState(false);
  const [bankEditData, setBankEditData] = useState<MoneyBankAccounts_Type>({
    _id: "",
    owner: "Original",
    bankName: "",
    shortName: "",
    bankAccountNumber: 123456789,
    type: "normal",
    balance: 0,
    revenueAdded: 0,
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [isShowAddBox, setIsShowAddBox] = useState(false);
  const [isShowUploadBox, setIsShowUploadBox] = useState(false);

  const { moneyInOuts, fetchMoneyInOuts, updateMoneyInOut, addMoneyInOut, deleteMoneyInOut, loading, updateUploadExcel } = useMoneyInOutStore();
  const { accounts, addAccount, fetchAccounts, updateAccount, deleteAccount } = useMoneyBankStore();
  const [moneyActionNotify, setMoneyActionNotify] = useState<string | null>(null);
  const [moneyActionState, setMoneyActionState] = useState({ action: "Send", sendValue: 0, balanceValue: 0 });

  const [isShowEditBox, setIsShowEditBox] = useState(false);
  const [editData, setEditData] = useState<MoneyInOutDataType>({
    _id: "",
    action: "electric" as MoneyInOut_Action_Type,
    date: new Date().toISOString().split("T")[0],
    value: 0,
    usedFor: "",
    note: "",
    sourceFund: "Carrier" as MoneyInOut_SourceFund_Type,
    destinationFund: "Original" as MoneyInOut_DestinationFund_Type,
  });

  const [selectedVisa, setSelectedVisa] = useState<string>("");

  useEffect(() => {
    fetchMoneyInOuts(getAuthHeader());
  }, [fetchMoneyInOuts]);
  useEffect(() => {
    fetchAccounts(getAuthHeader());
  }, [fetchAccounts]);

  // -- Tracking Money transfer valid balance
  useEffect(() => {

    if (moneyActionState.balanceValue < moneyActionState.sendValue && moneyActionState.action === "send") {
      setMoneyActionNotify("Balance is insufficent");
    } else {
      setMoneyActionNotify(null);
    }
  }, [moneyActionState]);

  // -- Add New form state
  const [form, setForm] = useState<Omit<MoneyInOutDataType, "_id" | "userId">>({
    action: "deposit" as MoneyInOut_Action_Type,
    date: new Date().toISOString().split("T")[0],
    value: 0,
    usedFor: "Test",
    note: "",
    sourceFund: "Carrier" as MoneyInOut_SourceFund_Type,
    destinationFund: "Original" as MoneyInOut_DestinationFund_Type,
  });
  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "sourceFund") {
      const details = accounts.find((item) => item.owner === value);
      const balance = details?.balance || 0;
      setMoneyActionState((prev) => {
        return { ...prev, balanceValue: balance };
      });
    }
    if (field === "value") {
      setMoneyActionState((prev) => {
        return { ...prev, sendValue: Number(value) };
      });
    }
    if (field === "action") {
      setMoneyActionState((prev) => {
        return { ...prev, action: value };
      });
    }
  };
  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (form.action === "send" || form.action === "withdraw") {
        const sourceFund = form.sourceFund;
        const desFund = form.destinationFund;
        if (sourceFund === "NetCash" || sourceFund === "Original" || sourceFund === "Flexible" || sourceFund === "Visa" || sourceFund === "Receive") {
          const bankInfo = accounts.find((item) => item.owner === sourceFund);

          if (sourceFund === "Visa") {
            const bankSenderInfo = accounts.find((item) => item.shortName === selectedVisa);
            const bankReceiveInfo = accounts.find((item) => item.owner === desFund);
            if (bankSenderInfo && bankReceiveInfo) {
              if (bankSenderInfo.balance < Number(form.value)) {
                setMoneyActionNotify("Balance is insufficient");
                return;
              } else {
                // console.log("bankSenderInfo", bankSenderInfo);
                // console.log("bankReceiveInfo", bankReceiveInfo);
                const newBalanceSender = bankSenderInfo.balance - Number(form.value);
                const newBalanceReceiver = bankReceiveInfo.balance + Number(form.value);
                await updateAccount(bankSenderInfo._id, {
                  ...bankSenderInfo,
                  balance: newBalanceSender,
                }, getAuthHeader());
                await updateAccount(bankReceiveInfo._id, {
                  ...bankReceiveInfo,
                  balance: newBalanceReceiver,
                }, getAuthHeader());
              }
            }
          } else {
            let bankReceiveInfo = accounts.find((item) => item.owner === desFund);
            if (desFund === "Visa") {
              bankReceiveInfo = accounts.find((item) => item.shortName === selectedVisa);
            }

            if (bankInfo && bankReceiveInfo) {
              if (bankInfo.balance < Number(form.value)) {
                setMoneyActionNotify("Balance is insufficient");
                return;
              }
              const newBalanceSender = bankInfo.balance - Number(form.value);
              const newBalanceReceiver = bankReceiveInfo.balance + Number(form.value);
              await updateAccount(bankInfo._id, {
                ...bankInfo,
                balance: newBalanceSender,
              }, getAuthHeader());
              await updateAccount(bankReceiveInfo._id, {
                ...bankReceiveInfo,
                balance: newBalanceReceiver,
              }, getAuthHeader());
            }
          }
        } else if (sourceFund === "Facebook" || sourceFund === "Tiktok" || sourceFund === "Shopee") {
          const bankSenderInfo = accounts.find((item) => item.owner === sourceFund);
          const bankReceiveInfo = accounts.find((item) => item.owner === desFund);
          if (bankSenderInfo && bankReceiveInfo) {
            if (bankSenderInfo.revenueAdded < Number(form.value)) {
              setMoneyActionNotify("Balance is insufficient");
              return;
            } else {
              // console.log("bankSenderInfo", bankSenderInfo);
              // console.log("bankReceiveInfo", bankReceiveInfo);
              const newRevenueSender = bankSenderInfo.revenueAdded - Number(form.value);
              const newBalanceReceiver = bankReceiveInfo.balance + Number(form.value);
              await updateAccount(bankSenderInfo._id, {
                ...bankSenderInfo,
                revenueAdded: newRevenueSender,
              }, getAuthHeader());
              await updateAccount(bankReceiveInfo._id, {
                ...bankReceiveInfo,
                balance: newBalanceReceiver,
              }, getAuthHeader());
            }
          }
        } else if (sourceFund === "Carrier") {
          // const bankSenderInfo = accounts.find((item) => item.owner === sourceFund);
          const bankReceiveInfo = accounts.find((item) => item.owner === desFund);
          if (bankReceiveInfo) {
            const newRenvenueReceiver = bankReceiveInfo.revenueAdded + Number(form.value);

            await updateAccount(bankReceiveInfo._id, {
              ...bankReceiveInfo,
              revenueAdded: newRenvenueReceiver,
            }, getAuthHeader());
          }
        }
      }

      // if (form.action === "withdraw") {
      //   const sourceFund = form.sourceFund;
      //   const desFund = form.destinationFund;
      //   if (sourceFund === "NetCash" || sourceFund === "Original" || sourceFund === "Flexible" || sourceFund === "Visa" || sourceFund === "Receive") {
      //     if (sourceFund === "Visa") {
      //       console.log("1");
      //       const bankSenderInfo = accounts.find((item) => item.shortName === selectedVisa);
      //       const bankReceiveInfo = accounts.find((item) => item.owner === desFund);
      //       if (bankSenderInfo && bankReceiveInfo) {
      //         if (bankSenderInfo.balance < Number(form.value)) {
      //           setMoneyActionNotify("Balance is insufficient");
      //           return;
      //         } else {
      //           // console.log("bankSenderInfo", bankSenderInfo);
      //           // console.log("bankReceiveInfo", bankReceiveInfo);
      //           const newBalanceSender = bankSenderInfo.balance - Number(form.value);
      //           const newBalanceReceiver = bankReceiveInfo.balance + Number(form.value);
      //           await updateAccount(bankSenderInfo._id, {
      //             ...bankSenderInfo,
      //             balance: newBalanceSender,
      //           });
      //           await updateAccount(bankReceiveInfo._id, {
      //             ...bankReceiveInfo,
      //             balance: newBalanceReceiver,
      //           });
      //         }
      //       }
      //     } else {
      //       const bankSenderInfo = accounts.find((item) => item.owner === sourceFund);

      //       let bankReceiveInfo = accounts.find((item) => item.owner === desFund);
      //       if (desFund === "Visa") {
      //         bankReceiveInfo = accounts.find((item) => item.shortName === selectedVisa);
      //       }

      //       if (bankSenderInfo && bankReceiveInfo) {
      //         const newBalanceSender = bankSenderInfo.balance - Number(form.value);
      //         const newBalanceReceiver = bankReceiveInfo.balance + Number(form.value);
      //         await updateAccount(bankSenderInfo._id, {
      //           ...bankSenderInfo,
      //           balance: newBalanceSender,
      //         });
      //         await updateAccount(bankReceiveInfo._id, {
      //           ...bankReceiveInfo,
      //           balance: newBalanceReceiver,
      //         });
      //       }
      //     }
      //   }
      // }

      await addMoneyInOut({
        action: form.action.toLocaleLowerCase() as MoneyInOut_Action_Type,
        date: form.date,
        value: Number(form.value),
        usedFor: form.usedFor,
        note: form.note,
        sourceFund: form.sourceFund,
        destinationFund: form.destinationFund,
      }, getAuthHeader());
      setIsShowAddBox(false);
      setSelectedVisa("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditData = (item: MoneyInOutDataType) => {
    setIsShowEditBox(true);
    setEditData(item);
  };
  const handleUpdate = async (id: string) => {
    await updateMoneyInOut(id, {
      ...editData,
    }, getAuthHeader());
    setIsShowEditBox(false);
    alert("MoneyInOut updated successfully!");
  };

  const handleUploadMoneyInOut = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("form", formData);

    const res = await fetch(UploadMoneyInOut_API, {
      method: "POST",
      body: formData,
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    console.log("data", data);
    if (!res.ok) return alert("Upload failed: " + data.message);

    await updateUploadExcel(moneyInOuts, data.inserted);
    setIsShowUploadBox(false);
    alert(`✅ Uploaded ${data.count} money-in-out`);
  };

  const handleDelete = async (id: string) => {
    // if (!confirm("Are you sure you want to delete this data?")) return;
    await deleteMoneyInOut(id, getAuthHeader());
    // alert("Deleted successfully!");
  };

  // -- Add Bank
  const [formBank, setFormBank] = useState<Omit<MoneyBankAccounts_Type, "_id" | "userId">>({
    owner: "Original",
    bankName: "",
    shortName: "",
    bankAccountNumber: 123456789,
    type: "normal",
    balance: 0,
    revenueAdded: 0,
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const handleFormBankChange = (field: string, value: string) => {
    setFormBank((prev) => ({ ...prev, [field]: value }));
  };
  const handleFormBankEdit = (field: string, value: string) => {
    setBankEditData((prev) => ({ ...prev, [field]: value }));
  };
  const handleUpdateBank = async (id: string) => {
    await updateAccount(id, {
      ...bankEditData,
    }, getAuthHeader());
    setIsShowEditBankBox(false);
    alert("Bank account updated successfully!");
  };

  const handleSubmitBank = async () => {
    try {
      await addAccount({
        owner: formBank.owner,
        bankName: formBank.bankName,
        shortName: formBank.shortName,
        bankAccountNumber: formBank.bankAccountNumber,
        type: formBank.type,
        balance: formBank.balance,
        revenueAdded: formBank.revenueAdded,
        date: formBank.date,
        note: formBank.note || "",
      }, getAuthHeader());
      setIsShowBankBox(false);
    } catch (err) {
      console.error(err);
    }
  };

  // -- Function filter
  function calculateTotals(data: MoneyInOutDataType[]) {
    return data.reduce(
      (totals, item) => {
        if (item.action === "deposit") {
          totals.deposit += item.value;
          if (item.destinationFund === "Flexible") {
            totals.flexible += item.value;
          }
          if (item.destinationFund === "Operating") {
            totals.operating += item.value;
          }
        }
        if (item.action === "withdraw") totals.withdraw += item.value;
        if (item.action === "payment") {
          totals.payment += item.value;
          if (item.destinationFund === "Tax") {
            totals.tax += item.value;
          }
        }
        return totals;
      },
      { deposit: 0, withdraw: 0, payment: 0, tax: 0, flexible: 0, operating: 0 }
    );
  }

  const filteredData = filterMoneyInOuts(moneyInOuts, {
    mode: filterMode,
    action: filterType,
    selectedMonth,
    selectedYear,
    source: filterBySource as "None" | MoneyInOut_SourceFund_Type | undefined,
    destination: filterByDestination as "None" | MoneyInOut_DestinationFund_Type | undefined,
  });

  const totals = calculateTotals(filteredData);

  const groupDiagramData = CalculateDiagramData(moneyInOuts);

  // -- Download table to excel
  const handleExportExcel = () => {
    console.log("hihihi");
    // 1. Prepare worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(moneyInOuts);

    // 2. Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MoneyInOut");

    // 3. Write to buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // 4. Save to file
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, `MoneyInOut_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const GetArrayVisa = () => {
    const arrayVisa = accounts.filter((item) => item.owner === "Visa");
    return arrayVisa;
  };
  return (
    <div className={cx("money-in-out-main")}>
      <h4 className={cx("title")}>Deposit, Withdraw and Payment log</h4>

      {/* Summary cards */}
      <div className={cx("summary-boxes")}>
        {/* <div className={cx("summary-card")}>
          <span className={cx("label")}>Original Account</span>
          <span className={cx("value")}>{totals.deposit.toLocaleString()} ₫</span>
        </div>
        <div className={cx("summary-card")}>
          <span className={cx("label")}>Flexible Account</span>
          <span className={cx("value")}>{totals.flexible.toLocaleString()} ₫</span>
        </div>
        <div className={cx("summary-card")}>
          <span className={cx("label")}>Operating Account</span>
          <span className={cx("value")}>{totals.operating.toLocaleString()} ₫</span>
        </div>
        <div className={cx("summary-card")}>
          <span className={cx("label")}>Total Withdraw</span>
          <span className={cx("value")}>{totals.withdraw.toLocaleString()} ₫</span>
        </div>
        <div className={cx("summary-card")}>
          <span className={cx("label")}>Total Payment</span>
          <span className={cx("value")}>{totals.payment.toLocaleString()} ₫</span>
        </div>
        <div className={cx("summary-card")}>
          <span className={cx("label")}>Total Tax</span>
          <span className={cx("value")}>{totals.tax.toLocaleString()} ₫</span>
        </div> */}
      </div>
      <div>
        <div>** NetCash and Original Account are the first fund for your start up.</div>
        <div>** Flexible Account is the fund use to pay for import; ads costs; salary, tax ... or external payment.</div>
        <div>** Receive Account is the bank account use to receive the revenue from social platform or carrier and transfer money to flexible account for new cycle.</div>
        <div>** Operating Account is the fund use to pay for electric, water, internet... Internal payment</div>
        {/* <div>** Withdraw is action to get out money to buy; saving; invest ... after profit</div> */}
      </div>

      <div className={cx("diagram-wrapper")}>
        <MoneyInOutDiagram
          moneyTransition={groupDiagramData.moneyTransition}
          bankAccounts={accounts}
          setBankEditData={setBankEditData}
          setIsShowEditBankBox={setIsShowEditBankBox}
        />
      </div>

      <div className={cx("tabs-filter-box")}>
        {/* Tabs navigation */}
        <div className={cx("tabs")}>
          <div className={cx("tab", "add")} onClick={() => setIsShowBankBox(true)}>
            Add Bank
          </div>
          <div className={cx("tab", "add")} onClick={() => setIsShowAddBox(true)}>
            Add New Transfer Money
          </div>
          <div className={cx("tab", "add")} onClick={() => setIsShowUploadBox(true)}>
            Upload Excel
          </div>
          <div className={cx("tab", "add")} onClick={() => handleExportExcel()}>
            Download Excel
          </div>
        </div>
        {/* Date filter */}
        <div className={cx("filter-box")}>
          <label>Filter Mode:</label>
          <button onClick={() => setFilterMode("month")}>By Month</button>
          <button onClick={() => setFilterMode("year")}>By Year</button>
          <button onClick={() => setFilterMode("all")}>All Time</button>

          {filterMode === "month" && (
            <>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {filterMode === "year" && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className={cx("content")}>
        {
          <div className={cx("")}>
            <div className={cx('group-filter')}>
              <div className={cx("history-filter")}>
                <label>Show by action:</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All</option>
                  <option value="deposit">Deposit</option>
                  <option value="send">Send</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <div className={cx("history-filter")}>
                <label>Show by Source:</label>
                <select value={filterBySource} onChange={(e) => setFilterBySource(e.target.value)}>
                  <option value="None">All</option>
                  {ArraySourceFund.map((source, i) => {
                    return (
                      <option key={i} value={source}>
                        {source}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={cx("history-filter")}>
                <label>Show by Destination:</label>
                <select value={filterByDestination} onChange={(e) => setFilterByDestination(e.target.value)}>
                  <option value="None">All</option>
                  {ArrayDestinationfund.map((source, i) => {
                    return (
                      <option key={i} value={source}>
                        {source}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setFilterByDestination("None");
                  setFilterBySource("None");
                  setFilterMode("all");
                  setFilterType("all");
                }}
              >
                Clear All
              </div>
            </div>

            <div className={cx("table-placeholder")}>
              📊 Showing {filterType} in{" "}
              <b>
                {selectedMonth}/{selectedYear}
              </b>{" "}
              — {filteredData.length} records
            </div>

            <div className={cx("history-list")}>
              <div className={cx("history-item")}>
                <div className={cx("col", "date", "header")}>Date</div>
                <div className={cx("col", "action", "header")}>Action</div>
                <div className={cx("col", "action", "header")}>Source</div>
                <div className={cx("col", "value", "header")}>Destination</div>
                <div className={cx("col", "value", "header")}>Value</div>

                <div className={cx("col", "used", "header")}>Used For</div>
                <div className={cx("col", "note", "header")}>Note</div>
                <div className={cx("col", "used", "header")}>Edit</div>
                <div className={cx("col", "note", "header")}>Delete</div>
              </div>
              {filteredData.map((item: MoneyInOutDataType, i: number) => (
                <div key={i} className={cx("history-item", item.action)}>
                  <div className={cx("col", "date")}>{item.date}</div>
                  <div className={cx("col", "action")}>{item.action.toUpperCase()}</div>
                  <div className={cx("col", "action")}>{item.sourceFund}</div>
                  <div className={cx("col", "action")}>{item.destinationFund}</div>
                  <div className={cx("col", "value")}>{item.value.toLocaleString()} ₫</div>
                  <div className={cx("col", "used")}>{item.usedFor}</div>
                  <div className={cx("col", "note")}>{item.note}</div>
                  <div className={cx("col", "note")}>
                    <MdModeEdit size={20} onClick={() => handleEditData(item)} />
                  </div>
                  <div className={cx("col", "note")} onClick={() => handleDelete(item._id)}>
                    <MdDelete size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }

        {isShowAddBox && (
          <div className={cx("wrap-form")}>
            <div className={cx("add-form")}>
              <h5>Money Action</h5>
              <div className={cx("source-destination")}>
                <div className={cx("form-row")}>
                  <label>Action:</label>
                  <select value={form.action} onChange={(e) => handleFormChange("action", e.target.value)}>
                    <option value="deposit">Deposit</option>
                    <option value="send">Send</option>
                    <option value="withdraw">Withdraw</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div className={cx("form-row")}>
                  <label>Date:</label>
                  <input type="date" value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} />
                </div>
              </div>
              <div className={cx("form-row")}>
                <div>
                  <label>Value:</label> &nbsp;
                  <span>{Number(form.value).toLocaleString("vi-VN")} ₫</span>
                </div>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={form.value}
                  onChange={(e) => {
                    handleFormChange("value", e.target.value);
                  }}
                />
              </div>
              {moneyActionNotify !== null && <div style={{ color: "red" }}>{moneyActionNotify}</div>}
              <div className={cx("source-destination")}>
                <div className={cx("form-row")}>
                  <label>From:</label>
                  <select value={form.sourceFund} onChange={(e) => handleFormChange("sourceFund", e.target.value)}>
                    {ArraySourceFund.map((source, i) => {
                      const details = accounts.find((item) => item.owner === source);
                      let balance = details?.balance || 0;
                      if (details && (details.owner === "Facebook" || details.owner === "Tiktok" || details.owner === "Shopee")) {
                        balance = details?.revenueAdded || 0;
                      }

                      return (
                        <option value={source} key={i}>
                          {source} - {balance.toLocaleString("vi-VN")}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className={cx("arrow")}>
                  <FaArrowRightLong size={20} />
                </div>
                <div className={cx("form-row")}>
                  <label>To:</label>
                  <select value={form.destinationFund} onChange={(e) => handleFormChange("destinationFund", e.target.value)}>
                    {ArrayDestinationfund.map((source, i) => {
                      return (
                        <option value={source} key={i}>
                          {source}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {form.sourceFund === "Visa" && form.destinationFund !== "Visa" && (
                <div className={cx("form-row")}>
                  <select
                    value={selectedVisa}
                    onChange={(e) => {
                      setSelectedVisa(e.target.value);
                      // setMoneyActionState((prev) => {...prev, balanceValue: })
                    }}
                  >
                    <option value="none">None</option>
                    {GetArrayVisa().map((visaInfo, i) => {
                      const balance = visaInfo.balance;
                      return (
                        <option value={visaInfo.shortName} key={i}>
                          {visaInfo.shortName} - {balance.toLocaleString("vi-VN")}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              {form.sourceFund !== "Visa" && form.destinationFund === "Visa" && (
                <div className={cx("form-row")}>
                  <select value={selectedVisa} onChange={(e) => setSelectedVisa(e.target.value)}>
                    <option value="none">None</option>
                    {GetArrayVisa().map((visaInfo, i) => {
                      const balance = visaInfo.balance;
                      return (
                        <option value={visaInfo.shortName} key={i}>
                          {visaInfo.shortName} - {balance.toLocaleString("vi-VN")}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              <div className={cx("form-row")}>
                <label>Used For:</label>
                <input
                  type="text"
                  placeholder="E.g. Order #123, salary, etc."
                  value={form.usedFor}
                  onChange={(e) => handleFormChange("usedFor", e.target.value)}
                />
              </div>
              <div className={cx("form-row")}>
                <label>Note:</label>
                <textarea placeholder="Optional note" value={form.note} onChange={(e) => handleFormChange("note", e.target.value)} />
              </div>
              <div className={cx("form-actions")}>
                <button className={cx("btn", "primary")} onClick={handleSubmit} disabled={moneyActionNotify !== null ? true : false}>
                  Add
                </button>
                <button className={cx("btn", "secondary")} onClick={() => setIsShowAddBox(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isShowEditBox && (
          <div className={cx("wrap-form")}>
            <div className={cx("add-form")}>
              <h5>Money Action</h5>
              <div className={cx("form-row")}>
                <label>Action:</label>
                <select value={editData.action} onChange={(e) => handleEditChange("action", e.target.value)}>
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <div className={cx("form-row")}>
                <label>Date:</label>
                <input type="date" value={editData.date} onChange={(e) => handleEditChange("date", e.target.value)} />
              </div>
              <div className={cx("form-row")}>
                <label>Value:</label>
                <input type="number" placeholder="Enter amount" value={editData.value} onChange={(e) => handleEditChange("value", e.target.value)} />
              </div>
              <div className={cx("source-destination")}>
                <div>
                  <label>From:</label>
                  <select value={editData.sourceFund} onChange={(e) => handleEditChange("sourceFund", e.target.value)}>
                    {ArraySourceFund.map((source, i) => {
                      return (
                        <option value={source} key={i}>
                          {source}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className={cx("arrow")}>
                  <FaArrowRightLong size={20} />
                </div>
                <div>
                  <label>To:</label>
                  <select value={editData.destinationFund} onChange={(e) => handleEditChange("destinationFund", e.target.value)}>
                    {ArrayDestinationfund.map((source, i) => {
                      return (
                        <option value={source} key={i}>
                          {source}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className={cx("form-row")}>
                <label>Used For:</label>
                <input
                  type="text"
                  placeholder="E.g. Order #123, salary, etc."
                  value={editData.usedFor}
                  onChange={(e) => handleEditChange("usedFor", e.target.value)}
                />
              </div>
              <div className={cx("form-row")}>
                <label>Note:</label>
                <textarea placeholder="Optional note" value={editData.note} onChange={(e) => handleEditChange("note", e.target.value)} />
              </div>
              <div className={cx("form-actions")}>
                <button className={cx("btn", "primary")} onClick={() => handleUpdate(editData._id)}>
                  Update
                </button>
                <button className={cx("btn", "secondary")} onClick={() => setIsShowEditBox(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isShowBankBox && (
          <div className={cx("wrap-form")}>
            <div className={cx("add-form")}>
              <h5>Add New Bank</h5>
              <div className={cx("form-row2")}>
                <div>
                  <label>Owner:</label>
                  <div>
                    <select value={formBank.owner} onChange={(e) => handleFormBankChange("owner", e.target.value)}>
                      {ArrayBankAcc.map((source, i) => {
                        return (
                          <option value={source} key={i}>
                            {source}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label>Date:</label>
                  <input type="date" value={formBank.date} onChange={(e) => handleFormBankChange("date", e.target.value)} />
                </div>
              </div>
              <div className={cx("form-row2")}>
                <div>
                  <label>Bank Name:</label>
                  <input
                    type="text"
                    placeholder="Enter bank name"
                    value={formBank.bankName}
                    onChange={(e) => handleFormBankChange("bankName", e.target.value)}
                  />
                </div>
                <div>
                  <label>Short Name:</label>
                  <input
                    type="text"
                    placeholder="Enter short name"
                    value={formBank.shortName}
                    onChange={(e) => handleFormBankChange("shortName", e.target.value)}
                  />
                </div>
              </div>
              <div className={cx("form-row2")}>
                <div>
                  <label>Bank Number:</label>
                  <input
                    type="number"
                    placeholder="Enter bank number"
                    value={formBank.bankAccountNumber}
                    onChange={(e) => handleFormBankChange("bankAccountNumber", e.target.value)}
                  />
                </div>

                <div>
                  <label>Type Card:</label>
                  <div>
                    <select value={formBank.type} onChange={(e) => handleFormBankChange("type", e.target.value)}>
                      <option value="visa">Visa</option>
                      <option value="normal">Normal</option>
                      <option value="virtual">Virtual</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={cx("form-row2")}>
                <div>
                  <label>Balance:</label>
                  <input
                    type="number"
                    placeholder="Enter bank name"
                    value={formBank.balance}
                    onChange={(e) => handleFormBankChange("balance", e.target.value)}
                  />
                </div>
                <div>
                  <label>Revenue:</label>
                  <input
                    type="number"
                    placeholder="Enter bank name"
                    value={formBank.revenueAdded}
                    onChange={(e) => handleFormBankChange("revenueAdded", e.target.value)}
                  />
                </div>
              </div>
              <div className={cx("form-row")}>
                <label>Note:</label>
                <textarea placeholder="Optional note" value={formBank.note} onChange={(e) => handleFormBankChange("note", e.target.value)} />
              </div>
              <div className={cx("form-actions")}>
                <button className={cx("btn", "primary")} onClick={handleSubmitBank}>
                  Add
                </button>
                <button className={cx("btn", "secondary")} onClick={() => setIsShowBankBox(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isShowEditBankBox && (
          <div className={cx("wrap-form")}>
            <div className={cx("add-form")}>
              <h5>Add New Bank</h5>
              <div className={cx("form-row2")}>
                <div>
                  <label>Owner:</label>
                  <div>
                    <select value={bankEditData.owner} onChange={(e) => handleFormBankEdit("owner", e.target.value)}>
                      {ArrayBankAcc.map((source, i) => {
                        return (
                          <option value={source} key={i}>
                            {source}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label>Date:</label>
                  <input type="date" value={bankEditData.date} onChange={(e) => handleFormBankEdit("date", e.target.value)} />
                </div>
              </div>
              <div className={cx("form-row2")}>
                <div>
                  <label>Bank Name:</label>
                  <input
                    type="text"
                    placeholder="Enter bank name"
                    value={bankEditData.bankName}
                    onChange={(e) => handleFormBankEdit("bankName", e.target.value)}
                  />
                </div>
                <div>
                  <label>Short Name:</label>
                  <input
                    type="text"
                    placeholder="Enter short name"
                    value={bankEditData.shortName}
                    onChange={(e) => handleFormBankEdit("shortName", e.target.value)}
                  />
                </div>
              </div>
              <div className={cx("form-row2")}>
                <div>
                  <label>Bank Number:</label>
                  <input
                    type="number"
                    placeholder="Enter bank number"
                    value={bankEditData.bankAccountNumber}
                    onChange={(e) => handleFormBankEdit("bankAccountNumber", e.target.value)}
                  />
                </div>

                <div>
                  <label>Type Card:</label>
                  <div>
                    <select value={bankEditData.type} onChange={(e) => handleFormBankEdit("type", e.target.value)}>
                      <option value="visa">Visa</option>
                      <option value="normal">Normal</option>
                      <option value="virtual">Virtual</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={cx("form-row2")}>
                <div>
                  <label>Balance: {Number(bankEditData.balance).toLocaleString("vi-VN")}₫</label>
                  <input
                    type="number"
                    placeholder="Enter bank name"
                    value={bankEditData.balance}
                    onChange={(e) => handleFormBankEdit("balance", e.target.value)}
                  />
                </div>
                <div>
                  <label>Revenue: {Number(bankEditData.revenueAdded).toLocaleString("vi-VN")}₫</label>
                  <input
                    type="number"
                    placeholder="Enter bank name"
                    value={bankEditData.revenueAdded}
                    onChange={(e) => handleFormBankEdit("revenueAdded", e.target.value)}
                  />
                </div>
              </div>
              <div className={cx("form-row")}>
                <label>Note:</label>
                <textarea placeholder="Optional note" value={bankEditData.note} onChange={(e) => handleFormBankEdit("note", e.target.value)} />
              </div>
              <div className={cx("form-actions")}>
                <button className={cx("btn", "primary")} onClick={() => handleUpdateBank(bankEditData?._id)}>
                  Update
                </button>
                <button className={cx("btn", "secondary")} onClick={() => setIsShowEditBankBox(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isShowUploadBox && <UploadExcelBox onClose={() => setIsShowUploadBox(false)} onUpload={handleUploadMoneyInOut} />}
    </div>
  );
}

export function MoneyInOutCards() {
  const { moneyInOuts, fetchMoneyInOuts, updateMoneyInOut, addMoneyInOut, deleteMoneyInOut, loading, updateUploadExcel } = useMoneyInOutStore();
  // Aggregate totals by type
  // useEffect(() => {
  //   fetchMoneyInOuts();
  // }, [fetchMoneyInOuts]);
  const totals: Record<string, number> = {};
  moneyInOuts.forEach((item) => {
    totals[item.action] = (totals[item.action] || 0) + item.value;
  });

  return (
    <div className={cx("cards-grid")}>
      <div className={cx("card")}>
        <div>Original Account</div>
        <div className={cx("value")}>{(totals["deposit"] || 0).toLocaleString()} ₫</div>
      </div>
      <div className={cx("card")}>
        <div>Flexible Account</div>
        <div className={cx("value")}>{(totals["withdraw"] || 0).toLocaleString()} ₫</div>
      </div>

      <div className={cx("card")}>
        <div>Total Deposit</div>
        <div className={cx("value")}>{(totals["deposit"] || 0).toLocaleString()} ₫</div>
      </div>
      <div className={cx("card")}>
        <div>Total Withdraw</div>
        <div className={cx("value")}>{(totals["withdraw"] || 0).toLocaleString()} ₫</div>
      </div>
      <div className={cx("card")}>
        <div>Total Payment</div>
        <div className={cx("value")}>{(totals["payment"] || 0).toLocaleString()} ₫</div>
      </div>
    </div>
  );
}


function CalculateDiagramData(moneyInOutData: MoneyInOutDataType[]) {

  // 1. Calculate Original
  let totalOriginal: MoneyTransitionType = {
    owner: "Original",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalFlexible: MoneyTransitionType = {
    owner: "Flexible",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalReceive: MoneyTransitionType = {
    owner: "Receive",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalRevenue: MoneyTransitionType = {
    owner: "Revenue",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalNetCash: MoneyTransitionType = {
    owner: "NetCash",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalVisas: MoneyTransitionType = {
    owner: "Visa",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalTax: SegmentType = {
    name: "Tax",
    value: 0,
  };
  let totalTiktokSpend: MoneyTransitionType = {
    owner: "Tiktok",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalFacebookSpend: MoneyTransitionType = {
    owner: "Facebook",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalShopeeSpend: MoneyTransitionType = {
    owner: "Shopee",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };

  let totalCarrier: MoneyTransitionType = {
    owner: "Carrier",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };
  let totalPayment: MoneyTransitionType = {
    owner: "Payment",
    totalSend: 0,
    totalWithdraw: 0,
    totalDeposit: 0,
  };

  let totalOperating: SegmentType = {
    name: "Operating",
    value: 0,
  };
  let totalOthers: SegmentType = {
    name: "Others",
    value: 0,
  };

  // -- Aggreegate from other source for the revenue
  let totalTiktokRevenue: SegmentType = {
    name: "Tiktok",
    value: 0,
  };
  let totalFacebookRevenue: SegmentType = {
    name: "Facebook",
    value: 0,
  };
  let totalShopeeRevenue: SegmentType = {
    name: "Shopee",
    value: 0,
  };

  moneyInOutData.reduce(
    (totals, item) => {
      if (item.action === "deposit") {
        //
      } else if (item.action === "withdraw") {
        if (item.sourceFund === "Original") {
          totals.totalOriginal.totalWithdraw += item.value;
        }
        if (item.sourceFund === "Flexible") {
          totals.totalFlexible.totalWithdraw += item.value;
        }
        if (item.sourceFund === "Receive") {
          totals.totalReceive.totalWithdraw += item.value;
        }
        if (item.sourceFund === "Carrier") {
          totals.totalCarrier.totalWithdraw += item.value;
        }
        if (item.sourceFund === "Facebook") {
          totals.totalRevenue.totalWithdraw += item.value;
        }
        if (item.sourceFund === "Tiktok") {
          totals.totalRevenue.totalWithdraw += item.value;
        }
        if (item.sourceFund === "Shopee") {
          totals.totalRevenue.totalWithdraw += item.value;
        }
      } else if (item.action === "payment") {
        if (item.destinationFund === "Tax") {
          totals.totalTax.value += item.value;
        }
      } else if (item.action === "send") {
        if (item.destinationFund === "Visa") {
          totals.totalVisas.totalDeposit += item.value;
        }
        if (item.sourceFund === "Visa") {
          totals.totalVisas.totalSend += item.value;
          if (item.destinationFund === "Facebook") {
            totals.totalFacebookSpend.totalDeposit += item.value;
          }
          if (item.destinationFund === "Tiktok") {
            totals.totalTiktokSpend.totalDeposit += item.value;
          }
          if (item.destinationFund === "Shopee") {
            totals.totalShopeeSpend.totalDeposit += item.value;
          }
        }
        if (item.destinationFund === "Receive") {
          totals.totalReceive.totalDeposit += item.value;
        }
        if (item.sourceFund === "Receive") {
          totals.totalReceive.totalSend += item.value;
        }
        if (item.destinationFund === "Tax") {
          totals.totalPayment.totalDeposit += item.value;
        }
        if (item.destinationFund === "Operating") {
          totals.totalPayment.totalDeposit += item.value;
        }
        if (item.destinationFund === "Salary") {
          totals.totalPayment.totalDeposit += item.value;
        }
        if (item.destinationFund === "Import") {
          totals.totalPayment.totalDeposit += item.value;
        }
        if (item.destinationFund === "Others") {
          totals.totalPayment.totalDeposit += item.value;
        }

        if (item.sourceFund === "NetCash") {
          totals.totalNetCash.totalSend += item.value;
        }
        if (item.sourceFund === "Original") {
          totals.totalOriginal.totalSend += item.value;
        }
        if (item.sourceFund === "Flexible") {
          totals.totalFlexible.totalSend += item.value;
        }
      }
      return totals;
    },
    {
      totalOriginal,
      totalFlexible,
      totalNetCash,
      totalTax,
      totalFacebookSpend,
      totalTiktokSpend,
      totalShopeeSpend,
      totalOperating,
      totalVisas,
      totalReceive,
      totalRevenue,
      totalTiktokRevenue,
      totalShopeeRevenue,
      totalFacebookRevenue,
      totalCarrier,
      totalPayment,
    }
  );

  const groupDataDiagram: Omit<DiagramProps, "bankAccounts" | "setBankEditData" | "setIsShowEditBankBox"> = {
    moneyTransition: {
      original: totalOriginal,
      flexible: totalFlexible,
      netCash: totalNetCash,
      visa: totalVisas,
      receiveAcc: totalReceive,
      revenue: totalRevenue,
      facebook: totalFacebookSpend,
      tiktok: totalTiktokSpend,
      shopee: totalShopeeSpend,
      carrier: totalCarrier,
      payment: totalPayment,
    },
  };
  return groupDataDiagram;
}
