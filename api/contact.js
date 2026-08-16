const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use POST."
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

    // -----------------------------
    // HONEYPOT SPAM PROTECTION
    // -----------------------------

    if (website) {
      return res.status(200).json({
        success: true,
        message: "Message sent successfully."
      });
    }

    // -----------------------------
    // REQUIRED FIELD VALIDATION
    // -----------------------------

    if (!firstName || !lastName || !email || !projectType) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });
    }

    // -----------------------------
    // EMAIL VALIDATION
    // -----------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // -----------------------------
    // SMTP TRANSPORTER
    // -----------------------------

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    // -----------------------------
    // CLEAN DATA
    // -----------------------------

    const cleanFirstName = String(firstName).trim();
    const cleanLastName = String(lastName).trim();
    const cleanEmail = String(email).trim();
    const cleanCompany = String(company || "").trim();
    const cleanProjectType = String(projectType).trim();
    const cleanDetail = String(detail || "").trim();

    const fullName = `${cleanFirstName} ${cleanLastName}`;

    // -----------------------------
    // SEND EMAIL
    // -----------------------------

    await transporter.sendMail({
      from: `"Themed Edits Website" <${process.env.EMAIL_USER}>`,

      to: process.env.EMAIL_TO,

      replyTo: cleanEmail,

      subject: `New Project Inquiry — ${fullName}`,

      text: `
NEW PROJECT INQUIRY
===================

Name:
${fullName}

Email:
${cleanEmail}

Company / Brand:
${cleanCompany || "Not provided"}

Project Type:
${cleanProjectType}

Project Detail:
${cleanDetail || "Not provided"}

===================

Submitted from:
https://themededits.vercel.app/hire/
      `.trim(),

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:650px;
          margin:0 auto;
          color:#222;
          line-height:1.6;
        ">

          <h2 style="margin-bottom:5px;">
            New Project Inquiry
          </h2>

          <p style="color:#666;margin-top:0;">
            Submitted through Themed Edits
          </p>

          <hr style="
            border:0;
            border-top:1px solid #ddd;
            margin:25px 0;
          ">

          <table style="
            width:100%;
            border-collapse:collapse;
          ">

            <tr>
              <td style="
                padding:10px 0;
                font-weight:bold;
                width:180px;
              ">
                Name
              </td>

              <td style="padding:10px 0;">
                ${escapeHtml(fullName)}
              </td>
            </tr>

            <tr>
              <td style="
                padding:10px 0;
                font-weight:bold;
              ">
                Email
              </td>

              <td style="padding:10px 0;">
                ${escapeHtml(cleanEmail)}
              </td>
            </tr>

            <tr>
              <td style="
                padding:10px 0;
                font-weight:bold;
              ">
                Company / Brand
              </td>

              <td style="padding:10px 0;">
                ${escapeHtml(cleanCompany || "Not provided")}
              </td>
            </tr>

            <tr>
              <td style="
                padding:10px 0;
                font-weight:bold;
              ">
                Project Type
              </td>

              <td style="padding:10px 0;">
                ${escapeHtml(cleanProjectType)}
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
            ${escapeHtml(cleanDetail || "Not provided")}
          </div>

          <p style="
            margin-top:30px;
            color:#888;
            font-size:13px;
          ">
            Submitted from
            <a href="https://themededits.vercel.app/hire/">
              Themed Edits Hire Page
            </a>
          </p>

        </div>
      `
    });

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Message sent successfully."
    });

  } catch (error) {

    console.error("FORM EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send the message right now."
    });
  }
};


// -----------------------------
// HTML ESCAPE
// -----------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}