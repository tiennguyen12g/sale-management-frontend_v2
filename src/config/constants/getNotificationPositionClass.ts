// Helper function to get position classes
import { type NotificationPosition } from '@tnbt/react-favorit-style';
const getNotificationPositionClasses = (position: NotificationPosition = "top-right"): string => {
  const positionMap: Record<NotificationPosition, string> = {
    "top-left": "fixed top-4 left-4",
    "top-center": "fixed top-4 left-1/2 -translate-x-1/2",
    "top-right": "fixed top-4 right-4",
    "bottom-left": "fixed bottom-4 left-4",
    "bottom-center": "fixed bottom-4 left-1/2 -translate-x-1/2",
    "bottom-right": "fixed bottom-4 right-4",
  };
  return positionMap[position];
};
export default getNotificationPositionClasses;