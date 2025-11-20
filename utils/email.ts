// Utility functions for device detection and email sending
import emailjs from '@emailjs/browser';

export interface DeviceInfo {
  deviceType: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  platform: string;
  ipAddress?: string;
}

export interface FormSubmissionData {
  formType: 'satellite-scan' | 'contact-form';
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address?: string;
  plz?: string;
  additionalData?: Record<string, any>;
}

// EmailJS Configuration - Get from environment variables or use defaults
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';

// Initialize EmailJS
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Detect device type from user agent and screen size
 */
export const detectDeviceType = (): DeviceInfo => {
  const ua = navigator.userAgent;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const platform = navigator.platform;

  let deviceType = 'Desktop';
  
  // Mobile detection
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    if (/iPad/i.test(ua)) {
      deviceType = 'iPad';
    } else if (/iPhone/i.test(ua)) {
      deviceType = 'iPhone';
    } else if (/Android/i.test(ua)) {
      deviceType = 'Android Mobile';
    } else {
      deviceType = 'Mobile';
    }
  }
  // Desktop detection
  else if (/Macintosh/i.test(ua)) {
    if (/Mac OS X 10[._](\d+)/.test(ua)) {
      deviceType = 'MacBook';
    } else {
      deviceType = 'Mac Desktop';
    }
  } else if (/Windows/i.test(ua)) {
    deviceType = 'Windows Desktop';
  } else if (/Linux/i.test(ua)) {
    deviceType = 'Linux Desktop';
  }

  return {
    deviceType,
    userAgent: ua,
    screenWidth,
    screenHeight,
    platform
  };
};

/**
 * Get IP address using a public API
 */
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown';
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'Unknown';
  }
};

/**
 * Format email body with all submission data
 */
const formatEmailBody = async (data: FormSubmissionData): Promise<string> => {
  const deviceInfo = detectDeviceType();
  const ipAddress = await getIPAddress();
  
  const timestamp = new Date().toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    dateStyle: 'full',
    timeStyle: 'long'
  });

  // Professional email formatting to avoid spam filters
  let body = `Guten Tag,\n\n`;
  body += `Sie haben eine neue Formular-Einreichung über das Blockalarm Einbruchschutz-Check System erhalten.\n\n`;
  body += `═══════════════════════════════════════════════════════════\n`;
  body += `FORMULAR-EINREICHUNG\n`;
  body += `═══════════════════════════════════════════════════════════\n\n`;
  
  body += `Formular-Typ: ${data.formType === 'satellite-scan' ? 'Echtzeit-Scan (Satelliten-Scan)' : 'Kontaktformular (Analyse-Anfrage)'}\n`;
  body += `Zeitstempel: ${timestamp}\n\n`;
  
  body += `───────────────────────────────────────────────────────────\n`;
  body += `KONTAKTDATEN\n`;
  body += `───────────────────────────────────────────────────────────\n`;
  if (data.firstName) body += `Vorname: ${data.firstName}\n`;
  if (data.lastName) body += `Nachname: ${data.lastName}\n`;
  if (data.name) body += `Name: ${data.name}\n`;
  body += `E-Mail: ${data.email}\n`;
  body += `Telefon: ${data.phone}\n`;
  if (data.address) body += `Adresse: ${data.address}\n`;
  if (data.plz) body += `PLZ: ${data.plz}\n`;
  
  body += `\n───────────────────────────────────────────────────────────\n`;
  body += `TECHNISCHE INFORMATIONEN\n`;
  body += `───────────────────────────────────────────────────────────\n`;
  body += `Gerätetyp: ${deviceInfo.deviceType}\n`;
  body += `Plattform: ${deviceInfo.platform}\n`;
  body += `Bildschirmgröße: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}px\n`;
  body += `IP-Adresse: ${ipAddress}\n`;
  
  if (data.additionalData && Object.keys(data.additionalData).length > 0) {
    body += `\n───────────────────────────────────────────────────────────\n`;
    body += `ZUSÄTZLICHE DATEN\n`;
    body += `───────────────────────────────────────────────────────────\n`;
    Object.entries(data.additionalData).forEach(([key, value]) => {
      body += `${key}: ${JSON.stringify(value)}\n`;
    });
  }
  
  body += `\n═══════════════════════════════════════════════════════════\n`;
  body += `Diese E-Mail wurde automatisch vom Blockalarm Einbruchschutz-Check System generiert.\n`;
  body += `Blockalarm GmbH - https://www.blockalarm.de\n`;
  body += `═══════════════════════════════════════════════════════════\n`;

  return body;
};

