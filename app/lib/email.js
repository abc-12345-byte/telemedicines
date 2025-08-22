import sgMail from '@sendgrid/mail';


// Initialize SendGrid with API key only if it exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendWelcomeEmail(to, userData) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping welcome email');
    return { success: true, skipped: true };
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@mediconnect.com',
    subject: 'Welcome to MediConnect Professional!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MediConnect Professional!</h2>
        <p>Hello ${userData.firstName},</p>
        <p>Thank you for joining MediConnect Professional, the enterprise-grade telemedicine platform.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Getting Started:</h3>
          <ol>
            <li>Complete your profile setup</li>
            <li>Choose your role (Doctor, Patient, or Admin)</li>
            <li>Start using our professional features</li>
          </ol>
        </div>
        
        <p>Our platform offers:</p>
        <ul>
          <li>🔒 HIPAA-compliant video consultations</li>
          <li>📋 Electronic prescription management</li>
          <li>📊 Advanced analytics and reporting</li>
          <li>📧 Automated notifications</li>
        </ul>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>MediConnect Professional Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendSignInNotification(to, userData) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping sign-in notification');
    return { success: true, skipped: true };
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@mediconnect.com',
    subject: 'Sign-in Notification - MediConnect Professional',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Sign-in Notification</h2>
        <p>Hello ${userData.firstName},</p>
        <p>We detected a new sign-in to your MediConnect Professional account.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Sign-in Details:</h3>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Time:</strong> ${new Date(userData.timestamp).toLocaleString()}</p>
          <p><strong>Platform:</strong> MediConnect Professional</p>
        </div>
        
        <p>If this was you, you can safely ignore this email.</p>
        <p>If you didn't sign in, please contact our support team immediately.</p>
        
        <p>Best regards,<br>MediConnect Professional Security Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending sign-in notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentConfirmation(to, appointmentData) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email notification');
    return { success: true, skipped: true };
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@mediconnect.com',
    subject: 'Appointment Confirmation - MediConnect Professional',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Your appointment has been confirmed!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Appointment Details:</h3>
          <p><strong>Date:</strong> ${new Date(appointmentData.date).toLocaleString()}</p>
          <p><strong>Status:</strong> ${appointmentData.status}</p>
          <p><strong>Doctor:</strong> ${appointmentData.doctor?.user?.email || 'N/A'}</p>
          <p><strong>Patient:</strong> ${appointmentData.patient?.user?.email || 'N/A'}</p>
        </div>
        <p>Please join the video call 5 minutes before your scheduled time.</p>
        <p>Best regards,<br>MediConnect Professional Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentReminder(to, appointmentData) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email notification');
    return { success: true, skipped: true };
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@mediconnect.com',
    subject: 'Appointment Reminder - MediConnect Professional',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>This is a reminder for your upcoming appointment.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Appointment Details:</h3>
          <p><strong>Date:</strong> ${new Date(appointmentData.date).toLocaleString()}</p>
          <p><strong>Status:</strong> ${appointmentData.status}</p>
          <p><strong>Doctor:</strong> ${appointmentData.doctor?.user?.email || 'N/A'}</p>
          <p><strong>Patient:</strong> ${appointmentData.patient?.user?.email || 'N/A'}</p>
        </div>
        <p>Please join the video call 5 minutes before your scheduled time.</p>
        <p>Best regards,<br>MediConnect Professional Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPrescriptionNotification(to, prescriptionData) {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - skipping email notification');
    return { success: true, skipped: true };
  }

  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@mediconnect.com',
    subject: 'New Prescription Available - MediConnect Professional',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Prescription Available</h2>
        <p>Your doctor has issued a new prescription.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Prescription Details:</h3>
          <p><strong>Date:</strong> ${new Date(prescriptionData.createdAt).toLocaleString()}</p>
          <p><strong>Doctor:</strong> ${prescriptionData.doctor?.user?.email || 'N/A'}</p>
          ${prescriptionData.pdfUrl ? `<p><strong>Download:</strong> <a href="${prescriptionData.pdfUrl}">View Prescription</a></p>` : ''}
        </div>
        <p>Please log in to your account to view the complete prescription details.</p>
        <p>Best regards,<br>MediConnect Professional Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
