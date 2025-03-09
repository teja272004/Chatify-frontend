import { Link } from "react-router-dom";

const Navigation = () => {
  // Retrieve userId from localStorage
  const userId = localStorage.getItem("userId");

  return (
    <nav className="p-4 bg-blue-500 text-white flex justify-between items-center">
      {/* App Title */}
      <h1 className="text-xl font-bold">Chat App</h1>

      {/* Navigation Links */}
      <div className="space-x-4 flex">
        {/* Conditional rendering for the Chat and Call links */}
        {userId && (
          <>
            <Link
              to={`/chat/${userId}`}
              className="px-4 py-2 bg-white text-blue-500 rounded-md hover:bg-gray-200 transition"
            >
              Chat
            </Link>

            <Link
              to={`/call/${userId}`} // Pass userId in Call Route
              className="px-4 py-2 bg-white text-blue-500 rounded-md hover:bg-gray-200 transition"
            >
              Call
            </Link>
          </>
        )}

        {/* AI Chat Link */}
        <Link
          to="/ai-chat"
          className="px-4 py-2 bg-white text-blue-500 rounded-md hover:bg-gray-200 transition"
        >
          AI Chat
        </Link>

        {/* Friends Link */}
        <Link
          to="/search"
          className="px-4 py-2 bg-white text-blue-500 rounded-md hover:bg-gray-200 transition"
        >
          Friends
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
