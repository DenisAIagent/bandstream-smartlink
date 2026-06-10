import { getClient } from '@umami/api-client';

export default async function UmamiClient() {
    const client = getClient();
    const { ok, data, status, error } = await client.getWebsites();

    return <div>
        <h1>Umami Data:</h1>
        <pre>
            {JSON.stringify({
                ok,
                data,
                status,
                error
            }, null, 2)}
        </pre>
    </div>
}