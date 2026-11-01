import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const MAGIC = Buffer.from('ARUICMP1');
const HEADER_SIZE = MAGIC.length + 64;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function digest(value: Buffer | string) {
    return crypto.createHash('sha256').update(value).digest();
}

type Options = {
    directory: string;
    version: string;
    readonly?: boolean;
    warn?: (error: unknown) => void;
};

export class CompressionCache {
    private pending = new Map<string, Promise<Buffer>>();

    private cleanup?: Promise<void>;

    private warned = false;

    stats = { hits: 0, misses: 0, writes: 0 };

    constructor(private options: Options) {}

    resetStats() {
        this.stats = { hits: 0, misses: 0, writes: 0 };
    }

    get(input: Buffer, identity: string, compress: () => Promise<Buffer>): Promise<Buffer> {
        const key = digest(
            JSON.stringify([this.options.version, identity, digest(input).toString('hex')]),
        ).toString('hex');
        const existing = this.pending.get(key);

        if (existing) return existing;

        const result = this.load(key, compress).finally(() => this.pending.delete(key));

        this.pending.set(key, result);

        return result;
    }

    private warn(error: unknown) {
        if (!this.warned) {
            this.warned = true;
            this.options.warn?.(error);
        }
    }

    private async load(key: string, compress: () => Promise<Buffer>): Promise<Buffer> {
        if (!this.options.readonly) {
            this.cleanup ??= this.prune().catch((error) => this.warn(error));
            await this.cleanup;
        }
        const filename = path.join(this.options.directory, key.slice(0, 2), `${key}.bin`);

        try {
            const record = await fs.readFile(filename);
            const output = record.subarray(HEADER_SIZE);

            if (
                record.length < HEADER_SIZE ||
                !record.subarray(0, MAGIC.length).equals(MAGIC) ||
                record.subarray(MAGIC.length, MAGIC.length + 32).toString('hex') !== key ||
                !record.subarray(MAGIC.length + 32, HEADER_SIZE).equals(digest(output))
            )
                throw new Error(`Invalid compressed cache entry: ${filename}`);

            this.stats.hits += 1;

            return output;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') this.warn(error);
        }

        this.stats.misses += 1;
        const output = await compress();

        if (!this.options.readonly) {
            const temporary = `${filename}.${crypto.randomBytes(12).toString('hex')}.tmp`;

            try {
                await fs.mkdir(path.dirname(filename), { recursive: true });
                await fs.writeFile(
                    temporary,
                    Buffer.concat([MAGIC, Buffer.from(key, 'hex'), digest(output), output]),
                    { flag: 'wx' },
                );
                await fs.rename(temporary, filename);
                this.stats.writes += 1;
            } catch (error) {
                this.warn(error);
            } finally {
                await fs.rm(temporary, { force: true }).catch(() => {});
            }
        }

        return output;
    }

    private async prune(): Promise<void> {
        const directories = await fs
            .readdir(this.options.directory, { withFileTypes: true })
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === 'ENOENT') return [];
                throw error;
            });
        const cutoff = Date.now() - MAX_AGE_MS;

        await Promise.all(
            directories
                .filter((entry) => entry.isDirectory() && /^[a-f0-9]{2}$/.test(entry.name))
                .map(async (directory) => {
                    const location = path.join(this.options.directory, directory.name);
                    const entries = await fs.readdir(location, { withFileTypes: true });

                    await Promise.all(
                        entries
                            .filter(
                                (entry) => entry.isFile() && /^[a-f0-9]{64}\.bin$/.test(entry.name),
                            )
                            .map(async (entry) => {
                                const file = path.join(location, entry.name);

                                if ((await fs.stat(file)).mtimeMs < cutoff) await fs.unlink(file);
                            }),
                    );
                }),
        );
    }
}
