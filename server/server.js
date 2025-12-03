const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Địa chỉ của client Vite
    methods: ["GET", "POST"],
  },
});

// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error("Full error:", err);
  });

// Tạo Schema cho tin nhắn
const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
});

const Message = mongoose.model("Message", messageSchema);

// API endpoint để lấy lịch sử tin nhắn
app.get("/api/messages/:sender/:receiver", async (req, res) => {
  try {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    console.log("Fetched messages:", messages);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xử lý kết nối Socket.io
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Xử lý khi người dùng gửi tin nhắn
  socket.on("send_message", async (data) => {
    try {
      // Lưu tin nhắn vào database
      const newMessage = new Message({
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
      });

      await newMessage.save();

      // Gửi tin nhắn đến người nhận
      io.emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("mark_seen", async (data) => {
    try {
      console.log("Marking messages as seen:", data);

      // Cập nhật tất cả tin nhắn chưa đọc
      const result = await Message.updateMany(
        { sender: data.sender, receiver: data.receiver, seen: false },
        { seen: true }
      );

      console.log(`Updated ${result.modifiedCount} messages to seen`);

      if (result.modifiedCount > 0) {
        // Fetch các tin nhắn đã cập nhật để emit
        const updatedMessages = await Message.find({
          sender: data.sender,
          receiver: data.receiver,
        });

        console.log("Emitting updated messages:", updatedMessages);

        // Emit sự kiện với toàn bộ tin nhắn đã cập nhật
        io.emit("messages_seen", {
          sender: data.sender,
          receiver: data.receiver,
          messages: updatedMessages,
        });
      }
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
