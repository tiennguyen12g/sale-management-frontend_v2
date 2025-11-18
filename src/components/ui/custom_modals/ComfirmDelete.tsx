import React, { type Dispatch, type SetStateAction } from "react";
import Modal from "../seraui/modal";
import Button from "../seraui/button";

interface Props {
  onExcute?: () => void;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}
export default function ConfirmDelete({ onExcute = () => {}, isModalOpen, setIsModalOpen }: Props) {
  const handleConfirm = () => {
    onExcute();
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} variant="destructive">
        Delete
      </Button>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Delete" size="sm">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Are you sure?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone. This will permanently delete and remove all data.</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Warning:</strong> This is a destructive action that cannot be reversed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant="destructive">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
