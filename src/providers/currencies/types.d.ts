namespace Providers {
  type CurrencyRates = {
    currency: 'EUR' | 'USD';
    base: 'UAH';
    buy: number;
    sale: number;
  };

  interface CurrencyProvider {
    getRates(): Promise<CurrencyRates[]>;
  }
}
