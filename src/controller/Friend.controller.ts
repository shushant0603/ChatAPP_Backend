import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/Auth.middleware";
import { FriendRequestStatus } from "../types/friend.types";

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
  const senderId = req.userId as string;
const receiverId = req.params.id as string;
    console.log("SendFriendRequest senderId:", senderId, "receiverId:", receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }

    const existing = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: FriendRequestStatus.PENDING,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Friend request sent",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to send friend request",
    });
  }
};


export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.userId as string;
    const requestId = req.params.id as string;

    if (!myId || !requestId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.receiverId !== myId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      return res.status(400).json({
        message: "Friend request already processed",
      });
    }

    const senderId = request.senderId;
    const receiverId = request.receiverId;

    // 🔁 Atomic operation
    await prisma.$transaction([
      // 1️⃣ update request status
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: FriendRequestStatus.ACCEPTED },
      }),

      // 2️⃣ add sender to receiver's friends
      prisma.user.update({
        where: { id: receiverId },
        data: {
          friends: {
            push: senderId,
          },
        },
      }),

      // 3️⃣ add receiver to sender's friends
      prisma.user.update({
        where: { id: senderId },
        data: {
          friends: {
            push: receiverId,
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("acceptFriendRequest error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
    });
  }
};


export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.userId as string;
    const requestId = req.params.id as string;

    if (!myId || !requestId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.receiverId !== myId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      return res.status(400).json({
        message: "Friend request already processed",
      });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.REJECTED },
    });

    return res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("rejectFriendRequest error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject friend request",
    });
  }
};


export const getReceivedRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const myId = req.userId as string;

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ get pending requests
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: myId,
        status: FriendRequestStatus.PENDING,
      },
      select: {
        id: true,
        senderId: true,
        createdAt: true,
      },
    });

    // 2️⃣ extract senderIds
    const senderIds = requests.map(r => r.senderId);

    // 3️⃣ fetch sender user details
    const senders = await prisma.user.findMany({
      where: {
        id: { in: senderIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // 4️⃣ merge request + sender
    const result = requests.map(req => ({
      id: req.id,
      createdAt: req.createdAt,
      sender: senders.find(u => u.id === req.senderId),
    }));

    return res.status(200).json({
      count: result.length,
      requests: result,
    });

  } catch (error) {
    console.error("getReceivedRequests error:", error);
    return res.status(500).json({
      message: "Failed to fetch friend requests",
    });
  }
};
