# Agora Video Call Setup Guide

## 1. Get Agora App ID

1. Go to [Agora Console](https://console.agora.io/)
2. Create a new project or use an existing one
3. Copy your App ID from the project settings

## 2. Environment Variables

Add these to your `.env.local` file:

```env
# Agora Video Calling
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here
```

## 3. For Production (Token Authentication)

For production, you should use token authentication:

1. Get your Agora App Certificate from the console
2. Set up a token server (recommended) or use client-side token generation
3. Add the token to your environment variables:

```env
NEXT_PUBLIC_AGORA_TOKEN=your_agora_token_here
```

## 4. Testing the Video Call

1. Start your development server: `npm run dev`
2. Navigate to the patient or doctor dashboard
3. Click on "Test Video Call" or "Join Call" for confirmed appointments
4. Allow camera and microphone permissions when prompted

## 5. Features Included

- ✅ Real-time video and audio calling
- ✅ Camera and microphone controls
- ✅ Chat functionality during calls
- ✅ Connection status indicators
- ✅ Participant management
- ✅ Appointment-based access control
- ✅ Time-based access (15 minutes before/after appointment)

## 6. Security Features

- Appointment-based authorization
- Time-based access control
- User role verification
- Secure token generation (for production)

## 7. Troubleshooting

### Common Issues:

1. **Camera/Microphone not working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Test with different browsers

2. **Connection issues**
   - Check internet connection
   - Verify Agora App ID
   - Check browser console for errors

3. **Appointment not found**
   - Ensure appointment exists in database
   - Check user authorization
   - Verify appointment status is 'CONFIRMED'

## 8. Production Deployment

1. Set up proper token authentication
2. Use HTTPS (required for media access)
3. Configure CORS if needed
4. Set up monitoring and logging
5. Test with multiple users simultaneously

## 9. API Endpoints

- `GET /api/appointments/[id]` - Get appointment details
- `POST /api/agora/token` - Generate Agora token (for production)
- `GET /video-call/[appointmentId]` - Video call page

## 10. Components

- `AgoraVideoCall.js` - Main video call component
- `VideoCall.js` - Legacy simulated component (can be removed)
- Video call page - `/app/video-call/[appointmentId]/page.js`
























