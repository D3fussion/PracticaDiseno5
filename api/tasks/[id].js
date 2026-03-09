import { connectToDatabase } from "../../utils/db.js";
import Task from "../../models/Task.js";

export default async function handler(req, res) {
    await connectToDatabase();

    const { method } = req;

    const { id } = req.query;

    switch (method) {
        case "PUT":
            try {
                if (!req.body) {
                    return res.status(400).json({
                        success: false,
                        error: "No se envio el cuerpo de la peticion",
                    });
                }

                const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true,
                });

                if (!updatedTask) {
                    return res
                        .status(404)
                        .json({ success: false, error: "Tarea no encontrada" });
                }

                return res
                    .status(200)
                    .json({ success: true, data: updatedTask });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    success: false,
                    error: "Error al actualizar la tarea",
                });
            }

        case "DELETE":
            try {
                const deletedTask = await Task.findByIdAndDelete(id);

                if (!deletedTask) {
                    return res
                        .status(404)
                        .json({ success: false, error: "Tarea no encontrada" });
                }

                const tasks = await Task.find({});

                return res.status(200).json({ success: true, data: tasks });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    success: false,
                    error: "Error al eliminar la tarea",
                });
            }

        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            return res
                .status(405)
                .end(`Método ${method} no permitido en esta ruta`);
    }
}
