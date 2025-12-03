import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:8000");

function App() {
  const [userId, setUserId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lắng nghe tin nhắn mới từ server
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        (data.sender === userId && data.receiver === receiverId) ||
        (data.sender === receiverId && data.receiver === userId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, userId, receiverId]);

  // Đánh dấu tin nhắn đã xem
  useEffect(() => {
    if (isLoggedIn && userId && receiverId) {
      // Kiểm tra xem có tin nhắn nào từ người nhận chưa đọc không
      const unseenMessages = messages.filter(
        (msg) =>
          msg.sender === receiverId && msg.receiver === userId && !msg.seen
      );

      if (unseenMessages.length > 0) {
        console.log("Sending mark_seen event:", {
          sender: receiverId,
          receiver: userId,
        });
        // Đánh dấu các tin nhắn từ người nhận thành đã xem
        socket.emit("mark_seen", {
          sender: receiverId,
          receiver: userId,
        });
      }
    }
  }, [isLoggedIn, messages, receiverId, userId]);

  useEffect(() => {
    socket.on("messages_seen", (data) => {
      // Log để debug
      console.log("Received messages_seen event:", data);
      console.log("Current user:", userId, "Receiver:", receiverId);

      // Kiểm tra xem có dữ liệu messages trong data không
      if (data.messages && data.messages.length > 0) {
        console.log("Updating messages with data from server:", data.messages);

        // Cập nhật tất cả tin nhắn trong state từ dữ liệu server
        setMessages((prevMessages) => {
          // Tạo map từ tin nhắn hiện tại để dễ dàng cập nhật
          const messagesMap = new Map(
            prevMessages.map((msg) => [msg._id, msg])
          );

          // Cập nhật tin nhắn từ dữ liệu server
          data.messages.forEach((updatedMsg) => {
            if (messagesMap.has(updatedMsg._id)) {
              messagesMap.set(updatedMsg._id, updatedMsg);
            }
          });

          // Chuyển map trở lại thành array
          return Array.from(messagesMap.values());
        });
      } else if (data.sender === userId && data.receiver === receiverId) {
        // Fallback nếu không có dữ liệu messages từ server
        console.log("Updating messages based on sender/receiver");
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender === userId && msg.receiver === receiverId
              ? { ...msg, seen: true }
              : msg
          )
        );
      }
    });

    return () => {
      socket.off("messages_seen");
    };
  }, [socket, userId, receiverId]);

  // Lấy lịch sử tin nhắn khi đăng nhập
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/messages/${userId}/${receiverId}`
      );
      console.log("Fetched messages:", response.data);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleLogin = () => {
    if (userId.trim() !== "" && receiverId.trim() !== "") {
      setIsLoggedIn(true);
      fetchMessages();
    }
  };

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const messageData = {
        sender: userId,
        receiver: receiverId,
        content: message,
      };

      await socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      {!isLoggedIn ? (
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full mb-4 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
              Messenger
            </h1>
            <p className="text-gray-600">Bắt đầu cuộc trò chuyện của bạn</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID của bạn
              </label>
              <input
                type="text"
                placeholder="Nhập ID của bạn"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID người nhận
              </label>
              <input
                type="text"
                placeholder="Nhập ID người nhận"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all duration-300"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Bắt đầu chat
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {receiverId[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  {receiverId}
                </h2>
                <p className="text-white/80 text-xs">Đang hoạt động</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === userId ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-[70%] ${
                    msg.sender === userId ? "order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-md ${
                      msg.sender === userId
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                  </div>
                  <div
                    className={`flex items-center space-x-2 mt-1 px-2 ${
                      msg.sender === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.sender === userId && (
                      <span className="text-xs">
                        {msg.seen ? (
                          <span className="text-blue-500 flex items-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <svg
                              className="w-4 h-4 -ml-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300"
              />
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
