import {
    tasksQuery,
    createTaskMutator,
    updateTaskMutator,
    deleteTaskMutator,
} from "./fetch/fetch.js";
import { checarSesion, iniciarLogin } from "./login/login.js";

import "./ui/subscribers.js";

export let tareaActual = null;

export function setTareaActual(tarea) {
    tareaActual = tarea;
}

export async function crearTaskHTML() {
    await createTaskMutator.mutate({
        title: "Tarea Nueva",
        description: "",
        completed: false,
    });
}

export async function guardarTareaActual() {
    if (!tareaActual) return;

    const datosActualizados = {
        title: document
            .getElementById("tituloNotaContainer")
            .querySelector(".titulo-nota").textContent,
        description: document.getElementById("descripcionNota").value,
    };

    await updateTaskMutator.mutate({
        id: tareaActual._id,
        data: datosActualizados,
    });
    tareaActual = { ...tareaActual, ...datosActualizados };
}

export function editarTituloActual() {
    const tituloActualContainer = document.getElementById(
        "tituloNotaContainer",
    );
    const tituloActual = tituloActualContainer
        .querySelector(".titulo-nota")
        .textContent.trim();
    const templateTitulo = document.getElementById("titulo-nota-template");
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
            if (!nuevoTitulo) nuevoTitulo = tituloActual;

            const templateTituloClone = templateTitulo.content.cloneNode(true);
            templateTituloClone.querySelector(".titulo-nota").textContent =
                nuevoTitulo;
            tituloActualContainer.innerHTML = "";
            tituloActualContainer.appendChild(templateTituloClone);

            if (tareaActual) {
                tareaActual.title = nuevoTitulo;
                updateTaskMutator.mutate({
                    id: tareaActual._id,
                    data: { title: nuevoTitulo },
                });
            }
        }
    });
}

export function anteriorTask() {
    const lista = tasksQuery.get()?.data;
    if (!lista || !tareaActual) return;
    const idx = lista.findIndex((t) => t._id === tareaActual._id);
    if (idx > 0) seleccionarTareaEnLista(lista[idx - 1]);
}

export function siguienteTask() {
    const lista = tasksQuery.get()?.data;
    if (!lista || !tareaActual) return;
    const idx = lista.findIndex((t) => t._id === tareaActual._id);
    if (idx < lista.length - 1) seleccionarTareaEnLista(lista[idx + 1]);
}

export function eliminarTaskActual() {
    if (!tareaActual) return;
    deleteTaskMutator.mutate({ id: tareaActual._id });
}

export async function cerrarSesion() {
    try {
        await fetch("/api/login/logout", {
            method: "POST",
        });
        window.location.reload();
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

export function seleccionarTareaEnLista(tarea) {
    const listaActual = tasksQuery.get()?.data;
    const tareaFresca =
        listaActual?.find((t) => String(t._id) === String(tarea._id)) ?? tarea;

    tareaActual = tareaFresca;

    for (const ulId of ["listaTareas", "listaTareasDrawer"]) {
        const ul = document.getElementById(ulId);
        if (!ul) continue;
        ul.querySelectorAll("li").forEach((li) => {
            li.className =
                li.dataset.id === String(tareaFresca._id)
                    ? "tarea-lista-activa"
                    : "tarea-lista-inactiva";
        });
    }

    document
        .getElementById("tituloNotaContainer")
        .querySelector(".titulo-nota").textContent = tareaFresca.title;
    document.getElementById("descripcionNota").value = tareaFresca.description;
}

window.crearTaskHTML = crearTaskHTML;
window.editarTituloActual = editarTituloActual;
window.anteriorTask = anteriorTask;
window.siguienteTask = siguienteTask;
window.eliminarTaskActual = eliminarTaskActual;
window.cerrarSesion = cerrarSesion;

function filtrarTareas(termino) {
    const query = termino.trim().toLowerCase();
    for (const ulId of ["listaTareas", "listaTareasDrawer"]) {
        const ul = document.getElementById(ulId);
        if (!ul) continue;
        ul.querySelectorAll("li").forEach((li) => {
            const titulo =
                li
                    .querySelector(".tarea-lista-titulo")
                    ?.textContent.toLowerCase() ?? "";
            li.style.display = titulo.includes(query) ? "" : "none";
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    iniciarLogin();
    const sesionOk = await checarSesion();

    let temporizadorGuardado;
    document.getElementById("descripcionNota").addEventListener("input", () => {
        clearTimeout(temporizadorGuardado);
        temporizadorGuardado = setTimeout(() => {
            guardarTareaActual();
        }, 1000);
    });

    document
        .getElementById("buscarNotas")
        ?.addEventListener("submit", (e) => e.preventDefault());
    document
        .getElementById("inputBuscarDrawer")
        ?.closest("form")
        ?.addEventListener("submit", (e) => e.preventDefault());

    const inputDesktop = document.getElementById("inputBuscarDesktop");
    const inputDrawer = document.getElementById("inputBuscarDrawer");

    function onBuscar(e) {
        const valor = e.target.value;
        if (e.target === inputDesktop && inputDrawer) inputDrawer.value = valor;
        if (e.target === inputDrawer && inputDesktop)
            inputDesktop.value = valor;
        filtrarTareas(valor);
    }

    inputDesktop?.addEventListener("input", onBuscar);
    inputDrawer?.addEventListener("input", onBuscar);

    inputDesktop?.addEventListener("search", onBuscar);
    inputDrawer?.addEventListener("search", onBuscar);
});
