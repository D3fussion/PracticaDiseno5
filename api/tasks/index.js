import { connectToDatabase } from "../../utils/db.js";
import Task from "../../models/Task.js";

export default async function handler(req, res) {
    await connectToDatabase();

    const { method } = req;

    switch (method) {
        case "GET":
            try {
                const tasks = await Task.find({});
                return res.status(200).json({ success: true, data: tasks });
            } catch (error) {
                console.log(error);
                return res
                    .status(500)
                    .json({ success: false, error: "Error al obtener tareas" });
            }

        case "POST":
            try {
                const newTask = await Task.create(req.body);
                return res.status(201).json({ success: true, data: newTask });
            } catch (error) {
                console.log(error);
                return res
                    .status(400)
                    .json({ success: false, error: "Error al crear la tarea" });
            }

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Método ${method} no permitido`);
    }
}
