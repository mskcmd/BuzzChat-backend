const express = require("express");
const cors = require("cors");
const { chats } = require("./Dummy/data");
require("dotenv").config();
const { connectDB } = require("./config/mongoDb");
const { notFound, errorHandler } = require("./middleware/errorHandlers");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");

const app = express();

connectDB();

const corsOptions = {
  origin: process.env.ORIGIN || 'https://buzz-chat-frontend-tan.vercel.app',  // Allow specific origin
  credentials: true,  // Allow cookies, authorization headers, etc.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',  // Allowed methods
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',  // Allowed headers
  optionsSuccessStatus: 200  // For legacy browsers
};

// Enable preflight (OPTIONS) requests and apply CORS to all routes
app.use(cors(corsOptions));

// If you want to explicitly handle preflight OPTIONS requests (optional)
app.options('*', cors(corsOptions)); 

app.use(express.json());

app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const Server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = require("socket.io")(Server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN || "*", // Match the CORS origin for Socket.IO
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
