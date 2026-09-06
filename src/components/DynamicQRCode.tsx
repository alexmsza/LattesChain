"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface DynamicQRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

export const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({
  value,
  size = 160,
  fgColor = "#030712",
  bgColor = "#ffffff",
  includeMargin = true,
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse ${className}`}
      >
        <span className="text-[10px] text-slate-400">Gerando QR...</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-xl bg-white shadow-sm ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="M"
        includeMargin={includeMargin}
      />
    </div>
  );
};
