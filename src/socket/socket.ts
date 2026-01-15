import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // frontend
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // 🔐 AUTH (token se user nikaalo)
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("❌ No token, disconnecting socket");
      socket.disconnect();
      return;
    }

    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
      console.log("✅ Socket user:", userId);
    } catch (err) {
      console.log("❌ Invalid token");
      socket.disconnect();
      return;
    }

    // ===============================
    // 🔹 JOIN CHAT ROOM
    // ===============================
    socket.on("join-chat", (chatId: string) => {
      if (!chatId) return;

      socket.join(chatId);
      console.log(`👥 User ${userId} joined room ${chatId}`);
    });

    // ===============================
    // 🔹 SEND MESSAGE
    // ===============================
    socket.on(
      "send-message",
      async ({ chatId, text }: { chatId: string; text: string }) => {
        if (!chatId || !text) return;

        try {
          // 🔒 Optional safety: check user is participant
          const chat = await prisma.chat.findUnique({
            where: { id: chatId },
          });

          if (!chat || !chat.participants.includes(userId)) {
            return;
          }

          // 💾 Save message
          const message = await prisma.message.create({
            data: {
              chatId,
              senderId: userId,
              content: text,
            },
          });

          // 📢 Emit to room
          io.to(chatId).emit("receive-message", message);
        } catch (error) {
          console.error("Send message error:", error);
        }
      }
    );

    // ===============================
    // 🔴 DISCONNECT
    // ===============================
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};
