"""
Acres — Branded HTML Email Templates for Resend

This module provides professional, responsive HTML email templates
for all outbound communications from the Acres platform.

Usage:
    from backend.utils.email_templates import (
        general_communication_template,
        overdue_reminder_template,
        welcome_tenant_template,
        maintenance_update_template,
    )

    html = general_communication_template(
        tenant_name="John Doe",
        subject="Important Notice",
        body="Your lease renewal is coming up next month."
    )

    resend.Emails.send({
        "from": "Acres <onboarding@resend.dev>",
        "to": ["john@example.com"],
        "subject": "Important Notice",
        "html": html,
    })


Template Variables Guide (for Resend Dashboard users):
------------------------------------------------------
If you prefer to host these on the Resend Dashboard instead of inline,
use the following variable syntax in your template HTML:

    {{{TENANT_NAME}}}     → Tenant's full name
    {{{SUBJECT}}}         → Email subject / title
    {{{BODY}}}            → Message body content
    {{{AMOUNT_DUE}}}      → Outstanding rent amount
    {{{DUE_DATE}}}        → Payment due date
    {{{PROPERTY_NAME}}}   → Property name
    {{{UNIT_NUMBER}}}     → Unit identifier
    {{{TICKET_TITLE}}}    → Maintenance ticket title
    {{{STATUS}}}          → Current status label
    {{{LANDLORD_NAME}}}   → Property manager's name
"""


# ─── Shared Base Layout ───────────────────────────────────────────────────────

