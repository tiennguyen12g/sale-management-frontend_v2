import { TableWithDragColumn, TableWithResizeColumn, TableCommon, type TableHeader } from "../StyleComponents";
import React, { useState } from "react";

export default function TableExample() {
  const [selected, setSelected] = useState<any[]>([]);
  const handleGetSelected = (data: any[]) => {
    console.log("data", data);
    setSelected(data);
  };
  return (
    <div>
      <div className="my-2.5 font-[400] text-[14px] text-left">
        * Note: Using div to wrap the table to hide the scroll bar's corner display outside of table when apply border radius for table
      </div>
      <div className="my-2.5 font-[400] text-[14px] text-left">The value in the cell can align to left; center or right</div>
      
      <h3 className="my-2.5 font-[500] text-[18px] text-left">Table common for apply specific with to each column</h3>
      <TableCommon data={commonTableData} pageSize={5} initialColumnWidths={{ 0: "150px", 1: "260px", 2: "140px" }} />
      <h3 className="my-2.5 font-[500] text-[18px] text-left">Table with resize column's width</h3>
      <div className="overflow-hidden rounded-lg border border-gray-300 z-[11] my-[10px]">
        <TableWithResizeColumn
          data={tableData}
          stickyColumns={[0, 1, 2]} // make first and second columns sticky
          initialColumnWidths={{ 0: "180px", 1: "260px", 2: "140px" }}
          cellPadding="px-4 py-2"
          maxHeight="480px"
          pageSize={5}
          onSelectionChange={(ids) => handleGetSelected(ids)}
        />
      </div>
      <h3 className="my-2.5 font-[500] text-[18px] text-left">Table with drag column</h3>
      <div className="overflow-hidden rounded-lg border border-gray-300 z-[11] my-[10px]">
        <TableWithDragColumn
          data={tableData}
          stickyColumns={[0, 1, 2]} // make first and second columns sticky
          initialColumnWidths={{ 0: "180px", 1: "260px", 2: "140px" }}
          cellPadding="px-4 py-2"
          maxHeight="480px"
          pageSize={5}
          isShowPagination={true}
          onSelectionChange={(ids) => handleGetSelected(ids)}
        />
      </div>
    </div>
  );
}
const commonTableData = {
  headers: [
    { key: "name", label: "Name", sticky: true, width: 120, align: "center" },
    { key: "role", label: "Role", width: 120, align: "right" },
    { key: "status", label: "Status", width: 120, align: "left" },
    { key: "age", label: "Age", width: 80 },
    { key: "birthday", label: "Birthday", width: 140 },
    { key: "company", label: "Company", width: 200 },
  ] as TableHeader[],
  rows: [
    {
      id: "1",
      name: "John Doe",
      role: "Owner",
      status: "Active",
      age: 34,
      birthday: "1990-01-12",
      company: "Acme Inc.",
      country: "USA",
      phone: "+1 555-1203",
      relationship: "Married",
      email: "john.doe@example.com",
      address: "123 Silicon Valley, CA",
      joined: "2020-05-21",
    },
    {
      id: "2",
      name: "Alice Johnson",
      role: "User",
      status: "Pending",
      age: 29,
      birthday: "1995-07-08",
      company: "Meta Labs",
      country: "Canada",
      phone: "+1 444-8811",
      relationship: "Single",
      email: "alice.j@example.com",
      address: "44 Toronto Ave",
      joined: "2022-10-10",
    },
    {
      id: "3",
      name: "Mike Smith",
      role: "Admin",
      status: "Active",
      age: 41,
      birthday: "1983-03-17",
      company: "TikVision",
      country: "Germany",
      phone: "+49 103-3344",
      relationship: "Married",
      email: "mike.smith@example.com",
      address: "99 Berlin Street",
      joined: "2019-08-12",
    },
  ],
};
export const tableData = {
  headers: [
    { key: "select", label: "", type: "checkbox", sticky: true, width: 50 },
    { key: "name", label: "Name", sticky: true, width: 160, align: "center" },
    { key: "role", label: "Role", width: 120 },
    { key: "status", label: "Status", width: 120 },
    { key: "age", label: "Age", width: 80 },
    { key: "birthday", label: "Birthday", width: 140 },
    { key: "company", label: "Company", width: 200 },
    { key: "country", label: "Country", width: 140 },
    { key: "phone", label: "Phone", width: 160 },
    { key: "relationship", label: "Relationship", width: 160 },
    { key: "email", label: "Email", width: 240 },
    { key: "address", label: "Address", width: 260 },
    { key: "joined", label: "Joined Date", width: 140 },
  ] as TableHeader[],

  rows: [
    {
      id: "1",
      name: "John Doe",
      role: "Owner",
      status: "Active",
      age: 34,
      birthday: "1990-01-12",
      company: "Acme Inc.",
      country: "USA",
      phone: "+1 555-1203",
      relationship: "Married",
      email: "john.doe@example.com",
      address: "123 Silicon Valley, CA",
      joined: "2020-05-21",
    },
    {
      id: "2",
      name: "Alice Johnson",
      role: "User",
      status: "Pending",
      age: 29,
      birthday: "1995-07-08",
      company: "Meta Labs",
      country: "Canada",
      phone: "+1 444-8811",
      relationship: "Single",
      email: "alice.j@example.com",
      address: "44 Toronto Ave",
      joined: "2022-10-10",
    },
    {
      id: "3",
      name: "Mike Smith",
      role: "Admin",
      status: "Active",
      age: 41,
      birthday: "1983-03-17",
      company: "TikVision",
      country: "Germany",
      phone: "+49 103-3344",
      relationship: "Married",
      email: "mike.smith@example.com",
      address: "99 Berlin Street",
      joined: "2019-08-12",
    },
    {
      id: "4",
      name: "Emma Watson",
      role: "Supervisor",
      status: "Pending",
      age: 31,
      birthday: "1993-11-22",
      company: "FutureTech",
      country: "UK",
      phone: "+44 220-2211",
      relationship: "Engaged",
      email: "emma.w@example.com",
      address: "Ampere Rd, London",
      joined: "2021-02-03",
    },
    {
      id: "5",
      name: "Bruce Wayne",
      role: "VIP",
      status: "Active",
      age: 38,
      birthday: "1986-09-15",
      company: "Wayne Enterprises",
      country: "USA",
      phone: "+1 999-1010",
      relationship: "Single",
      email: "bruce.w@example.com",
      address: "Wayne Manor, Gotham",
      joined: "2018-01-01",
    },
    {
      id: "6",
      name: "John Doe",
      role: "Owner",
      status: "Active",
      age: 34,
      birthday: "1990-01-12",
      company: "Acme Inc.",
      country: "USA",
      phone: "+1 555-1203",
      relationship: "Married",
      email: "john.doe@example.com",
      address: "123 Silicon Valley, CA",
      joined: "2020-05-21",
    },
    {
      id: "7",
      name: "Alice Johnson",
      role: "User",
      status: "Pending",
      age: 29,
      birthday: "1995-07-08",
      company: "Meta Labs",
      country: "Canada",
      phone: "+1 444-8811",
      relationship: "Single",
      email: "alice.j@example.com",
      address: "44 Toronto Ave",
      joined: "2022-10-10",
    },
    {
      id: "8",
      name: "Mike Smith",
      role: "Admin",
      status: "Active",
      age: 41,
      birthday: "1983-03-17",
      company: "TikVision",
      country: "Germany",
      phone: "+49 103-3344",
      relationship: "Married",
      email: "mike.smith@example.com",
      address: "99 Berlin Street",
      joined: "2019-08-12",
    },
    {
      id: "9",
      name: "Emma Watson",
      role: "Supervisor",
      status: "Pending",
      age: 31,
      birthday: "1993-11-22",
      company: "FutureTech",
      country: "UK",
      phone: "+44 220-2211",
      relationship: "Engaged",
      email: "emma.w@example.com",
      address: "Ampere Rd, London",
      joined: "2021-02-03",
    },
    {
      id: "10",
      name: "Bruce Wayne",
      role: "VIP",
      status: "Active",
      age: 38,
      birthday: "1986-09-15",
      company: "Wayne Enterprises",
      country: "USA",
      phone: "+1 999-1010",
      relationship: "Single",
      email: "bruce.w@example.com",
      address: "Wayne Manor, Gotham",
      joined: "2018-01-01",
    },
    {
      id: "11",
      name: "John Doe",
      role: "Owner",
      status: "Active",
      age: 34,
      birthday: "1990-01-12",
      company: "Acme Inc.",
      country: "USA",
      phone: "+1 555-1203",
      relationship: "Married",
      email: "john.doe@example.com",
      address: "123 Silicon Valley, CA",
      joined: "2020-05-21",
    },
    {
      id: "12",
      name: "Alice Johnson",
      role: "User",
      status: "Pending",
      age: 29,
      birthday: "1995-07-08",
      company: "Meta Labs",
      country: "Canada",
      phone: "+1 444-8811",
      relationship: "Single",
      email: "alice.j@example.com",
      address: "44 Toronto Ave",
      joined: "2022-10-10",
    },
    {
      id: "13",
      name: "Mike Smith",
      role: "Admin",
      status: "Active",
      age: 41,
      birthday: "1983-03-17",
      company: "TikVision",
      country: "Germany",
      phone: "+49 103-3344",
      relationship: "Married",
      email: "mike.smith@example.com",
      address: "99 Berlin Street",
      joined: "2019-08-12",
    },
    {
      id: "14",
      name: "Emma Watson",
      role: "Supervisor",
      status: "Pending",
      age: 31,
      birthday: "1993-11-22",
      company: "FutureTech",
      country: "UK",
      phone: "+44 220-2211",
      relationship: "Engaged",
      email: "emma.w@example.com",
      address: "Ampere Rd, London",
      joined: "2021-02-03",
    },
    {
      id: "15",
      name: "Bruce Wayne",
      role: "VIP",
      status: "Active",
      age: 38,
      birthday: "1986-09-15",
      company: "Wayne Enterprises",
      country: "USA",
      phone: "+1 999-1010",
      relationship: "Single",
      email: "bruce.w@example.com",
      address: "Wayne Manor, Gotham",
      joined: "2018-01-01",
    },
  ],
};
