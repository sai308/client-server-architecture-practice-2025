namespace Adapters {
  namespace Postgres {
    export type StripRelations<T> = {
      [K in keyof T as K extends `${string}Relations` ? never : K]: T[K];
    };

    export type Schemas = StripRelations<
      typeof import('@/adapters/postgres/schemas')
    >;

    export type SchemasWithRelations =
      typeof import('@/adapters/postgres/schemas');
  }
}
