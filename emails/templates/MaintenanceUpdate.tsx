import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import Layout, { colors } from "../components/Layout";

interface MaintenanceUpdateProps {
  tenantName?: string;
  ticketTitle?: string;
  status?: string;
  notes?: string;
}

export default function MaintenanceUpdate({
  tenantName = "{{TENANT_NAME}}",
  ticketTitle = "{{TICKET_TITLE}}",
  status = "{{STATUS}}",
  notes = "{{NOTES}}",
}: MaintenanceUpdateProps) {
  return (
    <Layout previewText={`Maintenance update: ${ticketTitle} -- ${status}`}>
      <Section style={styles.hero}>
        <Text style={styles.eyebrow}>Maintenance Request</Text>
        <Text style={styles.heroTitle}>Your request{"\n"}has been updated.</Text>
        <Text style={styles.heroSubtitle}>
          There has been an update to your maintenance request. Here are the details.
        </Text>
      </Section>

      <Section style={styles.bodySection}>
        <Text style={styles.bodyText}>Dear {tenantName},</Text>
        <Text style={styles.bodyText}>
          We are writing to inform you of an update to your maintenance ticket.
          Please review the details below.
        </Text>

        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={styles.detailGrid}>
          <tr>
            <td style={styles.detailCell} width="50%">
              <Text style={styles.detailLabel}>Ticket</Text>
              <Text style={styles.detailValue}>{ticketTitle}</Text>
            </td>
            <td style={styles.detailCell} width="50%">
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.statusPill}>{status}</Text>
            </td>
          </tr>
        </table>

        {notes && notes !== "{{NOTES}}" && (
          <>
            <Text style={styles.notesLabel}>Update Notes</Text>
            <Section style={styles.notesBlock}>
              <Text style={styles.notesText}>{notes}</Text>
            </Section>
          </>
        )}

        <Text style={styles.bodyText}>
          If you have any questions about this update, please reach out to your
          property manager directly.
        </Text>

        <Hr style={styles.divider} />
        <Text style={styles.signoff}>
          Thank you,{"\n"}
          <span style={{ fontWeight: 700, color: colors.charcoal }}>The Acres Team</span>
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
    fontFamily: "'Bricolage Grotesque', Helvetica, sans-serif", fontWeight: 700 as const, fontSize: "30px",
    lineHeight: "1.2", color: colors.charcoal, marginBottom: "16px", marginTop: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: "14px", fontWeight: 400 as const, lineHeight: "1.7",
    color: colors.textSecondary, margin: 0,
  } as React.CSSProperties,
  bodySection: { padding: "32px 40px" } as React.CSSProperties,
  bodyText: {
    fontSize: "14px", fontWeight: 400 as const, lineHeight: "1.8",
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
    fontSize: "14px", fontWeight: 700 as const, color: colors.charcoal, margin: 0,
  } as React.CSSProperties,
  statusPill: {
    display: "inline-block" as const, fontSize: "9px", letterSpacing: "0.18em",
    textTransform: "uppercase" as const, padding: "4px 10px",
    backgroundColor: colors.surface, color: colors.acresBlue,
    border: `1px solid ${colors.border}`, margin: 0,
  } as React.CSSProperties,
  notesLabel: {
    fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase" as const,
    color: colors.textMuted, fontWeight: 700 as const, marginBottom: "8px", marginTop: 0,
  } as React.CSSProperties,
  notesBlock: {
    backgroundColor: colors.surface, borderLeft: `2px solid ${colors.border}`,
    padding: "14px 18px", marginBottom: "20px",
  } as React.CSSProperties,
  notesText: {
    fontSize: "13px", fontWeight: 400 as const, color: colors.textPrimary,
    lineHeight: "1.6", margin: 0, fontStyle: "italic" as const,
  } as React.CSSProperties,
  divider: { borderTop: `1px solid ${colors.border}`, margin: "24px 0" } as React.CSSProperties,
  signoff: {
    fontSize: "14px", fontWeight: 400 as const, color: colors.textSecondary,
    lineHeight: "1.6", marginTop: "0", marginBottom: 0, whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};
