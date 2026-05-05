import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import Layout, { colors } from "../components/Layout";

interface WelcomeTenantProps {
  tenantName?: string;
  propertyName?: string;
  unitNumber?: string;
}

export default function WelcomeTenant({
  tenantName = "{{TENANT_NAME}}",
  propertyName = "{{PROPERTY_NAME}}",
  unitNumber = "{{UNIT_NUMBER}}",
}: WelcomeTenantProps) {
  return (
    <Layout previewText={`Welcome to your new home — ${propertyName}`}>

      <Section style={styles.hero}>
        <Text style={styles.eyebrow}>Welcome</Text>
        <Text style={styles.heroTitle}>
          It's a pleasure{"\n"}to have you with us.
        </Text>
        <Text style={styles.heroSubtitle}>
          Your new home is ready, and so are we. Everything you need to know
          about your tenancy is outlined below.
        </Text>
      </Section>

      <Section style={styles.bodySection}>
        <Text style={styles.bodyText}>Dear {tenantName},</Text>
        <Text style={styles.bodyText}>
          We are delighted to welcome you to your new residence. Your property
          manager has registered you on the Acres platform, which will be used
          to coordinate maintenance requests, communicate important updates,
          and manage your tenancy.
        </Text>

        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={styles.detailGrid}>
          <tr>
            <td style={styles.detailCell} width="50%">
              <Text style={styles.detailLabel}>Property</Text>
              <Text style={styles.detailValue}>{propertyName}</Text>
            </td>
            <td style={styles.detailCell} width="50%">
              <Text style={styles.detailLabel}>Unit</Text>
              <Text style={styles.detailValue}>{unitNumber}</Text>
            </td>
          </tr>
        </table>

        <Text style={styles.bodyText}>
          Below is what you can expect as a resident managed through Acres:
        </Text>

        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Receive important communications directly from your property manager</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Get timely reminders about upcoming rent payments</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Stay updated on maintenance ticket progress</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Dedicated property manager available for any concerns</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <Hr style={styles.divider} />

        <Text style={styles.bodyText}>
          If you have any questions, please reach out to your property manager
          directly. We look forward to a great tenancy.
        </Text>

        <Text style={styles.signoff}>
          Warm regards,{"\n"}
          <span style={{ fontWeight: 700, color: colors.charcoal }}>The Acres Team</span>
        </Text>
      </Section>
    </Layout>
  );
}

const styles = {
  hero: {
    padding: "44px 40px 36px",
    borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  eyebrow: {
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: colors.acresBlue,
    marginBottom: "12px",
    marginTop: 0,
  } as React.CSSProperties,

  heroTitle: {
    fontFamily: "'Bricolage Grotesque', Helvetica, sans-serif",
    fontWeight: 700 as const,
    fontSize: "30px",
    lineHeight: "1.2",
    color: colors.charcoal,
    marginBottom: "16px",
    marginTop: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,

  heroSubtitle: {
    fontSize: "14px",
    fontWeight: 400 as const,
    lineHeight: "1.7",
    color: colors.textSecondary,
    margin: 0,
  } as React.CSSProperties,

  bodySection: {
    padding: "32px 40px",
  } as React.CSSProperties,

  bodyText: {
    fontSize: "14px",
    fontWeight: 400 as const,
    lineHeight: "1.8",
    color: colors.textPrimary,
    marginBottom: "16px",
    marginTop: 0,
  } as React.CSSProperties,

  detailGrid: {
    margin: "24px 0",
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  detailCell: {
    padding: "16px 20px",
    borderRight: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  detailLabel: {
    fontSize: "9px",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: colors.textMuted,
    marginBottom: "4px",
    marginTop: 0,
  } as React.CSSProperties,

  detailValue: {
    fontSize: "14px",
    fontWeight: 700 as const,
    color: colors.charcoal,
    margin: 0,
  } as React.CSSProperties,

  featureItem: {
    padding: "8px 0",
    borderBottom: `1px solid ${colors.surface}`,
  } as React.CSSProperties,

  featureDot: {
    verticalAlign: "top" as const,
    paddingRight: "12px",
    paddingTop: "7px",
  } as React.CSSProperties,

  featureText: {
    fontSize: "13px",
    fontWeight: 400 as const,
    color: colors.textPrimary,
    lineHeight: "1.5",
  } as React.CSSProperties,

  divider: {
    borderTop: `1px solid ${colors.border}`,
    margin: "24px 0",
  } as React.CSSProperties,

  signoff: {
    fontSize: "14px",
    fontWeight: 400 as const,
    color: colors.textSecondary,
    lineHeight: "1.6",
    marginTop: "24px",
    marginBottom: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};
