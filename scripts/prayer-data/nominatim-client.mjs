const DEFAULT_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_MIN_DELAY_MS = 1100;

export class NominatimClient {
  constructor({
    baseUrl = process.env.NOMINATIM_BASE_URL ?? DEFAULT_BASE_URL,
    fetchImpl = globalThis.fetch,
    minDelayMs = Number.parseInt(process.env.NOMINATIM_MIN_DELAY_MS ?? String(DEFAULT_MIN_DELAY_MS), 10),
    userAgent = process.env.NOMINATIM_USER_AGENT ?? 'sakinah-bloom-prayer-data-generator/1.0',
  } = {}) {
    if (!fetchImpl) {
      throw new Error('A fetch implementation is required.');
    }

    this.baseUrl = baseUrl;
    this.fetch = fetchImpl;
    this.minDelayMs = minDelayMs;
    this.userAgent = userAgent;
    this.lastRequestAt = 0;
  }

  async searchSwedishLocation(query) {
    await this.waitForRateLimit();

    const params = new URLSearchParams({
      q: `${query}, Sweden`,
      countrycodes: 'se',
      format: 'jsonv2',
      addressdetails: '1',
      namedetails: '1',
      limit: '5',
      'accept-language': 'sv,en',
    });

    const response = await this.fetch(`${this.baseUrl}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': this.userAgent,
      },
    });

    this.lastRequestAt = Date.now();

    if (!response.ok) {
      throw new Error(`Nominatim search for "${query}" failed with HTTP ${response.status}: ${response.statusText}`);
    }

    const body = await response.json();

    if (!Array.isArray(body)) {
      throw new Error(`Nominatim search for "${query}" did not return an array.`);
    }

    return body;
  }

  async waitForRateLimit() {
    const elapsed = Date.now() - this.lastRequestAt;
    const waitMs = this.minDelayMs - elapsed;

    if (this.lastRequestAt > 0 && waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}
