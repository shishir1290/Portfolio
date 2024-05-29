import nodemailer from 'nodemailer';

export default async (req: any, res: any) => {
  if (req.method === 'POST') {
    const { name, email, subject, message } = req.body;

    // Validate input data
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content with better formatting
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // Your email address
      subject: `New Contact Form Submission: ${subject}`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #0056b3; text-decoration: none;">${email}</a></p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <div style="padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 5px;">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
      `,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
