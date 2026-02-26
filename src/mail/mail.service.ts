import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

type BrevoParams = Record<string, any>;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly apiKey = process.env.BREVO_API_KEY || '';
  private readonly fromEmail = process.env.MAIL_FROM || 'alexkolibjar@gmail.com';
  private readonly fromName = process.env.MAIL_FROM_NAME || 'Riders Forge';
  private readonly replyTo = process.env.MAIL_REPLY_TO || this.fromEmail;
  private readonly appUrl = process.env.APP_URL || 'http://localhost:3000';

  // Template IDs (podľa tvojho Brevo listu)
  private readonly templates = {
    PASSWORD_RESET: 1,
    ORDER_CONFIRMED: 2,
    ORDER_SHIPPED: 3,
    SUPPORT_AUTO_REPLY: 4,
  } as const;

  private readonly http: AxiosInstance;

  constructor() {
    if (!this.apiKey) {
      // nech to padne hneď pri štarte v produkcii, nie až pri posielaní
      this.logger.error('Missing BREVO_API_KEY env var');
    }

    this.http = axios.create({
      baseURL: 'https://api.brevo.com/v3',
      timeout: 15000,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': this.apiKey,
      },
    });
  }

  // --- Core sender ----------------------------------------------------------

  private async sendTemplateEmail(opts: {
    to: string;
    templateId: number;
    params?: BrevoParams;
    subject?: string; // voliteľné, ak chceš prepísať subject v template
  }) {
    if (!this.apiKey) throw new Error('Missing BREVO_API_KEY env var');

    const payload = {
      sender: { email: this.fromEmail, name: this.fromName },
      to: [{ email: opts.to }],
      replyTo: { email: this.replyTo, name: this.fromName },
      templateId: opts.templateId,
      params: opts.params || {},
      // subject sa dá poslať, ale väčšinou je lepšie mať subject priamo v template
      ...(opts.subject ? { subject: opts.subject } : {}),
    };

    try {
      const res = await this.http.post('/smtp/email', payload);
      return res.data; // napr. { messageId: '...' }
    } catch (err: any) {
      // Ne-loguj apiKey ani celé headers/payload!
      const status = err?.response?.status;
      const data = err?.response?.data;

      this.logger.error(
        `Brevo send failed (templateId=${opts.templateId}, to=${opts.to}) status=${status} data=${JSON.stringify(
          data,
        )}`,
      );

      throw err;
    }
  }

  // --- Public helpers -------------------------------------------------------

  async sendPasswordReset(to: string, data: { firstName?: string; resetToken: string }) {
    const resetUrl = `${this.appUrl}/reset-password?token=${encodeURIComponent(data.resetToken)}`;

    return this.sendTemplateEmail({
      to,
      templateId: this.templates.PASSWORD_RESET,
      params: {
        firstName: data.firstName || '',
        resetUrl,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendOrderConfirmation(
    to: string,
    data: {
      firstName?: string;
      orderNumber: string;
      total: string; // napr. "59,90 €"
      itemsCount?: number;
      deliveryAddress?: string;
      orderUrl?: string;
    },
  ) {
    return this.sendTemplateEmail({
      to,
      templateId: this.templates.ORDER_CONFIRMED,
      params: {
        firstName: data.firstName || '',
        orderNumber: data.orderNumber,
        total: data.total,
        itemsCount: data.itemsCount ?? '',
        deliveryAddress: data.deliveryAddress ?? '',
        orderUrl: data.orderUrl ?? `${this.appUrl}/orders/${encodeURIComponent(data.orderNumber)}`,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendOrderShipped(
    to: string,
    data: {
      firstName?: string;
      orderNumber: string;
      trackingUrl?: string;
      carrier?: string;
      eta?: string; // napr. "2–3 dni"
    },
  ) {
    return this.sendTemplateEmail({
      to,
      templateId: this.templates.ORDER_SHIPPED,
      params: {
        firstName: data.firstName || '',
        orderNumber: data.orderNumber,
        trackingUrl: data.trackingUrl ?? '',
        carrier: data.carrier ?? '',
        eta: data.eta ?? '',
        year: new Date().getFullYear(),
      },
    });
  }

  async sendSupportAutoReply(
    to: string,
    data: {
      firstName?: string;
      ticketId?: string;
      messagePreview?: string;
      supportUrl?: string;
    },
  ) {
    return this.sendTemplateEmail({
      to,
      templateId: this.templates.SUPPORT_AUTO_REPLY,
      params: {
        firstName: data.firstName || '',
        ticketId: data.ticketId ?? '',
        messagePreview: data.messagePreview ?? '',
        supportUrl: data.supportUrl ?? `${this.appUrl}/support`,
        year: new Date().getFullYear(),
      },
    });
  }

  // voliteľne: jednoduchý ping/test (napr. pre /mail/test endpoint)
  async sendTest(to: string) {
    return this.sendTemplateEmail({
      to,
      templateId: this.templates.SUPPORT_AUTO_REPLY, // alebo sprav vlastný test template
      params: { firstName: 'Alex', ticketId: 'TEST-123', year: new Date().getFullYear() },
      subject: 'Riders Forge - Test',
    });
  }
}