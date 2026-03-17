import jwt from "jsonwebtoken";
import { connectToDatabase } from "./db.js";
import Login from "../models/Login.js";

export async function verificarToken(req) {
    let token = req.cookies.authToken;

    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new Error("No autorizado. Falta el token.");

    try {
        const decodificado = jwt.verify(
            token,
            process.env.JWT_SECRET || "secreto_desarrollo",
        );

        await connectToDatabase();
        const user = await Login.findOne({ email: decodificado.email });

        if (!user) {
            throw new Error("Usuario no encontrado en la base de datos.");
        }

        return decodificado;
    } catch (error) {
        console.error("Error al verificar el token:", error);
        throw error;
    }
}
