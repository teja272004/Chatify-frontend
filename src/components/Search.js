import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Search = () => {
  const [query, setQuery] = useState(""); // User input for search
  const [results, setResults] = useState([]); // Store search results
  const [friends, setFriends] = useState([]); // List of friends
  const [sentRequests, setSentRequests] = useState(new Set()); // Track sent requests
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [successMessage, setSuccessMessage] = useState(""); // Success feedback

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch current user's friends
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users/friends", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFriends(res.data))
      .catch((err) => console.error("❌ Error fetching friends:", err));
  }, [token]);

  // Search users by username
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/search?username=${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResults(res.data);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        setError("Failed to fetch users. Try again later.");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query, token]);

  // Check if a user is already a friend
  const isFriend = (userId) => friends.some((friend) => friend._id === userId);

  // Send Friend Request
  const sendFriendRequest = async (userId) => {
    if (isFriend(userId)) return; // Prevent sending request if already a friend

    try {
      await axios.post(
        "http://localhost:5000/api/users/send-friend-request",
        { recipientId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state to reflect sent request
      setSentRequests((prev) => new Set([...prev, userId]));
      setSuccessMessage("✅ Friend request sent successfully!");

      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("❌ Error sending friend request:", err);
      if (err.response && err.response.status === 404) {
        setError("User not found or request failed.");
      } else {
        setError("Failed to send request. Try again.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Search Friends</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-200 text-green-800 p-2 rounded-md mb-2">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-200 text-red-800 p-2 rounded-md mb-2">
          {error}
        </div>
      )}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 border rounded-md w-full mb-4"
      />

      {/* Loading State */}
      {loading && <p className="text-gray-500 text-center p-2">Loading...</p>}

      {/* Display Search Results */}
      <ul className="bg-white rounded-lg shadow-md">
        {results.length === 0 && !loading ? (
          <p className="text-gray-500 text-center p-2">No users found.</p>
        ) : (
          results.map((user) => (
            <li key={user._id} className="p-2 border-b flex justify-between items-center">
              <span>
                {user.username} ({user.email})
              </span>
              <button
                onClick={() => sendFriendRequest(user._id)}
                disabled={isFriend(user._id) || sentRequests.has(user._id)}
                className={`px-3 py-1 text-sm rounded-md ${
                  isFriend(user._id)
                    ? "bg-green-400 cursor-not-allowed"
                    : sentRequests.has(user._id)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isFriend(user._id) ? "Already Friends" : sentRequests.has(user._id) ? "Request Sent" : "Send Friend Request"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Search;
