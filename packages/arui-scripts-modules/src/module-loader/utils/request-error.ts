type XhrResponseInfo = Pick<XMLHttpRequest, 'status' | 'statusText'>;

// ошибка неуспешного ответа сервера.
// statusText может быть пустым, поэтому в сообщение всегда попадают код статуса и адрес запроса
export function createResponseError(description: string, url: string, xhr: XhrResponseInfo) {
    const status = xhr.statusText ? `${xhr.status} ${xhr.statusText}` : `${xhr.status}`;

    return new Error(`${description} failed: ${url} responded with ${status}`);
}

// ошибка сетевого сбоя
// браузер в этом случае не отдает ни статуса, ни statusText,
export function createNetworkError(description: string, url: string) {
    return new Error(
        `${description} failed: network error while requesting ${url}. Check that the host is available and CORS is configured`,
    );
}

// Ошибка разбора ответа
// без нее ошибка JSON.parse выбрасывается из обработчика xhr и промис запроса не резолвится
export function createParseError(description: string, url: string, error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);

    return new Error(`${description} failed: ${url} returned invalid JSON (${reason})`);
}
