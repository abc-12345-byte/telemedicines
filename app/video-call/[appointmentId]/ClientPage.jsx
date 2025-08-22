"use client";
import dynamic from "next/dynamic";

const AgoraVideoCall = dynamic(() => import("@/components/AgoraVideoCall"), {
  ssr: false,
});

export default function ClientPage({ appointmentId }) {
  return <AgoraVideoCall appointmentId={appointmentId} />;
}