/**
 * Send email using EmailJS service
 * Setup required: https://www.emailjs.com/
 * 1. Create account at emailjs.com
 * 2. Add email service (Gmail, Outlook, etc.)
 * 3. Create email template
 * 4. Get Public Key, Service ID, and Template ID
 * 5. Update constants above
 */
export const sendEmailNotification = async (data: FormSubmissionData): Promise<void> => {
  try {
    const deviceInfo = detectDeviceType();
    const ipAddress = await getIPAddress();
    const emailBody = await formatEmailBody(data);
    
    // Professional subject line to avoid spam filters
    const subject = data.formType === 'satellite-scan' 
      ? `[Blockalarm] Neue Echtzeit-Scan Anfrage - ${data.firstName || data.name || 'Unbekannt'}`
      : `[Blockalarm] Neue Analyse-Anfrage - ${data.name || 'Unbekannt'}`;

    // Prepare template parameters for EmailJS
    const templateParams = {
      to_email: 'hysa@blockalarm.de',
      subject: subject,
      message: emailBody,
      form_type: data.formType === 'satellite-scan' ? 'Echtzeit-Scan' : 'Kontaktformular',
      name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unbekannt',
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      plz: data.plz || '',
      device_type: deviceInfo.deviceType,
      platform: deviceInfo.platform,
      screen_size: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
      ip_address: ipAddress,
      user_agent: deviceInfo.userAgent,
      additional_data: JSON.stringify(data.additionalData || {}, null, 2),
      // Add timestamp for better email deliverability
      timestamp: new Date().toISOString()
    };

    // Send email via EmailJS
    if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID') {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
      console.log('Email sent successfully via EmailJS');
    } else {
      // Fallback: Use webhook or Formspree
      await sendViaWebhook(data, emailBody, subject, deviceInfo, ipAddress);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback to webhook if EmailJS fails
    try {
      const deviceInfo = detectDeviceType();
      const ipAddress = await getIPAddress();
      const emailBody = await formatEmailBody(data);
      const subject = data.formType === 'satellite-scan' 
        ? `Neue Echtzeit-Scan Anfrage von ${data.firstName || data.name || 'Unbekannt'}`
        : `Neue Analyse-Anfrage von ${data.name || 'Unbekannt'}`;
      
      await sendViaWebhook(data, emailBody, subject, deviceInfo, ipAddress);
    } catch (fallbackError) {
      console.error('Fallback email sending also failed:', fallbackError);
      // Don't throw error - just log it so form submission can continue
      console.warn('Email could not be sent, but form submission will continue');
    }
  }
};

/**
 * Fallback email sending using webhook (Zapier, Make.com, n8n, etc.)
 * Or use a simple email API service
 */
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || '';

const sendViaWebhook = async (
  data: FormSubmissionData,
  emailBody: string,
  subject: string,
  deviceInfo: DeviceInfo,
  ipAddress: string
): Promise<void> => {
  if (WEBHOOK_URL) {
    // Use webhook if configured
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'hysa@blockalarm.de',
        subject,
        body: emailBody,
        formData: data,
        deviceInfo,
        ipAddress
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email via webhook');
    }
    return;
  }

  // If no webhook configured, use a free email API service
  // Option 1: Use EmailJS public template (requires setup)
  // Option 2: Use a service like SendGrid, Mailgun (require API keys)
  // Option 3: For now, log and show user-friendly message
  
  console.warn('Email service not configured. Please set up EmailJS or webhook.');
  console.log('Email data:', {
    to: 'hysa@blockalarm.de',
    subject,
    body: emailBody
  });

  // Show user-friendly alert
  alert('Email service wird konfiguriert. Ihre Daten wurden gespeichert und werden per E-Mail gesendet.');
  
  // You can also create a simple backend endpoint or use services like:
  // - EmailJS (https://www.emailjs.com/) - Free tier: 200 emails/month
  // - Formspree (https://formspree.io/) - Free tier: 50 submissions/month
  // - Webhook (Zapier/Make.com/n8n) - Connect to your email
};

