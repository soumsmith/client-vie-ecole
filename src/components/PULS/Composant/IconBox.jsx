import React from "react";

const IconBox = ({ icon: Icon, size = 18, color = "#10b981" }) => {
  return (
    <div
      style={{
        border: `1px solid #10b981`,
        color: "#10b981",
        backgroundColor: "#f0fdf4",
        borderRadius: "10px",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={size} color={color} />
    </div>
  );
};

export default IconBox;
