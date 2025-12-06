// emails/components/EmailFooter.tsx
import React from "react";
import { Section, Text, Link, Hr } from "@react-email/components";

type EmailFooterProps = {
  companyName?: string;
  unsubscribeUrl?: string;
};

export function EmailFooter({
  companyName = "BFDS HUB CRM",
  unsubscribeUrl,
}: EmailFooterProps) {
  return (
    <>
      <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />
      <Section style={{ padding: "24px", textAlign: "center" }}>
        <Text
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            margin: "0 0 8px 0",
          }}
        >
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </Text>
        {unsubscribeUrl && (
          <Link
            href={unsubscribeUrl}
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textDecoration: "none",
            }}
          >
            Unsubscribe
          </Link>
        )}
      </Section>
    </>
  );
}
