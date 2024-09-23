### Создание структуры

У нас есть структура `Person` которая может быть создана/изменена/список

Лучший способ работы с данными это структура

```ts
export class Person {
    private api = Record

    constructor(
        public firstName,
        public lastName,
        public email
    ) {}
}
```