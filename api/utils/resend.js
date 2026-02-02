import { Resend } from 'resend';

let resend = null;

/**
 * Initialize Resend client
 */
export const initializeResend = () => {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

/**
 * Send plain-text email via Resend
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email content
 * @returns {Promise<object>} Send result
 */
export const sendEmail = async (to, subject, text) => {
  const client = initializeResend();
  
  try {
    const result = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      text, // Plain text only, as per SRS
    });
    return result;
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Send bulk emails (for announcements)
 * @param {string[]} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email content
 * @returns {Promise<object[]>} Array of send results
 */
export const sendBulkEmails = async (recipients, subject, text) => {
  const client = initializeResend();
  
  try {
    const promises = recipients.map(to =>
      client.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to,
        subject,
        text,
      })
    );
    
    const results = await Promise.allSettled(promises);
    return results;
  } catch (error) {
    throw new Error(`Bulk email sending failed: ${error.message}`);
  }
};

export default resend;
