import { useState, useEffect,useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";


const socket = io("http://localhost:5000"); // Change if deployed

const Chat = () => {
  const navigate = useNavigate();
  const { userId } = useParams(); // Friend's ID from URL
  const chatContainerRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]); // Friends list
  const [pendingRequests, setPendingRequests] = useState([]); // Friend requests
  const [friendUsername, setFriendUsername] = useState(""); // Friend's Name
  const [unreadMessages, setUnreadMessages] = useState({});

  const token = localStorage.getItem("token");
  const senderId = localStorage.getItem("userId");

  // Fetch the friend's username dynamically
  const fetchFriendUsername = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendUsername(response.data.username);
    } catch (error) {
      console.error("❌ Error fetching friend's username:", error);
      setFriendUsername("Unknown");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCall = () => {
    if (!userId) {
      alert("Please select a friend to call.");
      return;
    }
    navigate(`/call/${userId}`); // Navigate to the CallPage
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!senderId) {
      console.error("❌ senderId is undefined! Cannot fetch data.");
      return;
    }
    setTimeout(() => {
      chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    console.log("🔍 Fetching chat messages for:", senderId, "with", userId);

    socket.emit("join", senderId);
    fetchFriendUsername();

    // Fetch chat history
    if (userId) {
      axios
        .get(`http://localhost:5000/api/chat/${senderId}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("❌ Error loading messages:", err));
    }

    // Fetch friends list
    axios
      .get(`http://localhost:5000/api/users/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const uniqueFriends = Array.from(
          new Map(res.data.map((friend) => [friend._id, friend])).values()
        );
        setFriends(uniqueFriends);
      })
      .catch((err) => console.error("❌ Error fetching friends:", err));

    // Fetch pending friend requests
    axios
      .get("http://localhost:5000/api/users/friend-requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPendingRequests(res.data))
      .catch((err) => console.error("❌ Error fetching friend requests:", err));

    // Handle incoming messages
    const handleIncomingMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    
      // If the message is from the current chat user, scroll down
      if (data.sender === userId) {
        setTimeout(() => {
          chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        // Mark as unread if it's from another user
        setUnreadMessages((prev) => ({
          ...prev,
          [data.sender]: (prev[data.sender] || 0) + 1,
        }));
      }
    };
    if (senderId === "ai_bot") {
      console.log("🤖 AI Chat Active");
    
      const sendMessageToAI = async (message) => {
        try {
          const response = await axios.post(
            "http://localhost:5000/api/chat/ai",
            { message },
            { headers: { Authorization: `Bearer ${token}` } }
          );
    
          setMessages((prev) => [
            ...prev,
            { sender: "You", text: message },
            { sender: "AI", text: response.data.aiMessage },
          ]);
        } catch (error) {
          console.error("❌ AI Chat Error:", error);
        }
      };
    
      // Capture user input
      const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === "") return;
    
        sendMessageToAI(message);
        setMessage(""); // Clear input
      };
    }

    socket.on("private message", handleIncomingMessage);

    return () => {
      socket.off("private message", handleIncomingMessage);
    };
  }, [navigate, userId, senderId, token]);

  const sendMessage = () => {
    if (!message.trim()) {
      console.warn("⚠️ Cannot send an empty message.");
      return;
    }

    if (!userId || !senderId) {
      console.error("❌ Cannot send message, userId or senderId is undefined!");
      return;
    }

    const msgData = { sender: senderId, receiver: userId, message };

    socket.emit("private message", msgData);

    axios
      .post("http://localhost:5000/api/chat/send", msgData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setMessages((prev) => [...prev, msgData]))
      .catch((err) => console.error("❌ Error sending message:", err));

    setMessage("");
  };

  const handleFriendRequest = (requesterId, action) => {
    axios
      .post(
        "http://localhost:5000/api/users/handle-friend-request",
        { senderId: requesterId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        console.log(`✅ Friend request ${action}ed!`);
        setPendingRequests((prev) =>
          prev.filter((req) => req._id !== requesterId)
        );
      })
      .catch((err) => console.error(`❌ Error ${action}ing request:`, err));
  };

 return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Friends List */}
      <div className="w-1/4 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">No friends yet.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li
                key={friend._id}
                onClick={() => {
                  navigate(`/chat/${friend._id}`);
                  setUnreadMessages((prev) => ({ ...prev, [friend._id]: 0 })); // Mark as read
                }}
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
        
        {/* Friend Requests Section */}
        <h2 className="text-xl font-bold mt-6">Friend Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {pendingRequests.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <span className="font-semibold">{user.username}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleFriendRequest(user._id, "accept")}
                    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(user._id, "reject")}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-3/4 flex flex-col">
        <div className="bg-blue-500 text-white py-3 px-5 flex justify-between items-center shadow-md">
          <h2 className="text-lg font-bold">
            {friendUsername
              ? `Chat with ${friendUsername}`
              : "Select a friend to start chatting"}
          </h2>
          <div className="space-x-2">
            <button
              onClick={handleCall}
              className="bg-green-500 px-3 py-1 rounded-md text-sm"
            >
              Call
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">
              No messages yet. Start a conversation!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 max-w-xs rounded-lg text-white ${
                  msg.sender === senderId
                    ? "bg-blue-500 self-end ml-auto"
                    : "bg-gray-500 self-start"
                }`}
              >
                <strong>{msg.sender === senderId ? "You" : friendUsername}: </strong>
                {msg.message}
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-white border-t flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l-md outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

};

export default Chat;