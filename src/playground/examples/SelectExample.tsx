import React, { useState } from "react";
import { Select, SelectGray, Dropdown, SelectBeside, icons } from "../StyleComponents";

export default function SelectExample() {
  const [country, setCountry] = useState<string>("vn");


  // Options with icons - use icon property
  const optionsWithIcons = [
    { key: "1", label: "Viet Nam", icon: icons.vn },
    { key: "2", label: "Viet Nam 2", icon: icons.vn },
    { key: "3", label: "Viet Nam 3", icon: icons.vn },
  ];
    const [selected, setSelected] = useState<string>("1");
  const optionsWithIcons_2 = [
    { key: "1", label: "", icon: icons.vn },
    { key: "2", label: "", icon: icons.vn },
    { key: "3", label: "", icon: icons.vn },
  ];
  return (
    <div className="flex gap-3 flex-wrap">
      <Select value={country} onChange={setCountry} className="w-120" options={selectData} isUsePlaceHolder={true} />
      <SelectGray value={country} onChange={setCountry} className="w-120" options={selectData} isUsePlaceHolder={false} />
      <Dropdown label="Actions" items={["Edit", "Delete", "Share"]} onSelect={(item) => console.log(item)} />
      
      {/* SelectGray with icons */}
      <SelectGray
        value={selected}
        onChange={setSelected}
        options={optionsWithIcons}
        placeHolder="Select country"
        fullWidth
        size="md"
        isUsePlaceHolder={false}
        
      />
      
      {/* SelectBeside with icons */}
      <SelectBeside
        value={selected}
        onChange={setSelected}
        options={optionsWithIcons}
        placeHolder="Select an option"
        fullWidth
        size="md"
        position="right"
lableHidden={true}
isShowIcon={true}
isShowDropdownIcon={true}
// className="[&>button]:!px-1"
buttonClassName="px-4 bg-none border-0"
      />
    </div>
  );
}

const selectData = [
  { key: "vn", label: "Vietnam" },
  { key: "us", label: "USA" },
  { key: "jp", label: "Japan" },
  { key: "vn1", label: "Vietnam" },
  { key: "us1", label: "USA" },
  { key: "jp1", label: "Japan" },
  { key: "vn2", label: "Vietnam" },
  { key: "us2", label: "USA" },
  { key: "jp2", label: "Japan" },
  { key: "vn3", label: "Vietnam" },
  { key: "us3", label: "USA" },
  { key: "jp3", label: "Japan" },
];
