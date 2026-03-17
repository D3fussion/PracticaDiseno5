import { connectToDatabase } from "../../utils/db.js";
import Task from "../../models/Task.js";
import { verificarToken } from "../../utils/auth.js";

export default async function handler(req, res) {
    try {
        await connectToDatabase();

        const { method } = req;

        const decodificado = await verificarToken(req);

        switch (method) {
            case "GET":
                try {
                    const tasks = await Task.find({ userEmail: decodificado.email });
                    return res.status(200).json({ success: true, data: tasks });
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        success: false,
                        error: "Error al obtener tareas",
                    });
                }

            case "POST":
                try {
                    await Task.create({ ...req.body, userEmail: decodificado.email });
                    const tasks = await Task.find({ userEmail: decodificado.email });
                    return res.status(201).json({ success: true, data: tasks });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        success: false,
                        error: "Error al crear la tarea",
                    });
                }

            default:
                res.setHeader("Allow", ["GET", "POST"]);
                return res.status(405).end(`Método ${method} no permitido`);
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, error: error.message });
    }
}
