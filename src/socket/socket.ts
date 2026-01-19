import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;
const userSocketMap = new Map<string, string>();

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
     userSocketMap.set(userId, socket.id);
console.log("🧩 userSocketMap:", userSocketMap);

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
       userSocketMap.delete(userId);
      console.log("🔴 Socket disconnected:", socket.id);
    });



    // ===============================
// 📹 VIDEO CALL: START
// ===============================
socket.on("start-video-call", async ({ chatId }: { chatId: string }) => {
   if (!chatId || chatId === "null") {
    console.log("❌ Invalid chatId:", chatId);
    return;
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat || !chat.participants.includes(userId)) return;

  // 👤 receiver = jo caller nahi hai
  const receiverId = chat.participants.find((id) => id !== userId);
  if (!receiverId) return;

  const receiverSocketId = userSocketMap.get(receiverId);

  if (!receiverSocketId) {
    console.log("❌ Receiver offline");
    return;
  }

  console.log(`📞 Call from ${userId} to ${receiverId}`);

  io.to(receiverSocketId).emit("incoming-video-call", {
    chatId,
    from: userId,
  });
});

// ===============================
// ✅ VIDEO CALL: ACCEPT
// ===============================
socket.on("accept-video-call",async ({ chatId }: { chatId: string }) => {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) return;

  const callerId = chat.participants.find((id) => id !== userId);
  if (!callerId) return;

  const callerSocketId = userSocketMap.get(callerId);
  if (!callerSocketId) return;

  io.to(callerSocketId).emit("call-accepted", { chatId });
});

// ===============================
// ❌ VIDEO CALL: REJECT
// ===============================
socket.on("reject-video-call", async ({ chatId }: { chatId: string }) => {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) return;

  const callerId = chat.participants.find((id) => id !== userId);
  if (!callerId) return;

  const callerSocketId = userSocketMap.get(callerId);
  if (!callerSocketId) return;

  io.to(callerSocketId).emit("call-rejected", { chatId });
});

// ===============================
// ☎️ VIDEO CALL: END
// ===============================
socket.on("end-video-call", async ({ chatId }: { chatId: string }) => {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) return;

  chat.participants.forEach((participantId) => {
    if (participantId === userId) return;

    const socketId = userSocketMap.get(participantId);
    if (socketId) {
      io.to(socketId).emit("call-ended", { chatId });
    }
  });
});
socket.on(
  "webrtc-offer",
  async ({ chatId, offer }: { chatId: string; offer: any }) => {
    if (!chatId || !offer) return;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) return;

    const receiverId = chat.participants.find((id) => id !== userId);
    if (!receiverId) return;

    const receiverSocketId = userSocketMap.get(receiverId);
    if (!receiverSocketId) {
      console.log("❌ Receiver offline (offer)");
      return;
    }

    io.to(receiverSocketId).emit("webrtc-offer", { offer });
  }
);
socket.on(
  "webrtc-answer",
  async ({ chatId, answer }: { chatId: string; answer: any }) => {
    if (!chatId || !answer) return;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) return;

    const callerId = chat.participants.find((id) => id !== userId);
    if (!callerId) return;

    const callerSocketId = userSocketMap.get(callerId);
    if (!callerSocketId) {
      console.log("❌ Caller offline (answer)");
      return;
    }

    io.to(callerSocketId).emit("webrtc-answer", { answer });
  }
);

socket.on(
  "ice-candidate",
  async ({ chatId, candidate }: { chatId: string; candidate: any }) => {
    if (!chatId || !candidate) return;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) return;

    chat.participants.forEach((participantId) => {
      if (participantId === userId) return;

      const socketId = userSocketMap.get(participantId);
      if (socketId) {
        io.to(socketId).emit("ice-candidate", { candidate });
      }
    });
  }
);

  });

  return io;
};
