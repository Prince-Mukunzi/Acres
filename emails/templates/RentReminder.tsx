import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import Layout, { colors } from "../components/Layout";

interface RentReminderProps {
  tenantName?: string;
  amountDue?: string;
  dueDate?: string;
}

export default function RentReminder({
  tenantName = "{{TENANT_NAME}}",
  amountDue = "{{AMOUNT_DUE}}",
  dueDate = "{{DUE_DATE}}",
}: RentReminderProps) {
  return (
    <Layout previewText={`Rent reminder for ${tenantName}`}>
      <Section style={styles.alertBand}>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tr>
            <td width="36" style={{ verticalAlign: "middle", paddingRight: "14px" }}>
              <div style={styles.alertIcon}>!</div>
            </td>
            <td>
              <Text style={styles.alertText}>
                <span style={{ fontWeight: 500, color: colors.charcoal }}>Payment overdue</span>
                {" "}&mdash; Please arrange payment at your earliest convenience.
              </Text>
            </td>
          </tr>
        </table>
      </Section>

      <Section style={styles.hero}>
        <Text style={styles.eyebrow}>Rent Reminder</Text>
        <Text style={styles.heroTitle}>Your payment{"\n"}is overdue.</Text>
        <Text style={styles.heroSubtitle}>
          A reminder that your rent payment has not yet been received.
        </Text>
      </Section>

      <Section style={styles.bodySection}>
        <Text style={styles.bodyText}>Dear {tenantName},</Text>
        <Text style={styles.bodyText}>
          This is a courtesy reminder that your rent payment is currently
          overdue. Please ensure your payment is submitted as soon as possible
          to maintain your account in good standing.
        </Text>

        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={styles.detailGrid}>
          <tr>
            <td style={styles.detailCell} width="50%">
              <Text style={styles.detailLabel}>Amount due</Text>
              <Text style={styles.detailValueLarge}>{amountDue}</Text>
            </td>
            <td style={styles.detailCell} width="50%">
              <Text style={styles.detailLabel}>Due date</Text>
              <Text style={styles.detailValue}>{dueDate}</Text>
            </td>
          </tr>
        </table>

        <Text style={styles.bodyText}>
          If you have already made the payment, please disregard this notice.
          For any questions or payment arrangements, contact your property manager.
        </Text>

        <Hr style={styles.divider} />
        <Text style={styles.finePrint}>
          Late fees may apply to payments received after the due date as outlined
          in your tenancy agreement.
        </Text>

        <Text style={styles.signoff}>
          Thank you,{"\n"}
          <span style={{ fontWeight: 500, color: colors.charcoal }}>Acres Property Management</span>
        </Text>
      </Section>
    </Layout>
  );
}

const styles = {
  alertBand: {
    padding: "18px 40px",
    backgroundColor: colors.surface,
    borderBottom: `2px solid ${colors.acresBlue}`,
  } as React.CSSProperties,
  alertIcon: {
    width: "32px", height: "32px", border: `1px solid ${colors.acresBlue}`,
    borderRadius: "50%", fontFamily: "Georgia, serif", fontSize: "14px",
    fontWeight: 500 as const, color: colors.acresBlue, textAlign: "center" as const,
    lineHeight: "32px",
  } as React.CSSProperties,
  alertText: {
    fontSize: "12px", fontWeight: 300 as const, color: colors.textSecondary,
    lineHeight: "1.6", margin: 0,
  } as React.CSSProperties,
  hero: {
    padding: "44px 40px 36px", borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,
  eyebrow: {
    fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" as const,
    color: colors.acresBlue, marginBottom: "12px", marginTop: 0,
  } as React.CSSProperties,
  heroTitle: {
    fontFamily: "Georgia, serif", fontWeight: 400 as const, fontSize: "30px",
    lineHeight: "1.2", color: colors.charcoal, marginBottom: "16px", marginTop: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: "14px", fontWeight: 300 as const, lineHeight: "1.7",
    color: colors.textSecondary, margin: 0,
  } as React.CSSProperties,
  bodySection: { padding: "32px 40px" } as React.CSSProperties,
  bodyText: {
    fontSize: "14px", fontWeight: 300 as const, lineHeight: "1.8",
    color: colors.textPrimary, marginBottom: "16px", marginTop: 0,
  } as React.CSSProperties,
  detailGrid: {
    margin: "24px 0", border: `1px solid ${colors.border}`,
  } as React.CSSProperties,
  detailCell: {
    padding: "16px 20px", borderRight: `1px solid ${colors.border}`,
  } as React.CSSProperties,
  detailLabel: {
    fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase" as const,
    color: colors.textMuted, marginBottom: "4px", marginTop: 0,
  } as React.CSSProperties,
  detailValue: {
    fontSize: "14px", fontWeight: 500 as const, color: colors.charcoal, margin: 0,
  } as React.CSSProperties,
  detailValueLarge: {
    fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 400 as const,
    color: colors.charcoal, margin: 0,
  } as React.CSSProperties,
  divider: { borderTop: `1px solid ${colors.border}`, margin: "24px 0" } as React.CSSProperties,
  finePrint: {
    fontSize: "12px", fontWeight: 300 as const, color: colors.textMuted,
    lineHeight: "1.6", marginBottom: "16px", marginTop: 0,
  } as React.CSSProperties,
  signoff: {
    fontSize: "14px", fontWeight: 300 as const, color: colors.textSecondary,
    lineHeight: "1.6", marginTop: "24px", marginBottom: 0, whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};
