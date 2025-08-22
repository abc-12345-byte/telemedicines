"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// Load SDK dynamically on client to avoid SSR window reference
let AgoraRTCImport = null;
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-var
  AgoraRTCImport = require("agora-rtc-sdk-ng").default || require("agora-rtc-sdk-ng");
}
import { Mic, MicOff, Video, VideoOff, LogOut, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function AgoraVideoCall({ appointmentId }) {
  const router = useRouter();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const joiningRef = useRef(false);
  const clientRef = useRef(null);
  const localTrackRef = useRef({ videoTrack: null, audioTrack: null });

  const [client, setClient] = useState(null);
  const [localTrack, setLocalTrack] = useState({ videoTrack: null, audioTrack: null });
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [remotePresent, setRemotePresent] = useState(false);
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('participant');
  const [channelName, setChannelName] = useState(appointmentId ? String(appointmentId) : '');

  // Initialize devices on mount
  useEffect(() => {
    initializeDevices();
  }, []);

  const initializeDevices = async () => {
    try {
      const [cameras, microphones] = await Promise.all([
        navigator.mediaDevices.enumerateDevices()
          .then(devices => devices.filter(device => device.kind === 'videoinput'))
          .catch(() => []),
        navigator.mediaDevices.enumerateDevices()
          .then(devices => devices.filter(device => device.kind === 'audioinput'))
          .catch(() => [])
      ]);
      
      setDevices({ cameras, microphones });
      if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
      if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  };

  // Initialize Agora client on the client-side only
  useEffect(() => {
    if (!client && AgoraRTCImport) {
      const created = AgoraRTCImport.createClient({ mode: "rtc", codec: "vp8" });
      setClient(created);
      clientRef.current = created;
    }
  }, [client]);

  // Keep channel name in sync with appointmentId
  useEffect(() => {
    if (appointmentId) {
      setChannelName(String(appointmentId));
    }
  }, [appointmentId]);

  // Auto-start the call once the client is ready and we have a channel
  useEffect(() => {
    if (client && channelName && !hasJoined && !isJoining) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        startCall();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [client, channelName, hasJoined, isJoining, startCall]);

  const getConnectionState = () => {
    try {
      if (typeof client.getConnectionState === "function") {
        return client.getConnectionState();
      }
      return client.connectionState;
    } catch {
      return undefined;
    }
  };

  const startCall = useCallback(async () => {
    // Prevent duplicate joins (e.g., StrictMode double-invoke or rapid clicks)
    if (joiningRef.current || isJoining || hasJoined) return;
    if (!client) {
      toast.error("Video engine not ready. Please wait a moment.");
      return;
    }
    const state = getConnectionState();
    if (state && state !== "DISCONNECTED") return;
    const resolvedChannel = channelName || (appointmentId ? String(appointmentId) : '');
    if (!resolvedChannel) {
      toast.error("Please enter a channel name");
      return;
    }
    
    joiningRef.current = true;
    setIsJoining(true);
    try {
      // Ensure any previous local tracks are stopped before creating new ones
      stopLocalMedia();

      // Step 1: Create Agora microphone and camera tracks (prompts for permissions)
      let createdAudioTrack = null;
      let createdVideoTrack = null;
      try {
        [createdAudioTrack, createdVideoTrack] = await AgoraRTCImport.createMicrophoneAndCameraTracks(
          selectedMicrophone ? { microphoneId: selectedMicrophone } : {},
          selectedCamera
            ? { cameraId: selectedCamera, encoderConfig: "720p_3", facingMode: "user" }
            : { encoderConfig: "720p_3", facingMode: "user" }
        );
      } catch (e) {
        // Fallbacks for busy device: try default devices separately
        if (e && (e.name === "NotReadableError" || String(e).includes("NotReadableError"))) {
          try {
            createdAudioTrack = await AgoraRTCImport.createMicrophoneAudioTrack(
              selectedMicrophone ? { microphoneId: selectedMicrophone } : {}
            );
          } catch {}
          try {
            createdVideoTrack = await AgoraRTCImport.createCameraVideoTrack(
              selectedCamera ? { cameraId: selectedCamera, encoderConfig: "720p_3", facingMode: "user" } : { encoderConfig: "720p_3", facingMode: "user" }
            );
          } catch {}
          if (!createdAudioTrack && !createdVideoTrack) throw e;
        } else {
          throw e;
        }
      }

      // Step 2: Show local preview immediately
      if (createdVideoTrack && localVideoRef.current) {
        try { 
          localVideoRef.current.innerHTML = ""; 
        } catch {}
        
        // Ensure video track is enabled
        try { 
          await createdVideoTrack.setEnabled(true); 
        } catch {}
        
        // Play the video track immediately
        createdVideoTrack.play(localVideoRef.current, { fit: "cover", mirror: true });
        
        // Force underlying video element to fill and autoplay inline
        try {
          const container = localVideoRef.current;
          container.style.position = container.style.position || "relative";
          
          // Wait a bit for the video element to be created
          setTimeout(() => {
            const videoEl = container.querySelector("video");
            if (videoEl) {
              videoEl.setAttribute("playsinline", "true");
              videoEl.muted = true;
              videoEl.style.width = "100%";
              videoEl.style.height = "100%";
              videoEl.style.objectFit = "cover";
              videoEl.style.backgroundColor = "transparent";
              
              // Force play to ensure video shows
              videoEl.play().catch(() => {
                console.log("Auto-play prevented, but video should still display");
              });
            }
          }, 100);
        } catch {}
      } else {
        // No camera track available; reflect in UI so user can pick another device
        setCamOn(false);
      }

      // Step 3: Get Agora token and join
      let appIdFromServer = null;
      let tokenFromServer = null;
      let uidFromServer = null;
      try {
        const tokenResponse = await fetch("/api/agora/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName: resolvedChannel, role, userName })
        });
        if (!tokenResponse.ok) throw new Error("token api not ok");
        const parsed = await tokenResponse.json();
        appIdFromServer = parsed.appId;
        tokenFromServer = parsed.token;
        uidFromServer = parsed.uid;
      } catch (e) {
        // Fallback: try joining without token if app certificate is not set (dev mode)
        appIdFromServer = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        tokenFromServer = null;
        uidFromServer = null;
        if (!appIdFromServer) {
          throw new Error("Missing Agora App ID. Set NEXT_PUBLIC_AGORA_APP_ID in your environment.");
        }
      }

      // Step 4: Join the channel
      await client.join(appIdFromServer, String(resolvedChannel), tokenFromServer, uidFromServer);

      // Step 5: Publish tracks
      await client.publish([createdAudioTrack, createdVideoTrack].filter(Boolean));

      // Step 6: Set up event listeners
      if (typeof client.removeAllListeners === "function") {
        client.removeAllListeners();
      }
      
      // Handle remote users joining
      client.on("user-published", async (user, mediaType) => {
        try {
          console.log(`Remote user ${user.uid} published ${mediaType}`);
          await client.subscribe(user, mediaType);
          
          if (mediaType === "video" && remoteVideoRef.current) {
            user.videoTrack?.play(remoteVideoRef.current);
            setRemotePresent(true);
            
            // Ensure remote video displays properly
            setTimeout(() => {
              const remoteVideoEl = remoteVideoRef.current?.querySelector("video");
              if (remoteVideoEl) {
                remoteVideoEl.style.width = "100%";
                remoteVideoEl.style.height = "100%";
                remoteVideoEl.style.objectFit = "cover";
              }
            }, 100);
          }
          
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        } catch (error) {
          console.error("Error subscribing to user:", error);
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        console.log(`Remote user ${user.uid} unpublished ${mediaType}`);
        if (mediaType === "video" && remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
          setRemotePresent(false);
        }
      });

      client.on("user-left", (user) => {
        console.log(`Remote user ${user.uid} left the channel`);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
        }
        setRemotePresent(false);
      });

      // Subscribe to already published remote users (if they joined earlier)
      try {
        const remoteUsers = client.remoteUsers || [];
        console.log(`Found ${remoteUsers.length} existing remote users`);
        
        remoteUsers.forEach(async (user) => {
          try {
            if (user.hasVideo && remoteVideoRef.current) {
              await client.subscribe(user, "video");
              user.videoTrack?.play(remoteVideoRef.current);
              setRemotePresent(true);
            }
            if (user.hasAudio) {
              await client.subscribe(user, "audio");
              user.audioTrack?.play();
            }
          } catch (error) {
            console.error("Error subscribing to existing user:", error);
          }
        });
      } catch (error) {
        console.error("Error handling existing remote users:", error);
      }

      // Step 7: Update state
      setLocalTrack({ videoTrack: createdVideoTrack, audioTrack: createdAudioTrack });
      localTrackRef.current = { videoTrack: createdVideoTrack, audioTrack: createdAudioTrack };
      setHasJoined(true);
      toast.success("Successfully joined video call!");

    } catch (error) {
      console.error("Error starting call:", error);
      let errorMessage = "Failed to start video call";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "Camera/microphone access denied. Please allow permissions and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera or microphone found. Please check your devices.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera/microphone is in use. Close other apps (Teams/Zoom/Meet) or switch devices in the dropdowns.";
      } else if (error.message.includes("Agora")) {
        errorMessage = "Failed to connect to video service. Please try again.";
      }
      
      toast.error(errorMessage);
      // Ensure any partially created tracks are closed
      try { stopLocalMedia(); } catch {}
    } finally {
      setIsJoining(false);
      joiningRef.current = false;
    }
  }, [client, channelName, appointmentId, role, userName, selectedCamera, selectedMicrophone, getConnectionState, hasJoined, isJoining]);

  const toggleMic = async () => {
    if (!localTrack.audioTrack) {
      toast.error("Microphone not available");
      return;
    }
    
    try {
      const newState = !micOn;
      await localTrack.audioTrack.setEnabled(newState);
      setMicOn(newState);
      toast.success(`Microphone ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling mic:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  const toggleCam = async () => {
    if (!localTrack.videoTrack) {
      toast.error("Camera not available");
      return;
    }
    
    try {
      const newState = !camOn;
      await localTrack.videoTrack.setEnabled(newState);
      setCamOn(newState);
      toast.success(`Camera ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling camera:", error);
      toast.error("Failed to toggle camera");
    }
  };

  const stopLocalMedia = () => {
    const { videoTrack, audioTrack } = localTrackRef.current || {};
    if (videoTrack) {
      try { videoTrack.stop(); } catch {}
      try { videoTrack.close(); } catch {}
    }
    if (audioTrack) {
      try { audioTrack.stop(); } catch {}
      try { audioTrack.close(); } catch {}
    }
  };

  const leaveCall = async () => {
    try {
      stopLocalMedia();
      const currentClient = clientRef.current || client;
      if (currentClient && typeof currentClient.unpublish === "function") {
        try {
          const toUnpublish = Object.values(localTrackRef.current || {}).filter(Boolean);
          if (toUnpublish.length) await currentClient.unpublish(toUnpublish);
        } catch {}
      }
      if (currentClient && typeof currentClient.removeAllListeners === "function") {
        currentClient.removeAllListeners();
      }
      if (currentClient && typeof currentClient.leave === "function") {
        await currentClient.leave();
      }

      setLocalTrack({ videoTrack: null, audioTrack: null });
      localTrackRef.current = { videoTrack: null, audioTrack: null };
      setHasJoined(false);
      setRemotePresent(false);
      setMicOn(true);
      setCamOn(true);

      toast.success("Left video call");
      router.push("/");
    } catch (error) {
      console.error("Error leaving call:", error);
      router.push("/");
    }
  };

  const retryCall = async () => {
    if (hasJoined) {
      await leaveCall();
    }
    await startCall();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Always cleanup to avoid lingering connections in StrictMode
      stopLocalMedia();
      const currentClient = clientRef.current || client;
      if (currentClient && typeof currentClient.removeAllListeners === "function") {
        currentClient.removeAllListeners();
      }
      if (currentClient && typeof currentClient.leave === "function") {
        currentClient.leave().catch(() => {});
      }
    };
  }, [client]);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col">
      {!hasJoined ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-white text-xl font-semibold mb-4">Join a Video Call</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none"
                >
                  <option value="participant">Participant</option>
                  <option value="host">Host</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Channel Name</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Enter channel name"
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none"
                />
              </div>
              <div className="flex items-center space-x-3">
                {devices.cameras.length > 0 && (
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm"
                  >
                    {devices.cameras.map(cam => (
                      <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                )}
                {devices.microphones.length > 0 && (
                  <select
                    value={selectedMicrophone}
                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm"
                  >
                    {devices.microphones.map(mic => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={startCall}
                disabled={isJoining}
                className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  'Join Call'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-white text-lg font-semibold">
                Video Call - {channelName || appointmentId}
              </h1>
              <div className="flex items-center space-x-4">
                {devices.cameras.length > 0 && (
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
                  >
                    {devices.cameras.map(cam => (
                      <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                )}
                {devices.microphones.length > 0 && (
                  <select
                    value={selectedMicrophone}
                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                    className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
                  >
                    {devices.microphones.map(mic => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={retryCall}
                  disabled={isJoining}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isJoining ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
            {/* Local Video */}
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <h2 className="absolute top-2 left-2 z-10 text-white font-semibold bg-black/50 px-2 py-1 rounded">
                You {!camOn && "(Camera Off)"}
              </h2>
              <div ref={localVideoRef} className="w-full h-full"></div>
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm bg-black/20">
                  <AlertCircle className="w-4 h-4 mr-2" /> Camera Off
                </div>
              )}
              {isJoining && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Joining call...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <h2 className="absolute top-2 left-2 z-10 text-white font-semibold bg-black/50 px-2 py-1 rounded">
                Remote
              </h2>
              <div ref={remoteVideoRef} className="w-full h-full"></div>
              {!remotePresent && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                  <p>Waiting for other participant...</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-6 p-4 bg-gray-800">
            <button
              onClick={toggleMic}
              disabled={!localTrack.audioTrack}
              className={`p-3 rounded-full ${
                micOn ? "bg-green-600" : "bg-red-600"
              } text-white hover:opacity-90 disabled:opacity-50`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCam}
              disabled={!localTrack.videoTrack}
              className={`p-3 rounded-full ${
                camOn ? "bg-green-600" : "bg-red-600"
              } text-white hover:opacity-90 disabled:opacity-50`}
            >
              {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={leaveCall}
              className="p-3 rounded-full bg-red-700 text-white hover:opacity-90"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-700 p-2 text-center text-white text-sm">
            {hasJoined ? (
              <span className="text-green-400">✓ Connected to call</span>
            ) : isJoining ? (
              <span className="text-yellow-400">Connecting...</span>
            ) : (
              <span className="text-red-400">Not connected</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}




