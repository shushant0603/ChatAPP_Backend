import { Request, Response } from "express";

/**
 * POST /friends/request
 */
export const sendRequest = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Friend request sent (dummy)",
    data: {
      receiverId: req.body.receiverId,
    },
  });
};

/**
 * GET /friends/requests
 */
export const getRequests = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Incoming friend requests (dummy)",
    data: [],
  });
};

/**
 * POST /friends/accept
 */
export const acceptRequest = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Friend request accepted (dummy)",
    data: {
      requestId: req.body.requestId,
    },
  });
};

/**
 * POST /friends/reject
 */
export const rejectRequest = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Friend request rejected (dummy)",
    data: {
      requestId: req.body.requestId,
    },
  });
};
