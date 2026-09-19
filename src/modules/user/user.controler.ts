import type { Request, Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendRespons";

const createUser =  async (req: Request, res: Response) => {
  // console.log(req.body);

  try {
    const result = await userService.createUserIntoDB(req.body);

    res.status(201).json({
      message: "User Created Successfully",
      data: result.rows[0]
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error
    });
  }
}

const getAllUsers = async (req: Request, res: Response) => {
  console.log("Controller",req.user);
  try {
    const result = await userService.getAllUsersFromDB();
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Users created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
}

const getUserById = async (req: Request, res: Response) => { 
  const { id } = req.params;
  // console.log(id);
  try {
   const result = await userService.getUserByIdFromDB(id as string);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "User ID retrieved successfully",
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error
    });
  }
}

const updateUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
   
    const result = await userService.updateUserByIdFromDB(id as string, req.body);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "User ID Update successfully",
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error
    }); 
  }
}

const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserByIdFromDB(id as string);

            if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: []
      });
    }

           res.status(200).json({
      success: true,
      message: "User ID deleted successfully",
      data: result.rows[0]
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error
    });
  }
} 

export const userController = {
    createUser,
    getAllUsers,
    getUserById ,
    updateUserById,
    deleteUserById
  }