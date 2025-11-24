import { ButtonCommon, StatusModal, ConfirmLogout, ConfirmResetSettings, ConfirmDelete, CommonModal } from "../StyleComponents"

import React, { useState } from "react";

export default function CustomModalExample() {
  const [successOpen, setSuccessOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isCommonOpen, setIsCommonOpen] = useState(false);
  const handleDelete = () => {
    console.log("Item deleted successfully!");
  };

  const handleLogout = () => {
    console.log("Logged out successfully!");
  };

  const handleReset = () => {
    console.log("Settings reset to default!");
  };
  return (
    <div>
     <div className="my-2.5 font-[500] text-[18px] text-left">Modal box display data as info/status</div>
      <div className="flex gap-3 my-2.5">
        <ButtonCommon className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setSuccessOpen(true)}>
          Success
        </ButtonCommon>
        <StatusModal modalType="success" isOpen={successOpen} setIsOpen={setSuccessOpen} content="Done! The task is completed." />

        <ButtonCommon variant="warning" onClick={() => setWarningOpen(true)}>
          Warning
        </ButtonCommon>
        <StatusModal modalType="warning" isOpen={warningOpen} setIsOpen={setWarningOpen} content="Done! The task is completed." />

        <ButtonCommon variant="info" onClick={() => setInfoOpen(true)}>
          Info
        </ButtonCommon>
        <StatusModal modalType="info" isOpen={infoOpen} setIsOpen={setInfoOpen} content="Done! The task is completed." />
      </div>
       <div className="my-2.5 font-[500] text-[18px] text-left"> Modal box for comfirm and continue action</div>
      <div className="flex gap-3 my-2.5">
        <ButtonCommon onClick={() => setIsDeleteOpen(true)} variant="delete">
          Delete
        </ButtonCommon>
        <ConfirmDelete onExcute={handleDelete} setIsModalOpen={setIsDeleteOpen} isModalOpen={isDeleteOpen} content="Delete 5 orders" />

        <ButtonCommon onClick={() => setIsLogoutOpen(true)}>Logout</ButtonCommon>
        <ConfirmLogout
          isModalOpen={isLogoutOpen}
          setIsModalOpen={setIsLogoutOpen}
          onConfirm={handleLogout}
          description=""
          remindContent="You are sure to logout?"
        />
        <ConfirmResetSettings isModalOpen={isResetOpen} setIsModalOpen={setIsResetOpen} onConfirm={handleReset} />

        <ButtonCommon onClick={() => setIsCommonOpen(true)}>Test</ButtonCommon>
        <CommonModal isOpen={isCommonOpen} setIsOpen={setIsCommonOpen} content="We are jus a friend...nothing more" />
      </div>
    </div>
  );
}
