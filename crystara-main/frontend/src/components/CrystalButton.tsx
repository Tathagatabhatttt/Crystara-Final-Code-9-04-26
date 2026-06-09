import React from "react";
import "./crystal-btn.css";

export const CrystalButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { children, className, ...rest } = props;
  return (
    <button className={`crystal-btn ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
};
