import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_SOURCE_CACHE_DIR = '.cache/prayer-data/source-api';

export class JsonFileCache {
  constructor({ dir = DEFAULT_SOURCE_CACHE_DIR, enabled = true, refresh = false } = {}) {
    this.dir = dir;
    this.enabled = enabled;
    this.refresh = refresh;
  }

  async getOrSet(keyParts, load) {
    if (!this.enabled) {
      return load();
    }

    const filePath = this.filePath(keyParts);

    if (!this.refresh) {
      const cached = await this.read(filePath);
      if (cached) {
        console.log(`cache hit: ${cached.key}`);
        return cached.value;
      }
    }

    const value = await load();
    await this.write(filePath, { key: keyParts.join(':'), value });
    return value;
  }

  filePath(keyParts) {
    const readable = keyParts.map((part) => slug(String(part))).join('__');
    const hash = createHash('sha1').update(JSON.stringify(keyParts)).digest('hex').slice(0, 10);
    return path.join(this.dir, `${readable}__${hash}.json`);
  }

  async read(filePath) {
    try {
      const text = await readFile(filePath, 'utf8');
      return JSON.parse(text);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  }

  async write(filePath, payload) {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      `${JSON.stringify(
        {
          cachedAt: new Date().toISOString(),
          ...payload,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }
}

function slug(value) {
  return (
    value
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'empty'
  );
}
