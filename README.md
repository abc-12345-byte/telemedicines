# MediConnect Professional - Enterprise Telemedicine Platform

A comprehensive, enterprise-grade telemedicine platform built with Next.js, featuring professional video consultations, electronic prescriptions, and advanced analytics.

## 🚀 Features

### Core Functionality
- **Professional Video Consultations** - HD quality video calls with screen sharing
- **Electronic Prescriptions** - Digital prescription management with PDF generation
- **Advanced Analytics Dashboard** - Real-time insights and performance metrics
- **Role-Based Access Control** - Doctor, Patient, and Admin roles
- **Appointment Management** - Complete scheduling and status tracking

### Enterprise Features
- **HIPAA Compliant** - Bank-level security and data protection
- **24/7 Availability** - 99.9% uptime with automatic scaling
- **Multi-Platform Access** - Responsive design for all devices
- **Email Notifications** - Automated appointment and prescription alerts
- **Audit Trails** - Complete activity logging and compliance
- **Sign-in Notifications** - Email alerts for account security

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Clerk
- **Video Calls**: Agora RTC SDK
- **Email**: SendGrid
- **Charts**: Recharts
- **UI Components**: Lucide React Icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- SendGrid account (optional)
- Agora account (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd telemedicines
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database (Supabase)
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (SendGrid) - Optional
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Video Calls (Agora) - Optional
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
NEXT_PUBLIC_AGORA_TOKEN=your_agora_token

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🔧 Configuration

### Clerk Authentication Setup

1. **Create Clerk Account**
   - Go to [clerk.com](https://clerk.com) and create an account
   - Create a new application

2. **Get API Keys**
   - Copy your publishable key and secret key
   - Add them to your `.env.local` file

3. **Configure Webhooks** (for email notifications)
   - Go to Clerk Dashboard > Webhooks
   - Create a new webhook endpoint
   - Set the endpoint URL to: `https://yourdomain.com/api/webhooks/clerk`
   - Select these events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `session.created`
   - Copy the webhook secret and add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

4. **Configure Email Templates** (Optional)
   - Go to Clerk Dashboard > Email Templates
   - Customize welcome emails and other notifications

### Supabase Database Setup

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com) and create an account
   - Create a new project

2. **Get Database URL**
   - Go to Settings > Database
   - Copy your database URL
   - Add it to your `.env.local` file as `DATABASE_URL` and `DIRECT_URL`

3. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Verify Database Connection**
   ```bash
   npx prisma studio
   ```

### SendGrid Email Setup (Optional)

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com) and create an account

2. **Create API Key**
   - Go to Settings > API Keys
   - Create a new API key with full access
   - Copy the API key (starts with "SG.")

3. **Verify Sender Email**
   - Go to Settings > Sender Authentication
   - Verify your sender email address

4. **Add to Environment**
   - Add the API key to `.env.local` as `SENDGRID_API_KEY`
   - Add your verified email as `FROM_EMAIL`

### Agora Video Setup (Optional)

1. **Create Agora Account**
   - Go to [agora.io](https://agora.io) and create an account

2. **Create Project**
   - Create a new project
   - Copy your App ID

3. **Generate Token** (for production)
   - Use Agora's token generator or server SDK
   - For development, you can use a temporary token

4. **Add to Environment**
   - Add App ID as `NEXT_PUBLIC_AGORA_APP_ID`
   - Add token as `NEXT_PUBLIC_AGORA_TOKEN`

## 📱 Usage

### For Healthcare Providers

1. **Sign Up/In**: Create an account and select "Doctor" role
2. **Complete Profile**: Add specialization and availability
3. **Manage Appointments**: View, confirm, and manage patient appointments
4. **Video Consultations**: Start HD video calls with patients
5. **Create Prescriptions**: Generate electronic prescriptions with PDF download
6. **Analytics**: View performance metrics and patient engagement

### For Patients

1. **Sign Up/In**: Create an account and select "Patient" role
2. **Complete Profile**: Add medical history and preferences
3. **Book Appointments**: Schedule consultations with available doctors
4. **Join Video Calls**: Participate in secure video consultations
5. **Access Prescriptions**: View and download prescriptions
6. **Medical Records**: Access appointment history and prescriptions

### For Administrators

1. **Sign Up/In**: Create an account and select "Admin" role
2. **Dashboard Overview**: View comprehensive platform analytics
3. **User Management**: Monitor doctors, patients, and system usage
4. **Performance Metrics**: Track appointment trends and platform health
5. **System Monitoring**: Monitor uptime and performance

## 🔒 Security & Compliance

- **HIPAA Compliant**: Full compliance with healthcare data regulations
- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Audit Trails**: Complete logging of all system activities
- **Role-Based Access**: Granular permissions based on user roles
- **Secure Authentication**: Multi-factor authentication via Clerk
- **Sign-in Notifications**: Email alerts for account security

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🐛 Troubleshooting

### Common Issues

**1. SendGrid API Key Error**
```
API key does not start with "SG."
```
**Solution**: Make sure your SendGrid API key starts with "SG." and is properly formatted.

**2. 404 Errors for API Routes**
```
GET /api/doctor/appointments 404
```
**Solution**: Ensure your database is properly connected and migrations are run.

**3. Authentication Issues**
**Solution**: Verify your Clerk configuration and environment variables.

**4. Database Connection Issues**
**Solution**: Check your Supabase connection string and ensure the database is accessible.

**5. Webhook Not Working**
**Solution**: 
- Verify your webhook endpoint URL is correct
- Check that `CLERK_WEBHOOK_SECRET` is set
- Ensure your domain is accessible from Clerk's servers

**6. Email Notifications Not Sending**
**Solution**:
- Verify SendGrid API key is correct
- Check that `FROM_EMAIL` is verified in SendGrid
- Ensure webhook is properly configured

### Development Tips

- Use `npm run dev` for development
- Check browser console for client-side errors
- Monitor terminal for server-side errors
- Use Prisma Studio for database management: `npx prisma studio`
- Check webhook logs in Clerk dashboard

## 📊 API Endpoints

### Authentication
- `GET /api/user/role` - Get current user's role
- `POST /api/save-profile` - Save user role

### Appointments
- `GET /api/doctor/appointments` - Get doctor's appointments
- `GET /api/patient/appointments` - Get patient's appointments
- `POST /api/doctor/appointments` - Create appointment
- `PATCH /api/appointments/[id]` - Update appointment status

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription

### Analytics
- `GET /api/admin/stats` - Get admin statistics

### Webhooks
- `POST /api/webhooks/clerk` - Handle Clerk webhook events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Following the repository
- Checking the releases page
- Reading the changelog

---

**Built with ❤️ for the healthcare community**
