# Email Setup Guide

This app uses EmailJS to send form submissions to hysa@blockalarm.de. Follow these steps to configure:

## Option 1: EmailJS (Recommended - Free)

1. **Create EmailJS Account**
   - Go to https://www.emailjs.com/
   - Sign up for a free account (200 emails/month free)

2. **Add Email Service**
   - Go to "Email Services" in dashboard
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Note your **Service ID**

3. **Create Email Template**
   - Go to "Email Templates" in dashboard
   - Click "Create New Template"
   - Use this template:
   
   ```
   Subject: {{subject}}
   
   {{message}}
   ```
   
   - Set "To Email" to: `hysa@blockalarm.de`
   - Note your **Template ID**

4. **Get Public Key**
   - Go to "Account" → "General"
   - Copy your **Public Key**

5. **Add to .env.local**
   
   Add these lines to your `.env.local` file:
   
   ```
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   ```

6. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Option 2: Webhook (Alternative)

If you prefer using Zapier, Make.com, or n8n:

1. Create a webhook in your automation platform
2. Add to `.env.local`:
   ```
   VITE_WEBHOOK_URL=https://your-webhook-url.com/endpoint
   ```

## Option 3: Backend API

For production, create a backend endpoint that sends emails using:
- Node.js with Nodemailer
- PHP with PHPMailer
- Python with smtplib
- Or any other email service

Then update `utils/email.ts` to call your API endpoint instead.

## Testing

After setup, test by submitting a form. Check your email inbox at hysa@blockalarm.de for the submission.

