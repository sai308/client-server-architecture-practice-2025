declare namespace Services {
  export interface ApiKeyService {
    generateKeyValue(prefix?: string): string;
    createKey(ownerId: number): Domain.ApiKey;
  }
}
