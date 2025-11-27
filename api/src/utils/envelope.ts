// -------------------------------
// src/utils/envelope.ts
// -------------------------------
export function buildSuccess(
    data: any, 
    requestId?: string,
    extraMeta: Record<string, any> = {}
) {
    return {
        success: true,
        data,
        error: null,
        meta: {
            requestId: requestId || null,
            timestamp: new Date().toISOString(),
            ...extraMeta,
        },
    };
}


export function buildError(
    code: string,
    message: string,
    details: any = null,
    requestId?: string
) {
    return {
        success: false,
        data: null,
        error: {
            code,
            message,
            details,
        },
        meta: {
            requestId: requestId || null,
            timestamp: new Date().toISOString(),
        },
    };
}
