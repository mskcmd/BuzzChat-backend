const express = require("express");
const cors = require("cors");
const { chats } = require("./Dummy/data");
require('dotenv').config();
const { connectDB } = require("./config/mongoDb");
const { notFound, errorHandler } = require("./middleware/errorHandlers");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");

const app = express();

// Connect to the database
connectDB();

// CORS middleware
app.use(cors({
  origin: process.env.ORIGIN || '*', // Replace '*' with specific origin if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
const Server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket.IO setup
const io = require("socket.io")(Server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN || '*', // Match the CORS origin for Socket.IO
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
