import { generateRegistrationOptions } from "@simplewebauthn/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../../utils/db.js";
import Login from "../../models/Login.js";

export default async function handler(req, res) {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Faltan datos" });

    await connectToDatabase();

    let user = await Login.findOne({ email });

    if (user) {
        return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await Login.create({
        email,
        password: hashedPassword,
        passkeys: [],
    });

    const options = await generateRegistrationOptions({
        rpName: "Mi App Segura",
        rpID: "localhost",
        userID: new Uint8Array(Buffer.from(user._id.toString())),
        userName: user.email,
        attestationType: "none",
        authenticatorSelection: { userVerification: "preferred" },
    });

    user.currentChallenge = options.challenge;
    await user.save();

    res.status(200).json(options);
}
