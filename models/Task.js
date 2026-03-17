import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Se necesita un titulo para la tarea"],
        },
        description: {
            type: String,
            default: "",
        },
        completed: {
            type: Boolean,
            default: false,
        },
        userEmail: {
            type: String,
            required: [true, "Se necesita un correo para la tarea"],
        },
    },
    { timestamps: true },
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
