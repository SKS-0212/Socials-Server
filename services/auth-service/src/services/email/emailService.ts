import nodemailer from 'nodemailer';
import { config } from '../../config/index';
import { logger } from '../../utils/logger';

/**
 * Email Service to handle sending emails using nodemailer
 */
class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASSWORD,
            },
        });
    }

    /**
     * Send an email
     * @param to - Recipient email address
     * @param subject - Email subject
     * @param text - Plain text content
     * @param html - HTML content (optional)
     * @returns Promise resolving to send info
     */
    async sendEmail(to: string, subject: string, text: string, html?: string) {
        try {
            const mailOptions = {
                from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM_ADDRESS}>`,
                to,
                subject,
                text,
                html: html || text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${to}: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Send an OTP email for verification
     * @param to - Recipient email address
     * @param otp - One-time password to send
     * @returns Promise resolving to send info
     */
    async sendOTPEmail(to: string, otp: string) {
        const subject = 'Your Verification Code';
        const text = `Your verification code is: ${otp}. This code will expire in 1 minute.`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verification Code</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 36px; background-color: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in <strong>1 minute</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;

        return this.sendEmail(to, subject, text, html);
    }
}

// Export a singleton instance
export const emailService = new EmailService();
