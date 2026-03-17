import {
    tasksQuery,
    createTaskMutator,
    updateTaskMutator,
    deleteTaskMutator,
} from "../fetch/fetch.js";

import { seleccionarTareaEnLista } from "../main.js";

function renderizarLista(ulId, tareas) {
    const ul = document.getElementById(ulId);
    if (!ul) return;

    const template = document.getElementById("tarea-lista-template");
    ul.innerHTML = "";

    tareas.forEach((tarea, index) => {
        const clone = template.content.cloneNode(true);
        const li = clone.firstElementChild;

        li.className =
            index === 0 ? "tarea-lista-activa" : "tarea-lista-inactiva";
        li.dataset.id = tarea._id;
        li.querySelector(".tarea-lista-titulo").textContent = tarea.title;
        li.querySelector(".tarea-lista-fecha").textContent = new Date(
            tarea.createdAt,
        ).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

        li.addEventListener("click", () => {
            seleccionarTareaEnLista(tarea);
        });

        ul.appendChild(clone);
    });
}

function actualizarContadores(cantidad) {
    const texto = `${cantidad} ${cantidad === 1 ? "Nota" : "Notas"}`;
    for (const id of ["cantidadNotas", "cantidadNotasDesktop"]) {
        const el = document.getElementById(id);
        if (el) el.textContent = texto;
    }
}

tasksQuery.subscribe(({ loading, error, data }) => {
    const loadingOverlay = document.getElementById("loadingOverlay");

    if (loading) {
        console.log("🔵 [GET] Cargando la lista de tareas...");
        loadingOverlay?.classList.remove("hidden");
        return;
    }
    if (error) {
        console.error("🔴 [GET] Error al cargar las tareas:", error);
        loadingOverlay?.classList.add("hidden");
        return;
    }
    if (data) {
        loadingOverlay?.classList.add("hidden");
        console.log("🟢 [GET] Tareas actualizadas:", data);

        if (data.length === 0) {
            createTaskMutator.mutate({
                title: "Tarea 1",
                description: "",
                completed: false,
            });
            return;
        }

        renderizarLista("listaTareas", data);
        renderizarLista("listaTareasDrawer", data);
        actualizarContadores(data.length);

        seleccionarTareaEnLista(data[0]);
    }
});

createTaskMutator.subscribe(({ loading, error, data }) => {
    const loadingCreateTask = document.getElementById("loadingCreateTask");

    if (loading) {
        console.log("🟡 [POST] Guardando nueva tarea...");
        if (loadingCreateTask) loadingCreateTask.style.display = "flex";
        return;
    }
    if (error) {
        console.error("🔴 [POST] Error al crear la tarea:", error);
        if (loadingCreateTask) loadingCreateTask.style.display = "none";
        return;
    }
    if (data) {
        console.log("🟢 [POST] Tarea creada con éxito:", data);
        if (loadingCreateTask) loadingCreateTask.style.display = "none";

        renderizarLista("listaTareas", data);
        renderizarLista("listaTareasDrawer", data);
        actualizarContadores(data.length);

        seleccionarTareaEnLista(data[data.length - 1]);
    }
});

updateTaskMutator.subscribe(({ loading, error, data }) => {
    const tituloActualContainer = document.getElementById(
        "tituloNotaContainer",
    );

    if (loading) {
        console.log("🟡 [PUT] Actualizando la tarea...");

        tituloActualContainer
            .querySelector(".loading")
            .classList.remove("hidden");

        return;
    }
    if (error) {
        console.error("🔴 [PUT] Error al actualizar la tarea:", error);
        tituloActualContainer.querySelector(".loading").classList.add("hidden");
        return;
    }
    if (data) {
        console.log("🟢 [PUT] Tarea actualizada con éxito:", data);

        tituloActualContainer.querySelector(".loading").classList.add("hidden");

        renderizarLista("listaTareas", data);
        renderizarLista("listaTareasDrawer", data);
        actualizarContadores(data.length);
    }
});

deleteTaskMutator.subscribe(({ loading, error, data }) => {
    const loadingCreateTask = document.getElementById("loadingCreateTask");

    if (loading) {
        if (loadingCreateTask) loadingCreateTask.style.display = "flex";

        return;
    }
    if (error) {
        if (loadingCreateTask) loadingCreateTask.style.display = "none";
        return;
    }
    if (data) {
        if (loadingCreateTask) loadingCreateTask.style.display = "none";

        renderizarLista("listaTareas", data);
        renderizarLista("listaTareasDrawer", data);
        actualizarContadores(data.length);

        seleccionarTareaEnLista(data[0]);
    }
});
