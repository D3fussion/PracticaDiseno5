import {
    createQuery,
    createMutator,
    invalidateKeys,
    apiClient,
} from "./client.js";

export const tasksQuery = createQuery("");

export const createTaskMutator = createMutator(
    async ({ data: { title, description, completed } }) => {
        const response = await apiClient
            .post("", { json: { title, description, completed } })
            .json();

        invalidateKeys("");

        return response.data;
    },
);

export const updateTaskMutator = createMutator(
    async ({ data: { id, data } }) => {
        const response = await apiClient.put(String(id), { json: data }).json();

        return response.data;
    },
);

export const deleteTaskMutator = createMutator(async ({ data: { id } }) => {
    const response = await apiClient.delete(String(id)).json();

    invalidateKeys("");
    return response.data;
});
