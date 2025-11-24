import React from "react";
import { useToastSeri, ButtonCommon } from "@tnbt/react-favorit-style";

/**
 * ToastExample - Example usage of the toast system
 * 
 * This demonstrates how easy it is to use toasts:
 * 1. Add <ToastContainer /> once at the app level
 * 2. Use the hook methods anywhere
 */
export default function ToastExample() {
  const { successToast, errorToast, warningToast, infoToast, loadingToast, addToast, setNotificationToasts } = useToastSeri();

  // Simple success toast
  const handleSuccess = () => {
    successToast("Success!", "Operation completed successfully");
  };

  // Simple error toast
  const handleError = () => {
    errorToast("Error!", "Something went wrong");
  };

  // Simple warning toast
  const handleWarning = () => {
    warningToast("Warning!", "Please check your input");
  };

  // Simple info toast
  const handleInfo = () => {
    infoToast("Info", "New update available");
  };

  // Loading toast that transitions to success
  const handlePayment = async () => {
    // Show loading toast
    const loadingId = loadingToast("Processing Payment", "Please wait...", "top-center");
    
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Replace loading with success
    setNotificationToasts((prev) =>
      prev.map((toast) =>
        toast.id === loadingId
          ? { ...toast, type: "success", title: "Payment Successful!", message: "Your payment has been processed", duration: 4000 }
          : toast
      )
    );
  };

  // Async flow with try/catch
  const handleSubmit = async () => {
    try {
      loadingToast("Submitting...", "Please wait", "top-center");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      successToast("Success!", "Data saved successfully", 3000, "top-center");
    } catch (err) {
      errorToast("Error!", "Failed to save data", 5000, "top-center");
    }
  };

  // Test all positions
  const handleTestPositions = () => {
    successToast("Top Right", "Default position", 3000, "top-right");
    errorToast("Top Left", "Error at top left", 3000, "top-left");
    warningToast("Top Center", "Warning at center", 3000, "top-center");
    infoToast("Bottom Right", "Info at bottom right", 3000, "bottom-right");
    loadingToast("Bottom Left", "Loading at bottom left", "bottom-left");
  };

  // Custom className example
  const handleCustomStyle = () => {
    successToast("Custom Style", "With custom className", 3000, "top-right", "bg-purple-500 border-purple-600");
  };
  const handleSignUp = async () => {
    // Show loading toast
    const loadingId = loadingToast("Processing Register", "Please wait...", "top-center");
    
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Replace loading with success
    setNotificationToasts((prev) =>
      prev.map((toast) =>
        toast.id === loadingId
          ? { ...toast, type: "success", title: "Successful!", message: "You have successfully registered an account.", duration: 4000 }
          : toast
      )
    );
  };

  return (
    <div>
      <div className="my-2.5 font-[500] text-[18px] text-left">Toast Notification Examples</div>

      {/* Test Buttons */}
      <div className="space-x-2 flex flex-wrap gap-2">
        <ButtonCommon onClick={handleSuccess} variant="continue">
          Success Toast
        </ButtonCommon>
        <ButtonCommon onClick={handleError} variant="delete">
          Error Toast
        </ButtonCommon>
        <ButtonCommon onClick={handleWarning} variant="warning">
          Warning Toast
        </ButtonCommon>
        <ButtonCommon onClick={handleInfo} variant="info">
          Info Toast
        </ButtonCommon>
        <ButtonCommon onClick={handlePayment} variant="submit">
          Payment Flow
        </ButtonCommon>
        <ButtonCommon onClick={handleSubmit} variant="submit">
          Submit Flow
        </ButtonCommon>
        <ButtonCommon onClick={handleTestPositions} variant="default">
          Test All Positions
        </ButtonCommon>
        <ButtonCommon onClick={handleCustomStyle} variant="default">
          Custom Style
        </ButtonCommon>
                <ButtonCommon onClick={handleSignUp} variant="default">
          Sign Up
        </ButtonCommon>
      </div>

    </div>
  );
}
