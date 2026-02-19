import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
})

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject: 'Verify your BRI HR Portal account',
    text: `Verify your email: ${url}`,
    html: `<p>Click <a href="${url}">here</a> to verify your email. Link expires in 24 hours.</p>`,
    headers: {
      'X-SMTPAPI': JSON.stringify({
        filters: { clicktrack: { settings: { enable: 0 } } },
      }),
    },
  })
}
