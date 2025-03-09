

const ChatPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar with chat list */}
      <Sidebar />
      
      {/* Chat window where messages appear */}
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
