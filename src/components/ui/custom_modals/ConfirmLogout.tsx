import React, { type Dispatch, type SetStateAction } from "react";
import Modal from "../seraui/modal";
import Button from "../seraui/button";

interface ConfirmLogoutProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm?: () => void;
  description?: string;
}

const defaultDescription =
  "Are you sure you want to logout? You will need to sign in again to access your account.";

export default function ConfirmLogout({
  isModalOpen,
  setIsModalOpen,
  onConfirm = () => {},
  description = defaultDescription,
}: ConfirmLogoutProps) {
  const handleConfirm = () => {
    onConfirm();
    setIsModalOpen(false);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Logout" size="sm">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Logout Confirmation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Any unsaved changes will be lost. Make sure to save your work before logging out.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button onClick={() => setIsModalOpen(false)} variant="secondary">
            Stay Logged In
          </Button>
          <Button onClick={handleConfirm} variant="default" className="bg-orange-500 hover:bg-orange-600">
            Logout
          </Button>
        </div>
      </div>
    </Modal>
  );
}

