import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("https://chatify-my21.onrender.com"); // Update with your backend URL

const CallPage = () => {
  const navigate = useNavigate();

  // State Variables
  const [me, setMe] = useState("");
  const [stream, setStream] = useState(null);
  const [users, setUsers] = useState([]); // Store online users
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isRinging, setIsRinging] = useState(false);

  // Refs for video and connection
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // 🔹 Effect: Get Media Stream & Users
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) myVideo.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Failed to access media devices:", err);
        alert("Please allow camera and microphone access.");
      });

    socket.on("me", (id) => {
      console.log("🔹 My Socket ID:", id);
      setMe(id);
    });

    socket.on("userList", (userList) => {
      console.log("👥 Online Users:", userList);
      setUsers(userList.filter((user) => user !== me)); // Exclude yourself
    });

    socket.on("incomingCall", ({ signal, from }) => {
      console.log("📞 Incoming call from:", from);
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
      setIsRinging(true);
    });

    socket.on("callEnded", ({ reason }) => {
      console.log(`📴 Call ended: ${reason}`);
      cleanupCall();
      navigate("/");
    });

    socket.emit("getUsers"); // Request user list from the backend

    return () => {
      socket.off("me");
      socket.off("userList");
      socket.off("incomingCall");
      socket.off("callEnded");
    };
  }, [navigate]);

  // 🔹 Function: Make a Call
  const callUser = (id) => {
    if (!id) {
      alert("⚠️ Please select a valid user to call.");
      return;
    }

    console.log(`📞 Calling user ${id} from ${me}`);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    });

    peer.on("signal", (data) => {
      console.log("📡 Sending call request:", data);
      socket.emit("callUser", { userToCall: id, signalData: data, from: me });
    });

    peer.on("stream", (remoteStream) => {
      console.log("🎥 Received remote stream");
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    socket.on("callAccepted", (signal) => {
      console.log("✅ Call accepted");
      setCallAccepted(true);
      setIsRinging(false);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // 🔹 Function: Cleanup Call Resources
  const cleanupCall = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    setIsRinging(false);
    
    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  return (
    <div className="p-4">
      {/* Video Streams */}
      <div className="flex space-x-4">
        <div>
          <video playsInline muted ref={myVideo} autoPlay className="w-64 h-48 rounded-lg" />
        </div>
        {callAccepted && !callEnded && (
          <video playsInline ref={userVideo} autoPlay className="w-64 h-48 rounded-lg" />
        )}
      </div>

      {/* Online Users List */}
      <h2 className="mt-4 text-xl font-bold">👥 Online Users</h2>
      <ul className="mt-2 space-y-2">
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user} className="flex justify-between items-center p-2 bg-gray-200 rounded-lg">
              <span>🟢 {user}</span>
              <button
                onClick={() => callUser(user)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                📞 Call
              </button>
            </li>
          ))
        ) : (
          <p>No users online</p>
        )}
      </ul>
    </div>
  );
};

export default CallPage;
