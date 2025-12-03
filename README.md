# ChatTogether 💬

A real-time chat application built with React, Node.js, Socket.io, and MongoDB. ChatTogether provides a seamless messaging experience with message history, read receipts, and a beautiful modern UI.

![ChatTogether](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-19.1.0-61dafb)
![Node.js](https://img.shields.io/badge/node.js-express-green)
![Socket.io](https://img.shields.io/badge/socket.io-4.8.1-black)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-green)

## ✨ Features

- 🚀 **Real-time messaging** - Instant message delivery using Socket.io
- 📜 **Message history** - Persistent message storage with MongoDB
- ✅ **Read receipts** - See when messages are read with double check marks
- 🎨 **Modern UI** - Beautiful gradient design with Tailwind CSS
- 💬 **User-to-user chat** - Direct messaging between users
- 📱 **Responsive design** - Works on all screen sizes
- ⚡ **Auto-scroll** - Automatically scrolls to newest messages
- 🔔 **Active status** - Shows user activity status

## 🛠️ Technology Stack

### Frontend
- **React** (v19.1.0) - UI framework
- **Vite** - Build tool and dev server
- **Socket.io Client** (v4.8.1) - Real-time communication
- **Axios** - HTTP client for API requests
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **ESLint** - Code linting

### Backend
- **Node.js** with Express (v5.1.0) - Server framework
- **Socket.io** (v4.8.1) - WebSocket communication
- **MongoDB** with Mongoose (v8.16.0) - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB Atlas account** or local MongoDB instance

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/MakitJenamin/ChatTogether.git
cd ChatTogether
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
```

Replace `your_mongodb_connection_string` with your MongoDB Atlas connection string or local MongoDB URI.

### 3. Setup the Client

```bash
cd ../client
npm install
```

## 🎮 Running the Application

### Start the Server

```bash
cd server
node server.js
```

The server will start on `http://localhost:8000`

### Start the Client

Open a new terminal window:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

## 📖 Usage

1. **Open the application** in your browser at `http://localhost:5173`
2. **Enter your User ID** - This identifies you in the chat
3. **Enter Receiver ID** - The ID of the person you want to chat with
4. **Click "Bắt đầu chat"** (Start Chat) to begin messaging
5. **Type your message** in the input field at the bottom
6. **Press Enter or click Send** to send the message

### Multiple Users

To simulate multiple users, open the application in different browser windows or incognito tabs with different User IDs.

## 🔌 API Endpoints

### GET /api/messages/:sender/:receiver

Retrieves message history between two users.

**Parameters:**
- `sender` - The sender's user ID
- `receiver` - The receiver's user ID

**Response:**
```json
[
  {
    "_id": "message_id",
    "sender": "user1",
    "receiver": "user2",
    "content": "Hello!",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "seen": false
  }
]
```

## 🔌 Socket.io Events

### Client to Server

- **`send_message`** - Sends a new message
  ```javascript
  {
    sender: "user_id",
    receiver: "receiver_id",
    content: "message_text"
  }
  ```

- **`mark_seen`** - Marks messages as read
  ```javascript
  {
    sender: "sender_id",
    receiver: "receiver_id"
  }
  ```

### Server to Client

- **`receive_message`** - Receives a new message
- **`messages_seen`** - Notification when messages are marked as seen

## 📁 Project Structure

```
ChatTogether/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source files
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Application styles
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # React entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── eslint.config.js   # ESLint configuration
│
└── server/                # Backend Node.js application
    ├── server.js          # Express server and Socket.io setup
    ├── package.json       # Backend dependencies
    └── .env               # Environment variables (not in repo)
```

## 🗃️ Database Schema

### Message Schema

```javascript
{
  sender: String,          // User ID of the sender
  receiver: String,        // User ID of the receiver
  content: String,         // Message content
  timestamp: Date,         // When the message was sent (default: now)
  seen: Boolean           // Whether the message has been read (default: false)
}
```

## 🎨 UI Features

- **Gradient theme** - Beautiful purple to pink gradient throughout
- **Smooth animations** - Fade-in animations for messages
- **Message bubbles** - Distinct styling for sent and received messages
- **Timestamps** - Shows time for each message in local format
- **Read indicators** - Double check marks for seen messages
- **Auto-scroll** - Automatically scrolls to the latest message
- **Responsive layout** - Adapts to different screen sizes

## 🔧 Development

### Linting the Client

```bash
cd client
npm run lint
```

### Building the Client for Production

```bash
cd client
npm run build
```

### Preview Production Build

```bash
cd client
npm run preview
```

## 🛡️ Environment Variables

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `PORT` | Server port number | `8000` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source. Please check with the repository owner for licensing details.

## 👥 Authors

- **MakitJenamin** - *Initial work* - [GitHub](https://github.com/MakitJenamin)

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.io for real-time communication capabilities
- MongoDB team for the database solution
- Tailwind CSS for the beautiful styling utilities

## 📞 Support

If you have any questions or run into issues, please open an issue on the [GitHub repository](https://github.com/MakitJenamin/ChatTogether/issues).

---

**Made with ❤️ and ☕ by MakitJenamin**
