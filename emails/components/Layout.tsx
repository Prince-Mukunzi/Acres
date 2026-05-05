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
          fontFamily="Bricolage Grotesque"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/bricolagegrotesque/v1/3y9U6as8bTXq_nANBjzKo3IeZx8z6up5BeSl5jBNz_19PcbFJ2Fkaw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Syne"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uT6kR47NCV5Z.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
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
                  <td align="center">
                    <Text style={styles.logo}>ACRES</Text>
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
                Acres Software{"\n"}
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
    fontFamily: "'Syne', Helvetica, Arial, sans-serif",
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

  header: {
    padding: "32px 40px 28px",
    borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  logo: {
    fontFamily: "'Bricolage Grotesque', Helvetica, sans-serif",
    fontWeight: 700 as const,
    fontSize: "20px",
    letterSpacing: "0.15em",
    color: colors.charcoal,
    textTransform: "uppercase" as const,
    margin: 0,
    textAlign: "center" as const,
  } as React.CSSProperties,

  footer: {
    padding: "24px 40px",
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  footerLogo: {
    fontFamily: "'Bricolage Grotesque', Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: 700 as const,
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
    fontWeight: 400 as const,
    color: colors.textMuted,
    lineHeight: "1.7",
    margin: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,
};

export { colors };
