import React, { type Dispatch, type SetStateAction } from "react";
import Modal from "../seraui/modal";
import Button from "../seraui/button";

interface ResetSettingsProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm?: () => void;
  title?: string;
  affectedItems?: string[];
}

const defaultAffectedItems = [
  "Theme preferences",
  "Notification settings",
  "Display options",
  "Privacy settings",
  "Keyboard shortcuts",
];

export default function ResetSettingsModal({
  isModalOpen,
  setIsModalOpen,
  onConfirm = () => {},
  title = "Reset All Settings",
  affectedItems = defaultAffectedItems,
}: ResetSettingsProps) {
  const handleConfirm = () => {
    onConfirm();
    setIsModalOpen(false);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reset Settings" size="md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This will restore all settings to their default values. Your personal data and files will not be affected.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">The following will be reset:</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {affectedItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <Button onClick={() => setIsModalOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            Reset Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}