def _base_layout(content: str, preview_text: str = "") -> str:
    """Wraps email content in a responsive, branded Acres layout.

    This base template handles:
    - Email client resets (Outlook, Gmail, Yahoo, etc.)
    - Responsive width (600px max, mobile-friendly)
    - Branded header with Acres logo/icon
    - Consistent footer with legal text
    - Dark-mode-friendly color scheme
    """
    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Acres</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset */
        body, table, td, a {{ text-decoration: none; }}
        img {{ border: 0; height: auto; line-height: 100%; outline: none; }}
        table {{ border-collapse: collapse !important; }}
        body {{ height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }}

        /* Responsive */
        @media screen and (max-width: 600px) {{
            .email-container {{ width: 100% !important; }}
            .stack-column {{ display: block !important; width: 100% !important; }}
            .padding-mobile {{ padding-left: 20px !important; padding-right: 20px !important; }}
        }}

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {{
            .email-bg {{ background-color: #1a1a2e !important; }}
            .card-bg {{ background-color: #16213e !important; }}
            .text-primary {{ color: #e8e8e8 !important; }}
            .text-secondary {{ color: #b0b0b0 !important; }}
        }}
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

    <!-- Preview text (hidden) -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        {preview_text}
        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <!-- Email wrapper -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f2f5;" class="email-bg">
        <tr>
            <td align="center" style="padding: 40px 10px;">

                <!-- Email container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; width: 100%;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 0 0 0 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 50%, #3a7cb8 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
                                        <!-- Acres Logo / Brand -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;">
                                                        <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: 1px; font-family: 'Segoe UI', Roboto, sans-serif;">&#9968; Acres</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="padding-top: 4px;">
                                                    <span style="font-size: 13px; color: rgba(255,255,255,0.75); letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">Property Management</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 40px 32px 40px;" class="card-bg padding-mobile">
                            {content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;" class="padding-mobile">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 8px;">
                                        <span style="font-size: 13px; color: #6c757d; font-weight: 600;">Acres Property Management</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <span style="font-size: 11px; color: #adb5bd; line-height: 1.6;">
                                            This email was sent from the Acres platform.<br>
                                            &copy; 2026 Acres. All rights reserved.
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                <!-- /Email container -->

            </td>
        </tr>
    </table>

</body>
</html>"""


# ─── 1. General Communication Template ────────────────────────────────────────

def general_communication_template(
    tenant_name: str,
    subject: str,
    body: str,
    landlord_name: str = "Your Property Manager",
) -> str:
    """Template for landlord → tenant messages sent from the Communications tab.

    Resend Dashboard variables:
        {{{TENANT_NAME}}}    — Recipient's name
        {{{SUBJECT}}}        — Email subject
        {{{BODY}}}           — Message body
        {{{LANDLORD_NAME}}}  — Sender / manager name
    """
    content = f"""
        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #1a1a2e;" class="text-primary">
            {subject}
        </h1>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #1e3a5f, #3a7cb8); border-radius: 2px; margin-bottom: 24px;"></div>

        <p style="margin: 0 0 20px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Dear <strong style="color: #1a1a2e;">{tenant_name}</strong>,
        </p>

        <div style="margin: 0 0 28px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            {body}
        </div>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                        Best regards,<br>
                        <strong style="color: #1a1a2e;">{landlord_name}</strong><br>
                        <span style="font-size: 12px; color: #adb5bd;">via Acres Property Management</span>
                    </p>
                </td>
            </tr>
        </table>
    """
    return _base_layout(content, preview_text=f"Message from {landlord_name}: {subject}")


# ─── 2. Overdue Rent Reminder Template ────────────────────────────────────────

def overdue_reminder_template(
    tenant_name: str,
    amount_due: str = "",
    due_date: str = "",
) -> str:
    """Automated overdue rent reminder sent by the scheduler.

    Resend Dashboard variables:
        {{{TENANT_NAME}}}   — Tenant's name
        {{{AMOUNT_DUE}}}    — Outstanding amount (optional)
        {{{DUE_DATE}}}      — Original due date (optional)
    """
    amount_section = ""
    if amount_due:
        amount_section = f"""
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
            <tr>
                <td style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); border-radius: 10px; padding: 24px; border-left: 4px solid #f57c00;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td>
                                <span style="font-size: 12px; color: #e65100; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Amount Due</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 4px;">
                                <span style="font-size: 28px; font-weight: 800; color: #e65100;">{amount_due}</span>
                            </td>
                        </tr>
                        {"<tr><td style='padding-top: 4px;'><span style='font-size: 13px; color: #bf360c;'>Originally due: " + due_date + "</span></td></tr>" if due_date else ""}
                    </table>
                </td>
            </tr>
        </table>
        """

    content = f"""
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #fff3e0; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 24px;">
                ⏰
            </div>
        </div>

        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #1a1a2e; text-align: center;" class="text-primary">
            Rent Payment Reminder
        </h1>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #f57c00, #ff9800); border-radius: 2px; margin: 0 auto 24px auto;"></div>

        <p style="margin: 0 0 16px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Dear <strong style="color: #1a1a2e;">{tenant_name}</strong>,
        </p>

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            This is a friendly reminder that your rent payment is currently <strong style="color: #e65100;">overdue</strong>. Please arrange payment at your earliest convenience to avoid any additional late fees.
        </p>

        {amount_section}

        <p style="margin: 0 0 24px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            If you have already made the payment, please disregard this notice. For any questions or payment arrangements, please contact your property manager directly.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                        Thank you,<br>
                        <strong style="color: #1a1a2e;">Acres Property Management</strong>
                    </p>
                </td>
            </tr>
        </table>
    """
    return _base_layout(content, preview_text=f"Rent reminder for {tenant_name}")


# ─── 3. Welcome Tenant Template ──────────────────────────────────────────────

def welcome_tenant_template(
    tenant_name: str,
    property_name: str = "",
    unit_number: str = "",
) -> str:
    """Welcome email for newly onboarded tenants.

    Resend Dashboard variables:
        {{{TENANT_NAME}}}    — Tenant's name
        {{{PROPERTY_NAME}}}  — Property they are assigned to
        {{{UNIT_NUMBER}}}    — Their unit identifier
    """
    property_details = ""
    if property_name or unit_number:
        property_details = f"""
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
            <tr>
                <td style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 10px; padding: 24px; border-left: 4px solid #1e88e5;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td>
                                <span style="font-size: 12px; color: #1565c0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Your Assignment</span>
                            </td>
                        </tr>
                        {"<tr><td style='padding-top: 8px;'><span style='font-size: 14px; color: #1a1a2e;'>🏢 <strong>" + property_name + "</strong></span></td></tr>" if property_name else ""}
                        {"<tr><td style='padding-top: 4px;'><span style='font-size: 14px; color: #1a1a2e;'>🔑 Unit <strong>" + unit_number + "</strong></span></td></tr>" if unit_number else ""}
                    </table>
                </td>
            </tr>
        </table>
        """

    content = f"""
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #e3f2fd; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 24px;">
                🎉
            </div>
        </div>

        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #1a1a2e; text-align: center;" class="text-primary">
            Welcome to Acres!
        </h1>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #1e3a5f, #3a7cb8); border-radius: 2px; margin: 0 auto 24px auto;"></div>

        <p style="margin: 0 0 16px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Dear <strong style="color: #1a1a2e;">{tenant_name}</strong>,
        </p>

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Welcome aboard! You have been registered on the <strong>Acres</strong> property management platform. Your property manager will use this system to coordinate maintenance requests, communicate important updates, and manage your tenancy.
        </p>

        {property_details}

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            <strong>What to expect:</strong>
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Receive important communications directly from your property manager</td>
            </tr>
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Get timely reminders about upcoming rent payments</td>
            </tr>
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Stay updated on maintenance ticket progress</td>
            </tr>
        </table>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                        Looking forward to a great tenancy,<br>
                        <strong style="color: #1a1a2e;">The Acres Team</strong>
                    </p>
                </td>
            </tr>
        </table>
    """
    return _base_layout(content, preview_text=f"Welcome to Acres, {tenant_name}!")


# ─── 4. Maintenance Update Template ──────────────────────────────────────────

def maintenance_update_template(
    tenant_name: str,
    ticket_title: str,
    status: str,
    notes: str = "",
) -> str:
    """Notification when a maintenance ticket status changes.

    Resend Dashboard variables:
        {{{TENANT_NAME}}}    — Tenant's name
        {{{TICKET_TITLE}}}   — Title of the maintenance ticket
        {{{STATUS}}}         — New status (e.g. 'Resolved', 'In Progress')
        {{{NOTES}}}          — Optional update notes
    """
    # Status badge color mapping
    status_colors = {
        "open": ("#e3f2fd", "#1565c0"),
        "in progress": ("#fff3e0", "#e65100"),
        "resolved": ("#e8f5e9", "#2e7d32"),
        "closed": ("#f3e5f5", "#6a1b9a"),
    }
    bg_color, text_color = status_colors.get(status.lower(), ("#f5f5f5", "#424242"))

    notes_section = ""
    if notes:
        notes_section = f"""
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0 0 0;">
            <tr>
                <td style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; border-left: 3px solid #dee2e6;">
                    <span style="font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Update Notes</span>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #495057; line-height: 1.6;">{notes}</p>
                </td>
            </tr>
        </table>
        """

    content = f"""
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #f5f5f5; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 24px;">
                🔧
            </div>
        </div>

        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #1a1a2e; text-align: center;" class="text-primary">
            Maintenance Ticket Update
        </h1>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #1e3a5f, #3a7cb8); border-radius: 2px; margin: 0 auto 24px auto;"></div>

        <p style="margin: 0 0 20px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Dear <strong style="color: #1a1a2e;">{tenant_name}</strong>,
        </p>

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            There has been an update to your maintenance request:
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
            <tr>
                <td style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; border: 1px solid #e9ecef;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td style="padding-bottom: 12px;">
                                <span style="font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Ticket</span><br>
                                <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">{ticket_title}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span style="font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Status</span><br>
                                <span style="display: inline-block; margin-top: 4px; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; background-color: {bg_color}; color: {text_color}; text-transform: uppercase; letter-spacing: 0.5px;">
                                    {status}
                                </span>
                            </td>
                        </tr>
                    </table>
                    {notes_section}
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 24px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            If you have any questions about this update, please reach out to your property manager.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                        Thank you,<br>
                        <strong style="color: #1a1a2e;">Acres Property Management</strong>
                    </p>
                </td>
            </tr>
        </table>
    """
    return _base_layout(content, preview_text=f"Maintenance update: {ticket_title} — {status}")


# ─── 5. Welcome New User (Sign-Up) Template ──────────────────────────────────

def welcome_user_template(
    user_name: str,
) -> str:
    """Welcome email for new platform sign-ups (landlords / property managers).

    Sent automatically after first-time Google OAuth sign-in.

    Resend Dashboard variables:
        {{{USER_NAME}}}  — The user's display name from Google
    """
    first_name = user_name.split()[0] if user_name else "there"

    content = f"""
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #e3f2fd; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 24px;">
                🏠
            </div>
        </div>

        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #1a1a2e; text-align: center;" class="text-primary">
            Welcome to Acres, {first_name}!
        </h1>
        <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #1e3a5f, #3a7cb8); border-radius: 2px; margin: 0 auto 24px auto;"></div>

        <p style="margin: 0 0 16px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Hi <strong style="color: #1a1a2e;">{user_name}</strong>,
        </p>

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            Thank you for signing up for <strong>Acres</strong> — the modern property management platform built to simplify your operations. Your account is ready and your <strong>30-day free trial</strong> starts now.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
            <tr>
                <td style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 10px; padding: 24px; border-left: 4px solid #1e88e5;">
                    <span style="font-size: 12px; color: #1565c0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Here's how to get started</span>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 12px;">
                        <tr>
                            <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">1️⃣</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #1a1a2e; line-height: 1.6;"><strong>Add your first property</strong> — give it a name and address</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">2️⃣</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #1a1a2e; line-height: 1.6;"><strong>Create units</strong> — define rooms, floors, or spaces within your property</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">3️⃣</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #1a1a2e; line-height: 1.6;"><strong>Onboard tenants</strong> — add tenants and start tracking rent & communications</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 8px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            <strong>What's included in your trial:</strong>
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Unlimited properties and units</td>
            </tr>
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Tenant communications via email & SMS</td>
            </tr>
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Smart maintenance ticketing with QR codes</td>
            </tr>
            <tr>
                <td style="padding: 6px 12px 6px 0; vertical-align: top; font-size: 14px;">✅</td>
                <td style="padding: 6px 0; font-size: 14px; color: #495057; line-height: 1.6;">Full analytics and accounting reports</td>
            </tr>
        </table>

        <p style="margin: 0 0 24px 0; font-size: 15px; color: #495057; line-height: 1.7;" class="text-secondary">
            If you have any questions or need help getting set up, just reply to this email — we're here to help.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                        Welcome aboard,<br>
                        <strong style="color: #1a1a2e;">The Acres Team</strong>
                    </p>
                </td>
            </tr>
        </table>
    """
    return _base_layout(content, preview_text=f"Welcome to Acres, {first_name}! Your 30-day free trial starts now.")
