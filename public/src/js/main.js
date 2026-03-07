// Funciones que se conectan a la API

async function obtenerTareas() {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
        throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`,
        );
    }

    console.log(response);

    const data = await response.json();

    console.log(data);

    if (!data.success) {
        throw new Error(data.error);
    }

    if (data.data.length === 0) {
        await crearTarea({
            title: "Nota 1",
            description: "",
            completed: false,
        });

        return await obtenerTareas();
    }

    return data.data;
}

async function crearTarea(tarea) {
    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tarea),
    });
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.data;
}

async function editarTarea(id, tarea) {
    const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tarea),
    });
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.data;
}

async function eliminarTarea(id) {
    const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.data;
}

// Funciones que se conectan al HTML

async function insertarTareasHTML(tareas) {
    const listaTareas = document.getElementById("listaTareas");
    const template = document.getElementById("tarea-lista-template");
    listaTareas.innerHTML = "";
    tareas.forEach((tarea, index) => {
        const clone = template.content.cloneNode(true);
        const li = clone.firstElementChild; // Necesario porque 'clone' es un DocumentFragment, no un nodo de elemento regular

        if (index == 0) {
            li.className = "tarea-lista-activa";
        } else {
            li.className = "tarea-lista-inactiva";
        }
        li.querySelector(".tarea-lista-titulo").textContent = tarea.title;
        li.querySelector(".tarea-lista-fecha").textContent = new Date(
            tarea.createdAt,
        ).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
        });

        li.addEventListener("click", () => {
            const activa = listaTareas.querySelector(".tarea-lista-activa");
            if (activa) {
                activa.className = "tarea-lista-inactiva";
            }
            li.className = "tarea-lista-activa";

            asignarTareaActual(tarea);
        });

        listaTareas.appendChild(clone);
    });
}

function asignarTareaActual(tarea) {
    tareaActual = tarea;
    document
        .getElementById("tituloNotaContainer")
        .querySelector(".titulo-nota").textContent = tarea.title;
    document.getElementById("descripcionNota").value = tarea.description;
}

async function guardarTareaActual() {
    if (!tareaActual) return;

    const datosActualizados = {
        title: document
            .getElementById("tituloNotaContainer")
            .querySelector(".titulo-nota").textContent,
        description: document.getElementById("descripcionNota").value,
    };
    tareaActual = await editarTarea(tareaActual._id, datosActualizados);
}

function editarTituloActual() {
    const tituloActualContainer = document.getElementById(
        "tituloNotaContainer",
    );
    const tituloActual = tituloActualContainer
        .querySelector(".titulo-nota")
        .textContent.trim();
    const templateTitulo = document.getElementById("titulo-nota-template");
    const templateTituloClone = templateTitulo.content.cloneNode(true);
    const template = document.getElementById("input-cambiar-titulo-template");
    const clone = template.content.cloneNode(true);
    const inputTitulo = clone.querySelector(".input-cambiar-titulo");
    inputTitulo.value = tituloActual;
    tituloActualContainer.innerHTML = "";
    tituloActualContainer.appendChild(clone);
    inputTitulo.focus();
    inputTitulo.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            let nuevoTitulo = inputTitulo.value.trim();
            if (!nuevoTitulo) {
                nuevoTitulo = tituloActual;
            }

            tituloActualContainer.innerHTML = "";
            templateTituloClone.querySelector(".titulo-nota").textContent =
                nuevoTitulo;
            tituloActualContainer.appendChild(templateTituloClone);
            tareaActual.title = nuevoTitulo;
            editarTarea(tareaActual._id, { title: nuevoTitulo });
        }
    });
}

// Main

let tareaActual = null;
let listaTareas = [];

document.addEventListener("DOMContentLoaded", async () => {
    listaTareas = await obtenerTareas();
    insertarTareasHTML(listaTareas);
    asignarTareaActual(listaTareas[0]);

    tareaActual = listaTareas[0];

    let temporizadorGuardado;

    document.getElementById("descripcionNota").addEventListener("input", () => {
        clearTimeout(temporizadorGuardado);

        temporizadorGuardado = setTimeout(() => {
            guardarTareaActual();
        }, 1000);
    });
});
