import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { connectToDatabase } from "../../utils/db.js";
import Login from "../../models/Login.js";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Método no permitido" });

    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Faltan credenciales" });

    try {
        await connectToDatabase();

        const user = await Login.findOne({ email });
        if (!user)
            return res.status(400).json({ error: "Credenciales inválidas" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            return res.status(400).json({ error: "Credenciales inválidas" });

        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || "secreto_desarrollo",
            { expiresIn: "1h" },
        );

        const cookie = serialize("authToken", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600,
            path: "/",
        });

        res.setHeader("Set-Cookie", cookie);
        return res
            .status(200)
            .json({ message: "Login con contraseña exitoso", sessionToken });
    } catch (error) {
        return res.status(500).json({ error: "Error del servidor" });
    }
}
