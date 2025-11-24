import React from "react";
import { ButtonBlur, icons } from "../StyleComponents"
// import { icons } from "../style_components/icons/Icons";

/**
 * Example component demonstrating ButtonBlur usage with correct background colors
 *
 * ButtonBlur works best on colorful gradient backgrounds or images.
 * The blur effect creates a glassmorphism look.
 */
export default function ButtonBlurExample() {
  const navigate = (path: string) => {
    console.log(`Navigate to: ${path}`);
  };

  return (
    <div className="min-h-screen py-5">
      {/* Example 1: Purple gradient background (as mentioned by user) */}
      <div
        className="p-8 rounded-lg mb-8"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <h2 className="text-white text-2xl font-bold mb-4">Example 1: Purple Gradient Background</h2>
        <div className="flex flex-wrap gap-4">
          <ButtonBlur onClick={() => navigate("/quan-li-don-hang")}>Đơn hàng</ButtonBlur>
          <ButtonBlur variant="light" onClick={() => navigate("/products")}>
            Sản phẩm
          </ButtonBlur>
          <ButtonBlur icon={icons.check} iconPosition="left" onClick={() => navigate("/save")}>
            Lưu
          </ButtonBlur>
          <ButtonBlur icon={icons.download} iconPosition="right" size="lg" onClick={() => navigate("/download")}>
            Tải xuống
          </ButtonBlur>
          <ButtonBlur icon={icons.check} iconPosition="left">
            With Icon Left
          </ButtonBlur>
          <ButtonBlur icon={icons.user} iconPosition="right" size="lg">
            With Icon Right
          </ButtonBlur>
        </div>
      </div>

      {/* Example 2: Blue gradient background */}
      <div
        className="p-8 rounded-lg mb-8"
        style={{
          background: "linear-gradient(135deg,#0072ff 0%, #00c6ff 100%)",
        }}
      >
        <h2 className="text-white text-2xl font-bold mb-4">Example 2: Blue Gradient Background</h2>
        <div className="flex flex-wrap gap-4">
          <ButtonBlur size="sm" variant="light">
            Small Button
          </ButtonBlur>
          <ButtonBlur size="md">Medium Button</ButtonBlur>
          <ButtonBlur size="lg">Large Button</ButtonBlur>
          <ButtonBlur disabled>Disabled Button</ButtonBlur>
        </div>
      </div>

      {/* Example 3: Orange gradient background */}
      <div
        className="p-8 rounded-lg mb-8"
        style={{
          background: "linear-gradient(135deg, #fe8c00 0%, #f83600 100%)",
        }}
      >
        <h2 className="text-white text-2xl font-bold mb-4">Example 3: Orange Gradient Background</h2>
        <div className="flex flex-wrap gap-4">
          <ButtonBlur variant="default">Default Variant</ButtonBlur>
          <ButtonBlur variant="light">Light Variant</ButtonBlur>
          <ButtonBlur icon={icons.setting} iconPosition="left" variant="light">
            Settings
          </ButtonBlur>
          <ButtonBlur icon={icons.notify} iconPosition="right" variant="light">
            Notifications
          </ButtonBlur>
        </div>
      </div>

      {/* Example 4: Image background */}
      <div
        className="p-8 rounded-lg mb-8 relative overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-blue-600/50"></div>
        <div className="relative z-10">
          <h2 className="text-white text-2xl font-bold mb-4">Example 4: Image Background with Overlay</h2>
          <div className="flex flex-wrap gap-4">
            <ButtonBlur fullWidth>Full Width Button</ButtonBlur>
            <ButtonBlur icon={icons.favorit} iconPosition="left">
              Favorite
            </ButtonBlur>
            <ButtonBlur icon={icons.share} iconPosition="right">
              Share
            </ButtonBlur>
          </div>
        </div>
      </div>

      {/* Example 5: Dark background */}
      <div className="p-8 rounded-lg mb-8 bg-gray-900">
        <h2 className="text-white text-2xl font-bold mb-4">Example 5: Dark Background (Dark Variant)</h2>
        <div className="flex flex-wrap gap-4">
          <ButtonBlur variant="light">Dark Variant</ButtonBlur>
          <ButtonBlur variant="light" icon={icons.edit} iconPosition="left">
            Edit
          </ButtonBlur>
          <ButtonBlur variant="light" icon={icons.delete} iconPosition="right">
            Delete
          </ButtonBlur>
        </div>
      </div>
      {/* Example 6: #ff0000 gradient background */}
      <div
        className="p-8 rounded-lg mb-8"
        style={{
          background: "linear-gradient(135deg, #f06a6a 0%, #f83600 100%)",
        }}
      >
        <h2 className="text-white text-2xl font-bold mb-4">Example 6: Red Gradient Background</h2>
        <div className="flex flex-wrap gap-4">
          <ButtonBlur variant="default">Default Variant</ButtonBlur>
          <ButtonBlur variant="light">Light Variant</ButtonBlur>
          <ButtonBlur icon={icons.setting} iconPosition="left" variant="light">
            Settings
          </ButtonBlur>
          <ButtonBlur icon={icons.notify} iconPosition="right" variant="light">
            Notifications
          </ButtonBlur>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Usage Instructions:</h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>1. Background Requirements:</strong> ButtonBlur works best on colorful gradient backgrounds or images. The blur effect creates a
            glassmorphism look.
          </p>
          <p>
            <strong>2. Variants:</strong>
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>
              <code>default</code>: Semi-transparent white (best for colorful backgrounds)
            </li>
            <li>
              <code>light</code>: More opaque white (for darker backgrounds)
            </li>
            <li>
              <code>dark</code>: Semi-transparent black (for light backgrounds)
            </li>
          </ul>
          <p>
            <strong>3. Sizes:</strong> <code>sm</code>, <code>md</code>, <code>lg</code>
          </p>
          <p>
            <strong>4. Icons:</strong> Supports icons from Icons.ts or any React icon component
          </p>
        </div>
      </div>
    </div>
  );
}
