import type { NextFunction, Request, Response } from "express";

const auth = () =>{
  return async  (req : Request,res : Response, next : NextFunction) =>{
    console.log("This is protected Route")
    console.log(req.headers.authorization);
    const token = req.headers.authorization;

    if(!token){
         res.status(401).json({
      success: false,
      message: "Unauthorized acces!!"
    });
    }
    next();
}
}

export default auth