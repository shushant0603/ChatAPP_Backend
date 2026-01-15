import { Response } from "express";
import prisma from "../lib/prisma"
import { AuthRequest } from "../middleware/Auth.middleware";
import { FriendRequestStatus } from "../types/friend.types";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    console.log("GetMe userId:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: req.userId,   // 👈 self user excluded
        },
      },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("GetAllUsers error:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
export const getAllFriends = async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.userId as string;

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ get my friends array
    const me = await prisma.user.findUnique({
      where: { id: myId },
      select: {
        friends: true,
      },
    });

    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ if no friends
    if (me.friends.length === 0) {
      return res.status(200).json({
        count: 0,
        friends: [],
      });
    }

    // 3️⃣ fetch friend details
    const friends = await prisma.user.findMany({
      where: {
        id: { in: me.friends },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(200).json({
      count: friends.length,
      friends,
    });
  } catch (error) {
    console.error("getAllFriends error:", error);
    return res.status(500).json({
      message: "Failed to fetch friends",
    });
  }
};
