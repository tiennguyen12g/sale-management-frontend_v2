import React, { useState } from "react";
import Button from "../../components/ui/button";
import { AnimatedInfoModal } from "../../../dist";
import Notification from "../../components/ui/toast";
import TestToast from "./TestToast";
type AnimationType = "scale" | "slide" | "fade" | "bounce";

const animationConfigs: Record<
  AnimationType,
  {
    title: string;
    description: string;
    bulletPoints: string[];
    accentColor: string;
  }
> = {
  scale: {
    title: "Scale Animation",
    description:
      "This modal uses the scale animation with spring physics. It scales from 75% to 100% with a gentle bounce effect and moves up slightly during the entrance.",
    bulletPoints: ["Scale: 0.75 → 1.0", "Y movement: 20px up", "Spring damping: 25", "Spring stiffness: 300"],
    accentColor: "blue",
  },
  slide: {
    title: "Slide Animation",
    description: "This modal slides down from above the viewport with a spring effect and subtle scaling for a smooth entrance.",
    bulletPoints: ["Y movement: -50px → 0px", "Scale: 0.95 → 1.0", "Spring damping: 20", "Spring stiffness: 300"],
    accentColor: "green",
  },
  fade: {
    title: "Fade Animation",
    description: "A lightweight fade animation that focuses on opacity changes for a subtle, elegant appearance without movement.",
    bulletPoints: ["Opacity: 0 → 1", "Duration: 0.3s", "Easing: easeOut", "No scaling or movement"],
    accentColor: "purple",
  },
  bounce: {
    title: "Bounce Animation",
    description: "A playful entrance combining scaling, rotation, and increased bounce for a more energetic feel.",
    bulletPoints: ["Scale: 0.3 → 1.0", "Rotation: -10° → 0°", "Spring damping: 15", "Spring stiffness: 400"],
    accentColor: "orange",
  },
};

export default function TestSeriUi() {
  const [activeAnimation, setActiveAnimation] = useState<AnimationType | null>(null);
  return (
    <div className="space-y-6">
      <TestToast />
      <div className="flex justify-between ">
        <Notification
          type="success"
          title="Success!"
          message="Operation completed successfully."
          showIcon={true}
          duration={3000}
          onClose={() => console.log("Closed")}
          position="top-center"
        />
        <Notification
          type="error"
          title="Error!"
          message="Operation completed successfully."
          showIcon={true}
          duration={3000}
          onClose={() => console.log("Closed")}
          position="top-center"
        />
        <Notification
          type="info"
          title="Info!"
          message="Operation completed successfully."
          showIcon={true}
          duration={3000}
          onClose={() => console.log("Closed")}
          position="top-center"
        />
      </div>
      <div className="flex justify-between ">
        <Notification
          type="warning"
          title="Warning!"
          message="Operation completed successfully."
          showIcon={true}
          duration={3000}
          onClose={() => console.log("Closed")}
          position="top-center"
        />
        <Notification
          type="loading"
          title="Loading!"
          message="Operation completed successfully."
          showIcon={true}
          duration={3000}
          onClose={() => console.log("Closed")}
          position="top-center"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-[26px] font-[700]">3. Animation Modals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(animationConfigs) as AnimationType[]).map((key) => (
            <Button key={key} onClick={() => setActiveAnimation(key)} className="w-full" variant="outline">
              {animationConfigs[key].title}
            </Button>
          ))}
        </div>
      </div>

      {(Object.keys(animationConfigs) as AnimationType[]).map((key) => {
        const config = animationConfigs[key];
        return (
          <AnimatedInfoModal
            key={key}
            isOpen={activeAnimation === key}
            onClose={() => setActiveAnimation(null)}
            animation={key}
            title={config.title}
            description={config.description}
            bulletPoints={config.bulletPoints}
            accentColor={config.accentColor}
          />
        );
      })}
    </div>
  );
}
