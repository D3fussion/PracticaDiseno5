import ky from "ky";
import { atom } from "nanostores";
import { nanoquery } from "@nanostores/query";

export const retryMessage = atom("");

export const apiClient = ky.create({
    prefixUrl: "/api/tasks",
    retry: { limit: 3 },
    hooks: {
        beforeRetry: [
            ({ retryCount, options }) => {
                retryMessage.set(
                    `Fallo de red. Intento ${retryCount} de ${options.retry.limit}...`,
                );
            },
        ],
        beforeRequest: [() => retryMessage.set("")],
    },
});

export const [createQuery, createMutator, { mutateCache, invalidateKeys }] =
    nanoquery({
        fetcher: async (key) => {
            const response = await apiClient.get(key).json();
            return response.data;
        },
    });
