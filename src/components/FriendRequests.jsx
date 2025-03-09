import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://chatify-my21.onrender.com");

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("https://chatify-my21.onrender.com/api/users/friend-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRequests(res.data);
      } catch (error) {
        console.error("❌ Error fetching friend requests:", error);
      }
    };

    fetchRequests();
  }, [token]);

  useEffect(() => {
    // ✅ Listen for real-time friend request updates
    socket.on("friendRequestSent", (newRequest) => {
      setRequests((prevRequests) => {
        // 🔹 Prevent duplicate requests
        const isDuplicate = prevRequests.some((req) => req._id === newRequest._id);
        return isDuplicate ? prevRequests : [...prevRequests, newRequest];
      });
    });

    return () => {
      socket.off("friendRequestSent");
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">Pending Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        <ul>
          {requests.map((user) => (
            <li key={user._id} className="mb-2 p-3 bg-white rounded shadow">
              <span className="font-semibold">{user.username}</span> ({user.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendRequests;
