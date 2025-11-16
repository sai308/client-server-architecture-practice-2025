/**
 * CurrencyProvider fetches and normalizes currency exchange rates
 * from a specified external API.
 * @implements {Providers.CurrencyProvider}
 */
class CurrencyProvider {
  constructor() {
    this.url = 'https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=11';
  }

  /**
   * Fetches currency rates from the provider and normalizes the response.
   * @type {Providers.CurrencyProvider['getRates']}
   */
  async getRates() {
    const res = await fetch(this.url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      // you can set a timeout by using AbortController if needed
    });

    if (!res.ok) {
      throw new Error(
        `Request failed with status ${res.status} ${res.statusText}`
      );
    }

    // The API usually returns JSON like:
    // [{ ccy: "USD", base_ccy: "UAH", buy: "36.60000", sale: "37.20000" }, ...]
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format from currency provider');
    }

    return data.map((item) => ({
      currency: item.ccy || item.code || null,
      base: item.base_ccy || item.base || null,
      buy: item.buy !== null ? Number(item.buy) : null,
      sale: item.sale !== null ? Number(item.sale) : null,
    }));
  }
}

module.exports = { currencyProvider: new CurrencyProvider() };
