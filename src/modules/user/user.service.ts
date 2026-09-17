import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB= async (payload: IUser)=>{

    const { name, email, password, age } = payload;

    const hashPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(`
           INSERT INTO users (name,email,password,age)
           VALUES($1,$2,$3,$4) RETURNING *
      `, [name, email, hashPassword, age]
    );
    delete result.rows[0].password;
      return result;
    // console.log(result.rows[0]);
};

const getAllUsersFromDB = async ()=>{
     const result = await pool.query(`
            SELECT * FROM users;
        `)
     return result;
}

const getUserByIdFromDB = async(id: string) =>{
 const result = await pool.query(`
      SELECT * FROM users WHERE id = $1
      `, [id]);
     return result;
}

const updateUserByIdFromDB = async(id: string, payload: Partial<IUser>)=>{
    const { name, password, age, is_active } = payload;
     const result = await pool.query(`
            UPDATE users
             SET
              name = COALESCE($1, name),
               password = COALESCE($2, password),
                age = COALESCE($3, age),
                is_active = COALESCE($4, is_active)

             WHERE id = $5 RETURNING *
        `, [name, password, age, is_active, id]);
        return result;

    console.log(result.rows[0]);
}

const deleteUserByIdFromDB = async(id: string)=>{
    const result = await pool.query(`
              DELETE FROM users 
               WHERE id = $1 RETURNING *
          `,[id]);
return result;
          console.log(result)
}

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    updateUserByIdFromDB,
    deleteUserByIdFromDB
}