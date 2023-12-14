# <i style='color: #4dba87;'>Nux</i><i style='color: #425466'>oblivius</i>-<i>Power-State</i>
* Support Vue 3 and Nuxt 3 (Work better with Nuxt 3)
* Easy to use
* Optimized for your project

## Features

* Custom Forms Model
* State Manager

## Setup Nuxt 3 
Create in folder `plugins` file `nuxoblivius.ts`
```ts
import Plugin from 'nuxoblivius/Nuxt'

export default defineNuxtPlugin(nuxtapp => {
    Plugin(nuxtapp)
})
```
## Setup Vue 3
```ts
import Plugin from 'nuxoblivius/Vue'

Vue.use(Plugin)
```

## Example
```ts
// Posts.ts
import StateManager, { state } from 'nuxoblivius' 
import type IPost from '@/interfaces/Posts.ts'

export default class Posts extends StateManager {
    // Get many posts from Backend
    public posts = <IPost>state([])
        .api('/api/posts') // Fetch
        .template('yii2-data-provider') // Template for parsing from api
        .many()
    
    // Get one post from Backend
    public post = <IPost>state({})
        .api('/api/posts') // Fetch
        .template('yii2-data-provider') // Template for parsing from api
        .join(this.posts, 'slug') // Get data from this.posts if contains
        .one()

    constructor() {
        super('posts') // For minify
        // State management
        this.manage()
    }
}
```
```vue
<!-- /posts/index.vue -->
<script setup lang='ts'>
    import Posts from '@/state/Posts.ts'
    const statePosts = new Posts()
    statePosts.posts.all()
</script>
<template>
    <div>
        {{ statePosts.posts.value }}
    </div>
</template>
```

[GitHub Wiki (DOCS)](https://github.com/NotElementImport/nuxoblivius-package/wiki)