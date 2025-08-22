"use client";
import { useEffect, useRef } from "react";

export default function VideoCall({ appointmentId }) {
  const localVideoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Video Call - {appointmentId}</h2>
      <video ref={localVideoRef} autoPlay muted className="w-full rounded-lg border" />
    </div>
  );
}
