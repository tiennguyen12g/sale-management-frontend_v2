import React from "react";
import { GradientButton, ButtonBorderGradient, ButtonCommon, icons, GroupButton, Button, ButtonCloseIcon, ButtonDeleteIcon, ButtonEditIcon } from "../StyleComponents";
import { DownloadButton, UploadButton, SaveButton, EditButton, DeleteButton, AddButton } from "../StyleComponents";
import { FaCheck } from "react-icons/fa6";
import { RiEditFill } from "react-icons/ri";
export default function ButtonExample() {
  const handleLog = () => {
    console.log('hi');
  }
  return (
    <div>
        <div className="my-2.5 font-[500] text-[18px] text-left">Faster button</div>
      <div className="flex gap-2.5">
        <DownloadButton onClick={handleLog} />
        <UploadButton onClick={handleLog} />
        <SaveButton onClick={handleLog} />
        {/* <EditButton onClick={handleLog} /> */}
        <EditButton>Change Pass</EditButton>
        <DeleteButton onClick={handleLog} />
        <AddButton onClick={handleLog} />
        <ButtonCloseIcon size={20} onClick={handleLog} />
        <ButtonEditIcon size={20} onClick={handleLog} />
        <ButtonDeleteIcon size={20} onClick={handleLog} />
      </div>
      <div className="my-2.5 font-[500] text-[18px] text-left">Common button for: link, destructive, outline, secondary, ghost</div>
      <div className="flex gap-2.5">
        <Button variant="link">Link to youtube</Button>
        <Button variant="destructive">Click me!</Button>
        <Button variant="outline">Hello world</Button>
        <Button variant="secondary">Try now!</Button>
        <Button variant="ghost">Check</Button>

      </div>
      <div className="my-2.5 font-[500] text-[18px] text-left">Custom gradients with hover effect</div>
      <div className="flex gap-2.5">
        <GradientButton variant="purple"> {<icons.download size={16} className="group-hover:scale-[1.2]"/>} Purple Button</GradientButton>
        <GradientButton variant="orange">Orange Button</GradientButton>
        <GradientButton variant="blue">Blue Button</GradientButton>
        <GradientButton variant="purpleBlue">Purple to Blue</GradientButton>
        <GradientButton variant="cyanBlue">Cyan to Blue</GradientButton>
        <GradientButton variant="greenBlue">Purple</GradientButton>
        <GradientButton variant="purplePink">Purple</GradientButton>
        <GradientButton variant="tealLime">Purple</GradientButton>
        <GradientButton variant="redYellow">Purple</GradientButton>
      </div>
      <div className="my-2.5 font-[500] text-[18px] text-left">Custom button with gradient border</div>
      <div className="flex gap-2.5">
        <ButtonBorderGradient variant="purpleBlue">Purple</ButtonBorderGradient>
        <ButtonBorderGradient variant="cyanBlue">Purple</ButtonBorderGradient>
        <ButtonBorderGradient variant="greenBlue">Purple</ButtonBorderGradient>
        <ButtonBorderGradient variant="purplePink">Purple</ButtonBorderGradient>
        <ButtonBorderGradient variant="tealLime">Purple</ButtonBorderGradient>
        <ButtonBorderGradient variant="redYellow">Purple</ButtonBorderGradient>
      </div>
      <div className="my-2.5 font-[500] text-[18px] text-left">Custom button with hover background</div>
      <div className="flex gap-2.5">
        <ButtonCommon>Hello</ButtonCommon>
        <ButtonCommon variant="continue">Continue</ButtonCommon>
        <ButtonCommon variant="delete">Delete</ButtonCommon>
        <ButtonCommon variant="next">Next</ButtonCommon>
        <ButtonCommon variant="agree">Agree</ButtonCommon>
        <ButtonCommon variant="cancel">Cancel</ButtonCommon>
        <ButtonCommon variant="back">Back</ButtonCommon>
        <ButtonCommon variant="back" className="h-8!">
          <FaCheck />
        </ButtonCommon>
        <ButtonCommon variant="submit" size="sm">
          Submit
        </ButtonCommon>
        <ButtonCommon variant="warning" size="md">
          Warning
        </ButtonCommon>
        <ButtonCommon variant="info" size="lg">
          Info
        </ButtonCommon>
      </div>

      <div className="my-2.5 font-[500] text-[18px] text-left">Custom button with icons</div>
      <div className="flex gap-2.5">
        {/* Using some default icon */}
        <ButtonCommon variant="back" icon={"next"} className="h-8!" iconClass="w-6 h-6">
          Back
        </ButtonCommon>
        <ButtonCommon variant="delete" icon={"close"} iconClass="w-5 h-5">
          Delete
        </ButtonCommon>
        <ButtonCommon variant="warning" size="md" icon={"warning"} iconClass="text-red-500">
          Warning
        </ButtonCommon>
        <ButtonCommon variant="continue" size="md" icon={icons.user} iconClass="text-white-500">
          People
        </ButtonCommon>
        {/* Using icon from other library */}
        <ButtonCommon variant="info" size="md">
          <RiEditFill color="red" size={20} className="group-hover:scale-[1.2]" />
          Edit
        </ButtonCommon>
      </div>

      <div className="font-600 text-[24px] my-2.5">Group button</div>
      {/* Have to use div to wrap button with background */}
      <div className="bg-gray-200 px-1.25 py-0.75 rounded-sm w-fit max-w-full">
        <GroupButton
          options={[
            { key: "day", label: "Day" },
            { key: "week", label: "Week" },
            { key: "month", label: "Month" },
          ]}
          defaultValue="day"
          onChange={(key, option) => console.log(key, option)}
        />
      </div>
    </div>
  );
}
