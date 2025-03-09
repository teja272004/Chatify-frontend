import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./components/Chat";
import Friends from "./components/Friends";
import AuthGuard from "./utils/authGuard";
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import CallPage from "./pages/CallPage"; // Import CallPage Component
import AiChat from "./pages/AiChat"; // Import AI Chat Page

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-extrabold mb-4 animate-fade-in">
        Welcome to Chatify 🎉
      </h1>
      <p className="text-lg mb-6 max-w-lg">
        Connect with your friends, chat in real time, and share moments with Chatify.
        Join now to start the conversation!
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-white text-blue-600 rounded-lg shadow-lg font-semibold hover:bg-gray-200 transition-all"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg shadow-lg font-semibold hover:bg-yellow-300 transition-all"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/friends" element={<AuthGuard><Friends /></AuthGuard>} />
        <Route path="/chat/:userId" element={<AuthGuard><Chat /></AuthGuard>} />
        <Route path="/search" element={<Search />} />
        <Route path="/call/:userId" element={<AuthGuard><CallPage /></AuthGuard>} />
        <Route path="/ai-chat" element={<AuthGuard><AiChat /></AuthGuard>} /> {/* AI Chat Route */}
      </Routes>
    </Router>
  );
}

export default App;
