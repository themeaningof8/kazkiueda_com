# Dependency Injection (依存性注入)

## 概要
DIコンテナを使用して、依存関係を管理します。

## 責務
- **コンテナ設定**: Awilixコンテナの設定
- **トークン定義**: 注入識別子
- **スコープ管理**: ライフサイクル管理

## 使用方法
```typescript
// di/container.ts
import { createContainer, asClass, InjectionMode } from 'awilix';

export function createDIContainer() {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC
  });

  container.register({
    // Repositories
    postRepository: asClass(PayloadPostRepository).scoped(),

    // Use Cases
    getPostBySlugUseCase: asClass(GetPostBySlugUseCase).scoped(),

    // Controllers
    postController: asClass(PostController).scoped(),
  });

  return container;
}
```

## テストでの使用
```typescript
const container = createDIContainer();
container.register({
  postRepository: asValue(mockPostRepository) // モックに差し替え
});
```
