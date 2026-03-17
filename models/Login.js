import mongoose from "mongoose";

const LoginSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Se necesita un email"],
        },
        password: {
            type: String,
            required: [true, "Se necesita una contraseña"],
        },
        currentChallenge: {
            type: String,
        },
        passkeys: [
            {
                credentialID: Buffer,
                credentialPublicKey: Buffer,
                counter: Number,
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.models.Login || mongoose.model("Login", LoginSchema);
