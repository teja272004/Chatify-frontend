import { useState } from "react";
import axios from "axios";

const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const token = localStorage.getItem("token"); // 🔹 Get token from storage

      const response = await axios.post(
        "http://localhost:5000/api/ai",
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔹 Send token in headers
          },
        }
      );

      const aiMessage = { sender: "AI", text: response.data.aiMessage };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "❌ AI chat service unavailable. Please try again." },
      ]);
    }

    setInput(""); // Clear input field
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">AI Chat Assistant</h1>
      <p className="text-lg text-gray-700 mb-6">Chat with AI and get instant responses.</p>
      <div className="w-full max-w-2xl p-4 bg-white shadow-lg rounded-lg">
        <div className="h-96 overflow-y-auto border-b p-4">
          {messages.map((msg, index) => (
            <p key={index} className={`mb-2 ${msg.sender === "You" ? "text-blue-600" : "text-green-600"}`}>
              <strong>{msg.sender}:</strong> {msg.text}
            </p>
          ))}
        </div>
        <div className="p-4 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-md outline-none"
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
