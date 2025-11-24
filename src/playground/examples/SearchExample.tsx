import React, { useState } from "react";
import { Search } from "../StyleComponents";
export default function SearchExample() {
  const [searchTerm, setSearchTerm] = useState();
  const handleSearch = (value: any) => {
    console.log("value", value);
  };
  return (
    <div className="flex gap-3">
      <div>
        // Basic usage
        <Search placeholder="Search..." onSearch={(value) => console.log("Searching:", value)} />
      </div>
      <div>
        // Controlled with custom debounce
        <Search value={searchTerm} onChange={setSearchTerm as any} onSearch={handleSearch} debounceMs={300} fullWidth />
      </div>
      {/* <div>

        <Search value={searchTerm} onChange={setSearchTerm as any} onSearch={handleSearch} debounceMs={300} fullWidth size="md"/>
      </div> */}
    </div>
  );
}
