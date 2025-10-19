declare namespace Domain {
  export type User = {
    name: string;
    age: number;
    email: string;
    balance: number;
  };

  export interface UserEntity extends User {
    id?: number;
    updateBalance(amount: number): ThisType<UserEntity>;
  }

  export type UserConstructorFields = {
    id?: number;
    name: string;
    age: number;
    email: string;
    balance?: number;
  };
}
