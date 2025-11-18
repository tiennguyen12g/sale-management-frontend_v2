import React from "react";
import Modal from "../seraui/modal";

type AnimationType = "scale" | "slide" | "fade" | "bounce";

interface AnimatedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  animation?: AnimationType;
  title: string;
  description: string;
  bulletPoints?: string[];
  accentColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
  purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
  orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
};

export default function AnimatedInfoModal({
  isOpen,
  onClose,
  animation = "scale",
  title,
  description,
  bulletPoints = [],
  accentColor = "blue",
  size = "md",
}: AnimatedInfoModalProps) {
  const colorClasses = colorMap[accentColor] ?? colorMap.blue;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} animation={animation} size={size}>
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{description}</p>

        {bulletPoints.length > 0 && (
          <div className={`rounded-lg border p-4 ${colorClasses}`}>
            <h4 className="font-medium mb-2">Animation Properties</h4>
            <ul className="text-sm space-y-1">
              {bulletPoints.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

