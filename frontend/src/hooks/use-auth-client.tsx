import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Configuration, ResponseError } from "@/api-client";
import { clearToken, getConfig, getToken } from "@/auth/utils";
import { useToast } from "./use-toast";

export function useAuthClient<T>(fetch: (config: Configuration) => Promise<T>) {
    const router = useRouter();
    const { toast } = useToast();
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        const fetchData = async () => {
            try {
                const config = getConfig();
                const data = await fetch(config);
                setData(data);
            } catch (e) {
                if (e instanceof ResponseError && e.response.status === 401) {
                    clearToken();
                    router.push("/login");
                } else {
                    toast({
                        title: "An error occurred while fetching data",
                        variant: "destructive",
                    });
                }
                if (e instanceof Error) {
                    setError(e);
                }
            }
        };
        fetchData();
    }, [fetch, router, toast]);

    return { data, setData, error };
}
