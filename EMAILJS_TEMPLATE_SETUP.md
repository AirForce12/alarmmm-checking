# EmailJS Template Setup - Quick Guide

Your EmailJS credentials are already configured! You just need to create the email template.

## Step 1: Create Email Template

1. Go to https://dashboard.emailjs.com/admin/template
2. Click **"Create New Template"**
3. Use these settings:

### Template Settings:
- **Template Name**: Blockalarm Form Submissions
- **To Email**: `hysa@blockalarm.de`
- **From Name**: `{{form_type}}`
- **Subject**: `{{subject}}`

### Template Content:
```
=== NEUE FORMULAR-EINREICHUNG ===

Formular-Typ: {{form_type}}
Zeitstempel: {{timestamp}}

=== KONTAKTDATEN ===
Name: {{name}}
E-Mail: {{email}}
Telefon: {{phone}}
{{#address}}Adresse: {{address}}{{/address}}
{{#plz}}PLZ: {{plz}}{{/plz}}

=== TECHNISCHE INFORMATIONEN ===
Gerätetyp: {{device_type}}
Plattform: {{platform}}
Bildschirmgröße: {{screen_size}}
IP-Adresse: {{ip_address}}

=== VOLLSTÄNDIGE NACHRICHT ===
{{message}}

---
Diese E-Mail wurde automatisch vom Blockalarm Einbruchschutz-Check System generiert.
```

**OR** use the simple version (recommended):
```
Subject: {{subject}}

{{message}}
```

4. Click **"Save"**
5. Copy the **Template ID** (it will look like `template_xxxxxxx`)

## Step 2: Update .env.local

Add the Template ID to your `.env.local` file:

```
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
```

Replace `template_xxxxxxx` with your actual Template ID.

## Step 3: Restart Dev Server

```bash
npm run dev
```

## Testing

After setup, test by submitting a form. You should receive emails at hysa@blockalarm.de!

## Note

The template variables that will be sent:
- `subject` - Email subject
- `message` - Full formatted email body
- `form_type` - "Echtzeit-Scan" or "Kontaktformular"
- `name` - User's name
- `email` - User's email
- `phone` - User's phone
- `address` - Address (if provided)
- `plz` - Postal code (if provided)
- `device_type` - Device type detected
- `platform` - Platform info
- `screen_size` - Screen dimensions
- `ip_address` - User's IP address

