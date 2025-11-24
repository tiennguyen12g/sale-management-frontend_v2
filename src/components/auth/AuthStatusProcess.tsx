import React, {useMemo} from 'react'
import { useToastSeri, Notification, type NotificationPosition } from '@tnbt/react-favorit-style';
import getNotificationPositionClasses from '@/config/constants/getNotificationPositionClass';
export default function AuthStatusProcess() {
    const { notificationToasts, successToast, errorToast, warningToast, infoToast, loadingToast, removeToast, setNotificationToasts, addToast } = useToastSeri();
  // Group toasts by position
  const toastsByPosition = useMemo(() => {
    const grouped: Record<NotificationPosition, typeof notificationToasts> = {
      "top-left": [],
      "top-center": [],
      "top-right": [],
      "bottom-left": [],
      "bottom-center": [],
      "bottom-right": [],
    };

    notificationToasts.forEach((toast) => {
      const position = toast.position || "top-right";
      grouped[position].push(toast);
    });

    return grouped;
  }, [notificationToasts]);
  return (
    <div>
            {/* Render toasts grouped by position */}
      {(Object.keys(toastsByPosition) as NotificationPosition[]).map((position) => {
        const toasts = toastsByPosition[position];
        if (toasts.length === 0) return null;

        return (
          <div key={position} className={`${getNotificationPositionClasses(position)} z-50 space-y-2`}>
            {toasts.map((toast) => (
              <Notification key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
          </div>
        );
      })}
    </div>
  )
}
