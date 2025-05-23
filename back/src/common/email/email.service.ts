import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Increased timeout values
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      this.logger.debug('Verifying SMTP connection...');
      await this.transporter.verify();
      this.logger.log('SMTP server is ready to take our messages');
    } catch (error) {
      this.logger.error('SMTP connection verification failed:', error);
      // If verification fails, try to reinitialize after a delay
      setTimeout(() => this.initializeTransporter(), 5000);
    }
  }

  private async sendWithRetry(mailOptions: nodemailer.SendMailOptions): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${this.maxRetries} to send email`);
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email sent successfully on attempt ${attempt}: ${info.messageId}`);
        return info;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          this.logger.debug(`Waiting ${this.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          
          // If it's a connection error, try to reinitialize the transporter
          if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            this.logger.debug('Connection error detected, reinitializing transporter...');
            this.initializeTransporter();
          }
        }
      }
    }
    
    throw lastError;
  }

  async sendPaymentStatusEmail(
    to: string,
    orderId: string,
    pnrNo: string,
    status: 'ODENDI' | 'ODENECEK' | 'IADE_EDILDI',
    amount: number,
  ) {
    const statusText = {
      ODENDI: 'Ödendi',
      ODENECEK: 'Ödeme Bekleniyor',
      IADE_EDILDI: 'İade Edildi',
    }[status];

    const subject = `Sipariş Ödeme Durumu Güncellendi - ${pnrNo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sipariş Ödeme Durumu Güncellendi</h2>
        <p>Sayın Müşterimiz,</p>
        <p>${pnrNo} numaralı siparişinizin ödeme durumu güncellenmiştir.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Sipariş Numarası:</strong> ${pnrNo}</p>
          <p><strong>Yeni Durum:</strong> ${statusText}</p>
          <p><strong>Tutar:</strong> ${amount.toLocaleString('tr-TR')} TL</p>
        </div>
        <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
        <p>Saygılarımızla,<br>Çekgetir Ekibi</p>
      </div>
    `;

    try {
      this.logger.debug(`Attempting to send payment status email to ${to}`);
      const info = await this.sendWithRetry({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      this.logger.error('Email gönderimi sırasında hata:', error);
      throw error;
    }
  }

  async sendOrderStatusEmail(
    to: string,
    orderId: string,
    pnrNo: string,
    status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    serviceType: string,
  ) {
    const statusText = {
      PENDING: 'Beklemede',
      ACCEPTED: 'Onaylandı',
      IN_PROGRESS: 'İşlemde',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
    }[status];

    const serviceTypeText = {
      YOL_YARDIM: 'Yol Yardım',
      OZEL_CEKICI: 'Özel Çekici',
      TOPLU_CEKICI: 'Toplu Çekici',
    }[serviceType] || serviceType;

    const subject = `Sipariş Durumu Güncellendi - ${pnrNo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sipariş Durumu Güncellendi</h2>
        <p>Sayın Müşterimiz,</p>
        <p>${pnrNo} numaralı siparişinizin durumu güncellenmiştir.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Sipariş Numarası:</strong> ${pnrNo}</p>
          <p><strong>Hizmet Türü:</strong> ${serviceTypeText}</p>
          <p><strong>Yeni Durum:</strong> ${statusText}</p>
        </div>
        <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
        <p>Saygılarımızla,<br>Çekgetir Ekibi</p>
      </div>
    `;

    try {
      this.logger.debug(`Attempting to send order status email to ${to}`);
      const info = await this.sendWithRetry({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      this.logger.error('Email gönderimi sırasında hata:', error);
      throw error;
    }
  }
} 