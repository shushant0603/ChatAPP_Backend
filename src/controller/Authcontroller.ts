import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {};
export const login = async (req: Request, res: Response) => {};
export const logout = async (req: Request, res: Response) => {};
export const me = async (req: Request, res: Response) => {};

export const sendOtp = async (req: Request, res: Response) => {};
export const verifyOtp = async (req: Request, res: Response) => {};

export const forgotPassword = async (req: Request, res: Response) => {};
export const resetPassword = async (req: Request, res: Response) => {};

export const googleAuth = async (req: Request, res: Response) => {};
export const googleCallback = async (req: Request, res: Response) => {};
