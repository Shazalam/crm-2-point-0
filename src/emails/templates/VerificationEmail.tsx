// emails/templates/VerificationEmail.tsx
import { Section, Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { EmailHeader } from "../components/EmailHeader";
import { EmailFooter } from "../components/EmailFooter";

type VerificationEmailProps = {
  name: string;
  otp: string;
  expiresIn?: number; // minutes (default: 10)
  supportEmail?: string;
};

export const VerificationOtpEmail = ({
  name,
  otp,
  expiresIn = 10,
  supportEmail = "support@flowcrm.com",
}: VerificationEmailProps) => {
  
  return (
    <EmailLayout preview="Verify your BFDS HUB CRM account">
      <EmailHeader
        title="Verify Your Email"
        subtitle="You're almost there"
      />

      <Section style={{ padding: "32px 24px" }}>
        <Text
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#1f2937",
          }}
        >
          Hi {name},
        </Text>

        <Text
          style={{
            fontSize: "14px",
            color: "#4b5563",
            lineHeight: "1.6",
            marginBottom: "20px",
          }}
        >
          Thanks for creating an account with BFDS HUB CRM! Please use the verification code below to confirm your email.
        </Text>

        <div
          style={{
            fontSize: "36px",
            fontWeight: "700",
            textAlign: "center",
            letterSpacing: "6px",
            backgroundColor: "#EEF2FF",
            padding: "20px",
            borderRadius: "12px",
            color: "#4F46E5",
            margin: "30px 0",
          }}
        >
          {otp}
        </div>

        <Text
          style={{
            fontSize: "14px",
            color: "#4b5563",
            lineHeight: "1.6",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          This code will expire in <strong>{expiresIn} minutes</strong>.
        </Text>

        <Text
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginTop: "24px",
            lineHeight: "1.6",
            textAlign: "center",
          }}
        >
          If you didn’t request this code, please ignore this email or{" "}
          <a href={`mailto:${supportEmail}`} style={{ color: "#4F46E5" }}>
            contact support
          </a>.
        </Text>
      </Section>

      <EmailFooter companyName="FlowCRM" />
    </EmailLayout>
  );
}
