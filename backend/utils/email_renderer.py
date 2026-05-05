"""
Loads pre-compiled React Email HTML templates and substitutes variables.

Templates live in emails/dist/ as static .html files with {{PLACEHOLDER}}
markers. This module reads them and does a simple string replacement so
the backend can pass the result straight to Resend.

Usage:
    from backend.utils.email_renderer import render_email

    html = render_email("WelcomeLandlord", USER_NAME="John Doe")
"""

import os
import re

TEMPLATES_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "emails", "dist"
)

_cache: dict[str, str] = {}


def render_email(template_name: str, **variables: str) -> str:
    """Load a compiled HTML template and replace {{PLACEHOLDER}} variables.

    Args:
        template_name: Name of the template file (without .html extension).
                       Must match one of the files in emails/dist/.
        **variables:   Keyword arguments where the key matches the placeholder
                       name. For example, USER_NAME="Jane" replaces every
                       occurrence of {{USER_NAME}} in the template.

    Returns:
        The final HTML string ready to be sent via Resend.
    """
    if template_name not in _cache:
        path = os.path.join(TEMPLATES_DIR, f"{template_name}.html")
        with open(path, "r", encoding="utf-8") as f:
            _cache[template_name] = f.read()

    html = _cache[template_name]

    for key, value in variables.items():
        html = html.replace("{{" + key + "}}", value)

    return html
