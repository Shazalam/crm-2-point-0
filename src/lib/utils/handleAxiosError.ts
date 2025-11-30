import { AxiosError } from "axios";

export function handleAxiosError(err: unknown, defaultMessage: string): string {
 const error = err as AxiosError<{message?: string}>;
 return error.response?.data?.message || defaultMessage; 
}