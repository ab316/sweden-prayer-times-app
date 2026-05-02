const TOKEN_REFRESH_MARGIN_MS = 60_000;
const TOKEN_LIFETIME_MS = 30 * 60_000;

export class AwqatSalahClient {
  constructor({
    baseUrl,
    username,
    password,
    usernameField = process.env.AWQAT_USERNAME_FIELD ?? 'email',
    passwordField = process.env.AWQAT_PASSWORD_FIELD ?? 'password',
    fetchImpl = globalThis.fetch,
  }) {
    if (!baseUrl) {
      throw new Error('AWQAT_BASE_URL is required.');
    }

    if (!username || !password) {
      throw new Error('AWQAT_USERNAME and AWQAT_PASSWORD are required.');
    }

    if (!fetchImpl) {
      throw new Error('A fetch implementation is required.');
    }

    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.username = username;
    this.password = password;
    this.usernameField = usernameField;
    this.passwordField = passwordField;
    this.fetch = fetchImpl;
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  async login() {
    const body = {
      [this.usernameField]: this.username,
      [this.passwordField]: this.password,
    };
    const response = await this.fetchJson('/Auth/Login', {
      method: 'POST',
      body,
      authenticated: false,
    });

    const accessToken = response?.data?.accessToken;

    if (!accessToken) {
      throw new Error('Awqat Salah login response did not contain data.accessToken.');
    }

    this.token = accessToken;
    this.tokenExpiresAt = Date.now() + TOKEN_LIFETIME_MS;
    return accessToken;
  }

  async getCountries() {
    const response = await this.fetchJson('/api/Place/Countries');
    return assertDataArray(response, 'countries');
  }

  async getStates(countryId) {
    const response = await this.fetchJson(`/api/Place/States/${countryId}`);
    return assertDataArray(response, 'states');
  }

  async getCities(stateId) {
    const response = await this.fetchJson(`/api/Place/Cities/${stateId}`);
    return assertDataArray(response, 'cities');
  }

  async getDateRange({ cityId, startDate, endDate }) {
    const response = await this.fetchJson('/api/PrayerTime/DateRange', {
      method: 'POST',
      body: {
        cityId,
        startDate,
        endDate,
      },
    });

    return assertDataArray(response, `date range for city ${cityId}`);
  }

  async fetchJson(path, { method = 'GET', body, authenticated = true } = {}) {
    const headers = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (authenticated) {
      headers.Authorization = `Bearer ${await this.getAccessToken()}`;
    }

    const response = await this.fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Awqat Salah ${method} ${path} failed with HTTP ${response.status}.`);
    }

    const json = await response.json();

    if (json?.success === false) {
      throw new Error(`Awqat Salah ${method} ${path} failed: ${json.message ?? 'unknown error'}`);
    }

    return json;
  }

  async getAccessToken() {
    if (this.token && Date.now() < this.tokenExpiresAt - TOKEN_REFRESH_MARGIN_MS) {
      return this.token;
    }

    return this.login();
  }
}

export function findSwedenCountry(countries) {
  const country = countries.find((item) => item?.code === 'SWEDEN');

  if (!country) {
    throw new Error('Could not find Sweden in Awqat Salah countries by code === "SWEDEN".');
  }

  return country;
}

export function findSingleSwedenState(states) {
  if (states.length !== 1) {
    throw new Error(`Expected exactly one Awqat Salah state for Sweden, received ${states.length}.`);
  }

  return states[0];
}

function assertDataArray(response, label) {
  if (!Array.isArray(response?.data)) {
    throw new Error(`Awqat Salah ${label} response did not contain a data array.`);
  }

  return response.data;
}
