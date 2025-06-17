export interface IStorage {
  write(name: string, value: any): void;
  read(name: string): any;
  entries(): Iterator<[string, any], void, unknown>;
  count(): number;
};
