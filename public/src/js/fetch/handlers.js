import {
    createTaskMutator,
    updateTaskMutator,
    deleteTaskMutator,
} from "./fetch.js";

async function handleCreate(data) {
    await createTaskMutator.mutate({
        data: data,
    });
}

async function handleUpdate(taskId, data) {
    await updateTaskMutator.mutate({
        id: taskId,
        data: data,
    });
}

async function handleDelete(taskId) {
    await deleteTaskMutator.mutate({
        id: taskId,
    });
}
