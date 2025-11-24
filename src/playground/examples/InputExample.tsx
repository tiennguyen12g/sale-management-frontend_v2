import React, { useState } from "react";
import { Input, icons } from "../StyleComponents";
import { RiEditFill } from "react-icons/ri";
export default function InputExample() {
  const performSearch = (value: any) => {
    console.log("value", value);
  };
  const [email, setEmail] = useState();
  const [value, setValue] = useState();
  return (
    <div>
      <div>Small Size</div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          <div>Basic usage</div>
          <Input placeholder="Enter your name" onChange={(value) => console.log(value)} />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <div>With debounce</div>
          <Input
            placeholder="Search..."
            onDebounceChange={(value) => {
              // This fires 500ms after user stops typing
              performSearch(value);
            }}
            debounceMs={900}
          />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <div>With icons</div>
          <Input leftIcon={icons.user} rightIcon={icons.check} placeholder="Username" size="sm" />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <div>With clear button</div>
          <Input leftIcon={<RiEditFill className="w-4 h-4"/>} showClearButton placeholder="Type something..." onChange={setValue as any} size="sm" />
        </div>
      </div>

      <div>Medium Size</div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          <Input placeholder="Enter your name" onChange={(value) => console.log(value)} size="md" />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Input
            placeholder="Search..."
            onDebounceChange={(value) => {
              // This fires 500ms after user stops typing
              performSearch(value);
            }}
            debounceMs={900}
            size="md"
          />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Input leftIcon={icons.user} rightIcon={icons.check} placeholder="Username" size="md" />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Input leftIcon={<RiEditFill className="w-5 h-5"/>} showClearButton placeholder="Type something..." onChange={setValue as any} size="md" />
        </div>
      </div>

      <div>Large Size</div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          <Input placeholder="Enter your name" onChange={(value) => console.log(value)} size="lg" />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Input
            placeholder="Search..."
            onDebounceChange={(value) => {
              // This fires 500ms after user stops typing
              performSearch(value);
            }}
            debounceMs={900}
            size="lg"
          />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Input leftIcon={icons.user} rightIcon={icons.check} placeholder="Username" size="lg" />
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Input leftIcon={<RiEditFill className="w-6 h-6 text-blue-500"/>} showClearButton placeholder="Type something..." onChange={setValue as any} size="lg" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>With label and error</div>
        <Input label="Email" type="email" value={email} placeholder="Enter your email" onChange={setEmail as any} error={"Invalid"} required />
      </div>
    </div>
  );
}
