import { Response } from "express";
import prisma from "../../lib/prisma";
import { AuthRequest } from "../../middleware/Auth.middleware";

export const startChat = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.userId;          // ✅ token se
    const { receiverId } = req.body;      // ✅ frontend se

    // 🔐 basic guards
    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "ReceiverId is required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    // 🔍 fetch sender & receiver (friends + blocks)
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        select: {
          friends: true,
          // blockedUsers: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          friends: true,
          // blockedUsers: true,
        },
      }),
    ]);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

   

    // 🤝 friend check (both must have each other)
    const areFriends =
      sender?.friends.includes(receiverId) &&
      receiver.friends.includes(senderId);

    if (!areFriends) {
      return res.status(403).json({
        success: false,
        message: "You can message only your friends",
      });
    }

    // 💬 check existing chat
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          hasEvery: [senderId, receiverId],
        },
      },
    });

    // ➕ create if not exists
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participants: [senderId, receiverId],
        },
      });
    }

    // ✅ success
    return res.status(200).json({
      success: true,
      chatId: chat.id,
    });
  } catch (error) {
    console.error("Start chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start chat",
    });
  }
};
export const getAllchat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;          // ✅ token se

    // 🔐 basic guards
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 💬 fetch all chats of the user
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          has: userId,
        },
      },
    });

    // ✅ success
    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get all chats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
}
export const getMessagesByChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const chatId = Array.isArray(id) ? id[0] : id; // ✅ Ensure it's a string

    // 1️⃣ Guard: check user is authenticated
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    if (!chatId) {
      return res.status(400).json({ 
        success: false,
        message: "Chat ID is required" 
      });
    }

    // 2️⃣ Check chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: "Chat not found" 
      });
    }

    // 3️⃣ Check user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "Not allowed" 
      });
    }

    // 4️⃣ Fetch messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ 
      success: true,
      messages 
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};
