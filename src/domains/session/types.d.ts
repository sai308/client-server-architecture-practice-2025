declare namespace Domain {
  export type Session = {
    id?: string;
    fp: string;
    userId: number;
    ipAddress: string;
    userAgent: string;
    lastSeenAt: Date;
  };

  export interface SessionEntity extends Session {
    id?: string;
    updateLastSeen(): ThisType<SessionEntity>;
  }

  export type SessionConstructorFields = {
    id?: string;
    fp: string;
    userId: number;
    ipAddress: string;
    userAgent: string;
    lastSeenAt?: string | Date;
  };
}
