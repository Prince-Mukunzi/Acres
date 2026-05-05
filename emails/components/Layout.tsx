import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Font,
} from "@react-email/components";
import * as React from "react";

// Acres brand colors (matching the frontend design system)
const colors = {
  charcoal: "#1a1a1a",
  acresBlue: "#5da2ff",
  surface: "#f8f9fb",
  border: "#e2e4e9",
  white: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
};

interface LayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export default function Layout({ previewText, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
        />
        <Font
          fontFamily="Helvetica Neue"
          fallbackFontFamily="Helvetica"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.wrapper}>
          <Container style={styles.card}>

            {/* Header */}
            <Section style={styles.header}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td align="left">
                    <Text style={styles.logo}>ACRES</Text>
                  </td>
                  <td align="right">
                    <Text style={styles.headerTag}>Property Management</Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Content */}
            {children}

            {/* Footer */}
            <Section style={styles.footer}>
              <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                <tr>
                  <td align="left">
                    <Text style={styles.footerLogo}>ACRES</Text>
                  </td>
                  <td align="right">
                    <Text style={styles.footerLink}>acres.software</Text>
                  </td>
                </tr>
              </table>
              <Hr style={styles.footerDivider} />
              <Text style={styles.footerFine}>
                Acres Property Management{"\n"}
                You are receiving this email because you are associated with Acres.
                {"\n"}&copy; 2026 Acres. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: colors.surface,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  wrapper: {
    maxWidth: "580px",
    margin: "0 auto",
    padding: "40px 20px",
  } as React.CSSProperties,

  card: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: "0",
  } as React.CSSProperties,

  // Header
  header: {
    padding: "32px 40px 28px",
    borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  logo: {
    fontFamily: "Georgia, serif",
    fontWeight: 400 as const,
    fontSize: "20px",
    letterSpacing: "0.15em",
    color: colors.charcoal,
    textTransform: "uppercase" as const,
    margin: 0,
  } as React.CSSProperties,

  headerTag: {
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: colors.textMuted,
    fontWeight: 400 as const,
    margin: 0,
  } as React.CSSProperties,

  // Footer
  footer: {
    padding: "24px 40px",
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  footerLogo: {
    fontFamily: "Georgia, serif",
    fontSize: "14px",
    fontWeight: 400 as const,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: colors.charcoal,
    margin: 0,
  } as React.CSSProperties,

  footerLink: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: colors.textMuted,
    margin: 0,
  } as React.CSSProperties,

  footerDivider: {
    borderTop: `1px solid ${colors.border}`,
    margin: "14px 0",
  } as React.CSSProperties,

  footerFine: {
    fontSize: "10px",
    fontWeight: 300 as const,
    color: colors.textMuted,
    lineHeight: "1.7",
    margin: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};

// Export colors for use in templates
export { colors };
