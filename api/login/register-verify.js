import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { connectToDatabase } from "../../utils/db.js";
import Login from "../../models/Login.js";

export default async function handler(req, res) {
    const { email, response } = req.body;
    await connectToDatabase();

    const user = await Login.findOne({ email });
    const expectedChallenge = user.currentChallenge;

    try {
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: process.env.ORIGIN,
            expectedRPID: process.env.RPID,
        });

        if (verification.verified) {
            const { registrationInfo } = verification;
            user.passkeys.push({
                credentialID: Buffer.from(isoBase64URL.toBuffer(registrationInfo.credential.id)),
                credentialPublicKey: Buffer.from(
                    registrationInfo.credential.publicKey,
                ),
                counter: registrationInfo.credential.counter,
            });

            user.currentChallenge = null;
            await user.save();

            return res
                .status(200)
                .json({ message: "Huella registrada correctamente" });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
