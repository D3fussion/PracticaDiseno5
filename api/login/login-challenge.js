import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { connectToDatabase } from "../../utils/db.js";
import Login from "../../models/Login.js";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Método no permitido" });

    const { email } = req.body;

    try {
        await connectToDatabase();

        const user = await Login.findOne({ email });

        if (!user || !user.passkeys || user.passkeys.length === 0) {
            return res
                .status(400)
                .json({
                    error: "Usuario no encontrado o no tiene dispositivos registrados",
                });
        }

        const allowCredentials = user.passkeys.map((passkey) => ({
            id: isoBase64URL.fromBuffer(new Uint8Array(passkey.credentialID)),
            type: "public-key",
            transports: ["internal"],
        }));

        const options = await generateAuthenticationOptions({
            rpID: "localhost",
            allowCredentials,
            userVerification: "preferred",
        });

        user.currentChallenge = options.challenge;
        await user.save();

        return res.status(200).json(options);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Error al generar el reto de login" });
    }
}
