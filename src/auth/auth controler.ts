import type { Request, Response } from "express";
import { authService } from "./auth.service";


const loginUser = async(req: Request, res:Response)=>{
  
  try{
      const result = await authService.loginUserIntoDB(req.body);

      const { refreshToken} = result;

      res.cookie("refreshToken", refreshToken, {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      });

       res.status(200).json({
      success: true,
      message: "Profile login successfully",
      data: result
    });
    } catch(error:any){
        res.status(500).json({
      message: error.message,
      error: error    
    }
  )
}
}

export const authControler = {
    loginUser
}