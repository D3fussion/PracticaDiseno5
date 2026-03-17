import { verificarToken } from "../../utils/auth.js";

export default async function handler(req, res) {
    if (req.method !== "GET")
        return res.status(405).json({ error: "Método no permitido" });

    try {
        const decodificado = await verificarToken(req);

        return res.status(200).json({
            autenticado: true,
            usuario: {
                email: decodificado.email,
                id: decodificado.id,
            },
        });
    } catch (error) {
        return res
            .status(401)
            .json({ autenticado: false, error: "No autorizado" });
    }
}
