import { RtcRole, RtcTokenBuilder } from "agora-access-token";

export async function POST(req) {
  try {
    const { channelName, uid } = await req.json();
    if (!channelName) {
      return new Response(JSON.stringify({ error: "Channel name required" }), { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const expirationTimeInSeconds = parseInt(process.env.TOKEN_EXPIRES_SEC || "3600");

    const role = RtcRole.PUBLISHER;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const assignedUid = uid || Math.floor(Math.random() * 100000);

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      assignedUid,
      role,
      privilegeExpiredTs
    );

    return new Response(JSON.stringify({ appId, token, uid: assignedUid }), { status: 200 });
  } catch (err) {
    console.error("Token generation error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate token" }), { status: 500 });
  }
}












