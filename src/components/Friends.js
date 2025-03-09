import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const socket = io("http://localhost:5000");

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      } catch (error) {
        console.error("❌ Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [token]);

  useEffect(() => {
    // ✅ Listen for new messages
    socket.on("newMessage", ({ senderId }) => {
      setUnreadMessages((prev) => ({
        ...prev,
        [senderId]: (prev[senderId] || 0) + 1, // Increment count for sender
      }));
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const openChat = (friendId) => {
    navigate(`/chat/${friendId}`);
    setUnreadMessages((prev) => ({ ...prev, [friendId]: 0 })); // ✅ Reset unread count
  };

  return (
    <div className="w-1/4 bg-white shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      {friends.length === 0 ? (
        <p className="text-gray-500">No friends yet.</p>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li
              key={friend._id}
              onClick={() => openChat(friend._id)}
              className="p-2 border rounded-md cursor-pointer hover:bg-gray-200 flex justify-between"
            >
              <span>{friend.username}</span>
              {unreadMessages[friend._id] > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadMessages[friend._id]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
