import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import Layout, { colors } from "../components/Layout";

interface GeneralCommunicationProps {
  tenantName?: string;
  subject?: string;
  body?: string;
  landlordName?: string;
}

export default function GeneralCommunication({
  tenantName = "{{TENANT_NAME}}",
  subject = "{{SUBJECT}}",
  body = "{{BODY}}",
  landlordName = "{{LANDLORD_NAME}}",
}: GeneralCommunicationProps) {
  return (
    <Layout previewText={`Message from ${landlordName}: ${subject}`}>
      <Section style={styles.hero}>
        <Text style={styles.eyebrow}>Notice</Text>
        <Text style={styles.heroTitle}>{subject}</Text>
      </Section>

      <Section style={styles.bodySection}>
        <Text style={styles.bodyText}>Dear {tenantName},</Text>
        <Text style={styles.bodyText}>{body}</Text>
        <Hr style={styles.divider} />
        <Text style={styles.signoff}>
          Best regards,{"\n"}
          <span style={{ fontWeight: 700, color: colors.charcoal }}>{landlordName}</span>
          {"\n"}
          <span style={{ fontSize: "12px", color: colors.textMuted }}>via Acres</span>
        </Text>
      </Section>
    </Layout>
  );
}

const styles = {
  hero: {
    padding: "44px 40px 36px", borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,
  eyebrow: {
    fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" as const,
    color: colors.acresBlue, marginBottom: "12px", marginTop: 0,
  } as React.CSSProperties,
  heroTitle: {
    fontFamily: "'Syne', Helvetica, sans-serif", fontWeight: 400 as const, fontSize: "30px",
    lineHeight: "1.2", color: colors.charcoal, marginBottom: "0", marginTop: 0,
  } as React.CSSProperties,
  bodySection: { padding: "32px 40px" } as React.CSSProperties,
  bodyText: {
    fontSize: "14px", fontWeight: 400 as const, lineHeight: "1.8",
    color: colors.textPrimary, marginBottom: "16px", marginTop: 0,
  } as React.CSSProperties,
  divider: { borderTop: `1px solid ${colors.border}`, margin: "24px 0" } as React.CSSProperties,
  signoff: {
    fontSize: "14px", fontWeight: 400 as const, color: colors.textSecondary,
    lineHeight: "1.6", marginTop: "0", marginBottom: 0, whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};
