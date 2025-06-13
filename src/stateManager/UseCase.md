# Nuxoblivius / State Manager Use Case:

## Nuxoblivius / Fabric Store

Создание временного StateManager(-а), каждый вызов, создаёт уникальную сущность

```ts
// 1. Конфигурация:

// Setup Nuxoblivius
new Nuxoblivius({
  backend: new Vue3Backend(),
});

// Get State Manager
const stateManager = StateManagerController.getInstance();

// 2. Описание:

// Define Store
class UserInfo {
  public constructor(
    public firstName: string,
    public lastName: string,
  ) {}

  public get fullName() {
    return `${this.lastName} ${this.firstName}`;
  }
}

// Create Store `UserInfo` Manager
const userInfoManager = stateManager.createStore({
  store: UserInfo,
  builder: FactoryBuilder,
});

// 3. Бизнес логика:

// Getting store instance
const userInfo = userInfoManager.getInstance("Ryan", "Gosling");

// Print Reactive variable
console.log(
  userInfo.fullName, // Print: Gosling Ryan
);
```

## Nuxoblivius / Strong Singleton

Создаёт объект по принципу Singleton, сущности уникальны, но все ссылаются не единую ячейку памяти

```ts
// ...Те-же самые шаги что и Fabric

// Create Store `UserInfo` Manager
const userInfoManager = stateManager.createStore({
  store: UserInfo,
  builder: SingletonBuilder, // SingletonBuilder отвечает за принцип Singleton
});
```

## Nuxoblivius / Weak Singleton

Создаёт объект по принципу Singleton, сущности уникальны, но все ссылаются не единую ячейку памяти.
Разница заключается только во временни жизни главной сущности, время жизни привязывается к существованию верхнего компонента.

```ts
// ...Те-же самые шаги что и Fabric

// Create Store `UserInfo` Manager
const userInfoManager = stateManager.createStore({
  store: UserInfo,
  builder: TemporalSingletonBuilder,
});
```
