import http2 from 'http2';
import fs from 'fs';
import proxy from 'http2-proxy';
import { cert, privateKey } from './localhost-certs';

type StartHttp2ProxyServerParams = {
    originalPort: number;
    originalHost: string;
    port: number;
}

export function startHttp2ProxyServer({
    originalPort,
    originalHost,
    port,
}: StartHttp2ProxyServerParams) {
    const ht2Server = http2.createSecureServer({
        key: privateKey,
        cert,
    });

    ht2Server.on('request', (req, res) => {
        proxy.web(req, res, {
                hostname: originalHost,
                port: originalPort,
            }, (err, req, res) => {
                if (err) {
                    console.error('proxy error', err);
                    res.statusCode = 502;
                    res.end(err.toString());
                }
            }
        )
    })
    ht2Server.on('upgrade', (req, socket, head) => {
        proxy.ws(req, socket, head, {
                hostname: originalHost,
                port: originalPort,
            }, (err, req, socket, head) => {
                if (err) {
                    console.error('proxy error', err)
                    socket.destroy()
                }
            }
        )
    })

    ht2Server.listen(port);
}
