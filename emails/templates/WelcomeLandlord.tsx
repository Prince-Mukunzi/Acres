import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import Layout, { colors } from "../components/Layout";

interface WelcomeLandlordProps {
  userName?: string;
}

export default function WelcomeLandlord({
  userName = "{{USER_NAME}}",
}: WelcomeLandlordProps) {
  return (
    <Layout previewText={`Welcome to Acres — your 30-day free trial starts now.`}>

      {/* Hero */}
      <Section style={styles.hero}>
        <Text style={styles.eyebrow}>Welcome</Text>
        <Text style={styles.heroTitle}>
          A smarter way to{"\n"}manage property.
        </Text>
        <Text style={styles.heroSubtitle}>
          Thank you for choosing Acres. Your account is ready and your 30-day
          free trial starts now.
        </Text>
      </Section>

      {/* Body */}
      <Section style={styles.bodySection}>
        <Text style={styles.bodyText}>Dear {userName},</Text>
        <Text style={styles.bodyText}>
          Welcome to Acres -- the modern property management platform built to
          simplify your operations. Everything you need to manage properties,
          tenants, and maintenance is in one place.
        </Text>

        {/* Getting Started Steps */}
        <Text style={styles.sectionLabel}>Here is how to get started</Text>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={styles.stepsTable}>
          <tr>
            <td style={styles.stepCell}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="28" style={styles.stepNumber}>1</td>
                  <td>
                    <Text style={styles.stepTitle}>Add your first property</Text>
                    <Text style={styles.stepDescription}>Give it a name and address to get started</Text>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.stepCell}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="28" style={styles.stepNumber}>2</td>
                  <td>
                    <Text style={styles.stepTitle}>Create units</Text>
                    <Text style={styles.stepDescription}>Define rooms, floors, or spaces within your property</Text>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ ...styles.stepCell, borderBottom: "none" }}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="28" style={styles.stepNumber}>3</td>
                  <td>
                    <Text style={styles.stepTitle}>Onboard tenants</Text>
                    <Text style={styles.stepDescription}>Add tenants and start tracking rent and communications</Text>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <Hr style={styles.divider} />

        {/* Trial Features */}
        <Text style={styles.sectionLabel}>What is included in your trial</Text>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Unlimited properties and units</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Tenant communications via email and SMS</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Smart maintenance ticketing with QR codes</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style={styles.featureItem}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td width="8" style={styles.featureDot}></td>
                  <td style={styles.featureText}>Full analytics and accounting reports</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <Hr style={styles.divider} />

        <Text style={styles.bodyText}>
          If you have any questions or need help getting set up, simply reply
          to this email. We are here to help.
        </Text>

        <Text style={styles.signoff}>
          Welcome aboard,{"\n"}
          <span style={{ fontWeight: 500, color: colors.charcoal }}>The Acres Team</span>
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
    fontFamily: "Georgia, serif",
    fontWeight: 400 as const,
    fontSize: "30px",
    lineHeight: "1.2",
    color: colors.charcoal,
    marginBottom: "16px",
    marginTop: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,

  heroSubtitle: {
    fontSize: "14px",
    fontWeight: 300 as const,
    lineHeight: "1.7",
    color: colors.textSecondary,
    margin: 0,
  } as React.CSSProperties,

  bodySection: {
    padding: "32px 40px",
  } as React.CSSProperties,

  bodyText: {
    fontSize: "14px",
    fontWeight: 300 as const,
    lineHeight: "1.8",
    color: colors.textPrimary,
    marginBottom: "16px",
    marginTop: 0,
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: colors.acresBlue,
    fontWeight: 500 as const,
    marginBottom: "12px",
    marginTop: 0,
  } as React.CSSProperties,

  stepsTable: {
    margin: "0 0 8px 0",
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  stepCell: {
    padding: "16px 20px",
    borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  stepNumber: {
    fontFamily: "Georgia, serif",
    fontSize: "18px",
    fontWeight: 400 as const,
    color: colors.acresBlue,
    verticalAlign: "top" as const,
    paddingRight: "14px",
    paddingTop: "2px",
  } as React.CSSProperties,

  stepTitle: {
    fontSize: "14px",
    fontWeight: 500 as const,
    color: colors.charcoal,
    margin: 0,
    lineHeight: "1.4",
  } as React.CSSProperties,

  stepDescription: {
    fontSize: "13px",
    fontWeight: 300 as const,
    color: colors.textSecondary,
    margin: "2px 0 0 0",
    lineHeight: "1.4",
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
    fontWeight: 300 as const,
    color: colors.textPrimary,
    lineHeight: "1.5",
  } as React.CSSProperties,

  divider: {
    borderTop: `1px solid ${colors.border}`,
    margin: "24px 0",
  } as React.CSSProperties,

  signoff: {
    fontSize: "14px",
    fontWeight: 300 as const,
    color: colors.textSecondary,
    lineHeight: "1.6",
    marginTop: "24px",
    marginBottom: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};
