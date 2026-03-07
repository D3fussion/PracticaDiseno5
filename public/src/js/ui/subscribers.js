import {
    tasksQuery,
    createTaskMutator,
    updateTaskMutator,
    deleteTaskMutator,
} from "../fetch/fetch.js";

tasksQuery.subscribe(({ loading, error, data }) => {
    if (loading) {
        console.log("🔵 [GET] Cargando la lista de tareas...");
    }
    if (error) {
        console.error("🔴 [GET] Error al cargar las tareas:", error);
    }
    if (data) {
        console.log("🟢 [GET] Tareas actualizadas:", data);
    }
});

createTaskMutator.subscribe(({ loading, error, data }) => {
    if (loading) {
        console.log("🟡 [POST] Guardando nueva tarea...");
    }
    if (error) {
        console.error("🔴 [POST] Error al crear la tarea:", error);
    }
    if (data) {
        console.log("🟢 [POST] Tarea creada con éxito:", data);
    }
});

updateTaskMutator.subscribe(({ loading, error, data }) => {
    if (loading) {
        console.log("🟡 [PUT] Actualizando la tarea...");
    }
    if (error) {
        console.error("🔴 [PUT] Error al actualizar la tarea:", error);
    }
    if (data) {
        console.log("🟢 [PUT] Tarea actualizada con éxito:", data);
    }
});

deleteTaskMutator.subscribe(({ loading, error, data }) => {
    if (loading) {
        console.log("🟡 [DELETE] Eliminando la tarea...");
    }
    if (error) {
        console.error("🔴 [DELETE] Error al eliminar la tarea:", error);
    }
    if (data) {
        console.log("🟢 [DELETE] Tarea eliminada con éxito:", data);
    }
});
