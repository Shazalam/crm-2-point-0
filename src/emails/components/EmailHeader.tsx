// emails/components/EmailHeader.tsx
import { Section, Img, Text } from "@react-email/components";

type EmailHeaderProps = {
  logoUrl?: string;
  title?: string;
  subtitle?: string;
};

export function EmailHeader({
  logoUrl = "https://prostheon.com/logo.png",
  title,
  subtitle,
}: EmailHeaderProps) {
  return (
    <Section
      style={{
        padding: "32px 24px",
        textAlign: "center",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {logoUrl && (
        <Img
          src={logoUrl}
          alt="Prostheon"
          width={40}
          height={40}
          style={{ marginBottom: "12px" }}
        />
      )}
      {title && (
        <Text
          style={{
            fontSize: "24px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            color: "#1f2937",
          }}
        >
          {title}
        </Text>
      )}
      {subtitle && (
        <Text
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: "0",
          }}
        >
          {subtitle}
        </Text>
      )}
    </Section>
  );
}
