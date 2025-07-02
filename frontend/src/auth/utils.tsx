// import and export token from local storage

import { Token } from "@/api-client/models/Token";
import { DefaultConfig, Configuration } from "@/api-client/runtime";

const isBrowser = typeof localStorage !== "undefined";

export const getToken = (): Token | null => {
    if (!isBrowser) return null;

    try {
        const tokenStr = localStorage.getItem("token");
        if (!tokenStr) return null;
        return JSON.parse(tokenStr) as Token;
    } catch (error) {
        console.error("Error parsing token from localStorage:", error);
        return null;
    }
};

export const setToken = (token: Token): void => {
    if (!isBrowser) return;

    try {
        localStorage.setItem("token", JSON.stringify(token));
    } catch (error) {
        console.error("Error saving token to localStorage:", error);
        throw error;
    }
};

export const clearToken = (): void => {
    if (!isBrowser) return;

    try {
        localStorage.removeItem("token");
    } catch (error) {
        console.error("Error clearing token from localStorage:", error);
        throw error;
    }
};

export const getConfig = (): Configuration => {
    const token = getToken();
    const basePath = process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";

    return new Configuration({
        ...(token && { accessToken: "Bearer " + token.accessToken }),
        basePath: basePath,
    });
};
