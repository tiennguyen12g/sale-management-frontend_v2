import { useState, useRef } from 'react';
import Notication, {type NotificationType, type NotificationPosition, type NotificationProps} from "../components/ui/seraui/toast"

interface NotificationProps_Extend extends NotificationProps {
    id: string | number
}
export function useToastSeri() {
  const [notificationToasts, setNotificationToasts] = useState<NotificationProps_Extend[]>([]);
  const nextIdRef = useRef(1);

  const addToast = (
    type: NotificationType, 
    title: string, 
    message?: string, 
    duration?: number,
    position?: NotificationPosition,
    className?: string
  ) => {
    const id = nextIdRef.current++;
    const newToast: NotificationProps_Extend = {
      id,
      type,
      title,
      message,
      showIcon: true,
      duration,
      position: position || 'top-right',
      className,
      onClose: () => console.log('toast'),
    };

    setNotificationToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: number | string) => {
    setNotificationToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const successToast = (
    title: string, 
    message?: string, 
    duration = 3000,
    position?: NotificationPosition,
    className?: string
  ) => addToast('success', title, message, duration, position, className);

  const errorToast = (
    title: string, 
    message?: string, 
    duration = 5000,
    position?: NotificationPosition,
    className?: string
  ) => addToast('error', title, message, duration, position, className);

  const warningToast = (
    title: string, 
    message?: string, 
    duration = 4000,
    position?: NotificationPosition,
    className?: string
  ) => addToast('warning', title, message, duration, position, className);

  const infoToast = (
    title: string, 
    message?: string, 
    duration = 4000,
    position?: NotificationPosition,
    className?: string
  ) => addToast('info', title, message, duration, position, className);

  const loadingToast = (
    title: string, 
    message?: string,
    position?: NotificationPosition,
    className?: string
  ) => addToast('loading', title, message, undefined, position, className);

  return {
    notificationToasts,
    setNotificationToasts,
    successToast,
    errorToast,
    warningToast,
    infoToast,
    loadingToast,
    removeToast,
    addToast,
  };
}