import { isAxiosError } from "axios";

export const handleReactQueryApiCallError = (
    errorCount: number,
    error: Error,
): boolean => {
    if (isAxiosError(error) && error.status === 401) {
        return false;
    } else if (errorCount < 2) {
        return true;
    }
    return false;
};