/**
 * Beautiful HTML email template for contact form submissions.
 * Inline styles only for maximum email client compatibility.
 */

const BRAND = {
  primary: "#1E3A5F",
  secondary: "#2A9D8F",
  cream: "#FDFBF7",
  charcoal: "#2D2D2D",
  softCharcoal: "#5C5C5C",
};

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export function getContactEmailHtml(data: ContactEmailData): string {
  const { name, email, phone, message } = data;
  const formattedMessage = escapeHtml(message).replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message - RJ Studio</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.12);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%); padding: 36px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.9); margin-bottom: 8px;">Contact</span>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">RJ Studio</h1>
                    <p style="margin: 12px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.85);">Nouveau message depuis le site</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 36px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Name -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.cream}; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Nom</p>
                          <p style="margin: 0; font-size: 17px; font-weight: 600; color: ${BRAND.charcoal};">${escapeHtml(name)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Email -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.cream}; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Email</p>
                          <p style="margin: 0; font-size: 17px; font-weight: 600; color: ${BRAND.primary};"><a href="mailto:${escapeHtml(email)}" style="color: ${BRAND.primary}; text-decoration: none;">${escapeHtml(email)}</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                ${phone ? `
                <!-- Phone -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.cream}; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Téléphone</p>
                          <p style="margin: 0; font-size: 17px; font-weight: 600; color: ${BRAND.charcoal};"><a href="tel:${escapeHtml(phone)}" style="color: ${BRAND.charcoal}; text-decoration: none;">${escapeHtml(phone)}</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
                
                <!-- Message -->
                <tr>
                  <td style="padding-bottom: 8px;">
                    <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.softCharcoal};">Message</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.cream}; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.65; color: ${BRAND.charcoal};">${formattedMessage}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; background-color: ${BRAND.cream}; border-top: 1px solid rgba(0,0,0,0.06); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND.softCharcoal};">
                Envoyé depuis le formulaire de contact · RJ Studio · Rue Biranzarane, Casablanca
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}
