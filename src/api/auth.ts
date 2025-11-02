import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

const FILENAME = "user.json";

export type AuthStatus =
    | { isAuthenticated: false }
    | {
          isAuthenticated: true;
          user: { name: string };
      };

export const getUser = createServerFn().handler<Promise<AuthStatus>>(
    async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const filePath = path.join(process.cwd(), FILENAME);
            const data = await readFile(filePath, "utf8");
            const user = JSON.parse(data);
            return user.name
                ? { isAuthenticated: true, user }
                : { isAuthenticated: false };
        } catch (error) {
            console.error("Error reading JSON file:", error);
            return { isAuthenticated: false };
        }
    },
);

export const signIn = createServerFn({ method: "POST" })
    .inputValidator((data) => data as string)
    .handler(async ({ data }) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const filePath = path.join(process.cwd(), FILENAME);
        const jsonString = JSON.stringify({ name: data }, null, 4);
        await writeFile(filePath, jsonString, "utf8");
    });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const filePath = path.join(process.cwd(), FILENAME);
    const jsonString = JSON.stringify({}, null, 4);
    await writeFile(filePath, jsonString, "utf8");
});

export const authQueries = {
    all: ["auth"],
    user() {
        return queryOptions({
            queryKey: [...this.all, "user"],
            queryFn: getUser,
        });
    },
};
