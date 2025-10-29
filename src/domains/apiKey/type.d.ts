namespace Domain {
  export interface ApiKey {
    key: string;
    ownerId: number;
    isActive: boolean;
    lastUsedAt: Date | null;
  }
}
