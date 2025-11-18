import { type Dispatch, type SetStateAction } from "react";
import Modal from "../seraui/modal";
import Button from "../seraui/button";

interface Props {
  onExcute?: () => void;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  content: string;
}

export default function BaseNotification({
  onExcute = () => {
    console.log("");
  },
  isModalOpen,
  setIsModalOpen,
  content = "",
}: Props) {
  return (
    <div className="space-y-4">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Notification">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">{content}</p>
          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
