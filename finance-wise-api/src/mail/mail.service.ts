import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendPasswordResetEmail(email: string, token: string) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Finance Wise - Recuperação de Senha',
      text: `Clique no link abaixo para redefinir sua senha: ${process.env.CLIENT_URL}/reset-password/${token}`,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
