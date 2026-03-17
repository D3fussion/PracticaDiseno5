import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { connectToDatabase } from "../../utils/db.js";
import Login from "../../models/Login.js";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Método no permitido" });

    const { email, response } = req.body;

    try {
        await connectToDatabase();

        const user = await Login.findOne({ email });
        if (!user)
            return res.status(400).json({ error: "Usuario no encontrado" });

        const expectedChallenge = user.currentChallenge;

        const passkey = user.passkeys.find(
            (pk) =>
                isoBase64URL.fromBuffer(new Uint8Array(pk.credentialID)) ===
                response.id,
        );

        if (!passkey) {
            return res
                .status(400)
                .json({ error: "Credencial no reconocida para este usuario" });
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: process.env.ORIGIN || "http://localhost:3000",
            expectedRPID: process.env.RPID || "localhost",
            credential: {
                id: passkey.credentialID.toString("base64url"),
                publicKey: new Uint8Array(passkey.credentialPublicKey),
                counter: passkey.counter || 0,
            },
        });

        if (verification.verified) {
            passkey.counter = verification.authenticationInfo.newCounter;
            user.currentChallenge = null;
            await user.save();

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

            return res.status(200).json({
                message: "Login biométrico con exito!",
                sessionToken,
            });
        }
    } catch (error) {
        console.error(error);
        return res
            .status(401)
            .json({ error: "La verificación de la huella falló" });
    }
}
