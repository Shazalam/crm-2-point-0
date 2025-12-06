// emails/components/EmailButton.tsx
import React from "react";
import { Button } from "@react-email/components";

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  const styles = {
    primary: {
      backgroundColor: "#1c4d9f",
      color: "#ffffff",
    },
    secondary: {
      backgroundColor: "#e5e7eb",
      color: "#1f2937",
    },
  };

  return (
    <Button
      href={href}
      style={{
        ...styles[variant],
        padding: "12px 28px",
        borderRadius: "9999px",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "14px",
        display: "inline-block",
      }}
    >
      {children}
    </Button>
  );
}
