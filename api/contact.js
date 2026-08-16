const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      company,
      projectType,
      detail,
      website
    } = req.body || {};

    // Honeypot spam protection
    if (website) {
      return res.status(200).json({
        success: true,
        message: "Message sent successfully."
      });
    }

    // Basic validation
    if (!firstName || !lastName || !email || !projectType) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    await transporter.sendMail({
      from: `"Themed Edits Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email.trim(),

      subject: `New Project Inquiry — ${fullName}`,

      text: `
NEW PROJECT INQUIRY
===================

Name:
${fullName}

Email:
${email}

Company / Brand:
${company || "Not provided"}

Project Type:
${projectType}

Project Detail:
${detail || "Not provided"}

===================
Submitted from:
https://themededits.vercel.app/hire/
      `.trim(),

      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#222;line-height:1.6">

          <h2 style="margin-bottom:5px;">
            New Project Inquiry
          </h2>

          <p style="color:#666;margin-top:0;">
            Submitted through Themed Edits
          </p>

          <hr style="border:0;border-top:1px solid #ddd;margin:25px 0;">

          <table style="width:100%;border-collapse:collapse;">

            <tr>
              <td style="padding:10px 0;font-weight:bold;width:180px;">
                Name
              </td>
              <td style="padding:10px 0;">
                ${escapeHtml(fullName)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;font-weight:bold;">
                Email
              </td>
              <td style="padding:10px 0;">
                ${escapeHtml(email)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;font-weight:bold;">
                Company / Brand
              </td>
              <td style="padding:10px 0;">
                ${escapeHtml(company || "Not provided")}
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;font-weight:bold;">
                Project Type
              </td>
              <td style="padding:10px 0;">
                ${escapeHtml(projectType)}
              </td>
            </tr>

          </table>

          <h3 style="margin-top:30px;">
            Project Detail
          </h3>

          <div style="
            background:#f5f5f5;
            padding:18px;
            border-radius:8px;
            white-space:pre-wrap;
          ">
            ${escapeHtml(detail || "Not provided")}
          </div>

          <p style="margin-top:30px;color:#888;font-size:13px;">
            Submitted from
            <a href="https://themededits.vercel.app/hire/">
              Themed Edits Hire Page
            </a>
          </p>

        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully."
    });

  } catch (error) {

    console.error("FORM EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message."
    });
  }
}


// Prevent HTML injection inside the email
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}