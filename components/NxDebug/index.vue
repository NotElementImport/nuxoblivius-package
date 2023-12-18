<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { IStateManager } from '../../index';

const props = defineProps<{
    model: IStateManager<any>| IStateManager<any>[]
}>()
let models: IStateManager<any>[] = []
if(Array.isArray(props.model))
    models = props.model as any
else
    models = [props.model as any]

const debugOpened = ref(false)
const openMenu = (event: Event) => {
    event.preventDefault()
    debugOpened.value = true
    document.body.style.overflow = 'hidden'
}
const closeMenu = () => {
    debugOpened.value = false
    document.body.style.removeProperty('overflow')
}

const indexOfTab = ref(0)

</script>
<template>
    <div class="content" @contextmenu="openMenu">
        <slot></slot>
        <div class="debug" v-if="debugOpened">
            <div class="debug-header">
                <span class="debug-header-title">Nuxoblivius tool</span>
                <span class="debug-close" @click="closeMenu"> X </span>
            </div>
            <div class="debug-tabs">
                <span :class="(indexOfTab == 0) && 'active'" @click="_=>{indexOfTab = 0}">
                    Inspect
                </span>
                <span :class="(indexOfTab == 1) && 'active'" @click="_=>{indexOfTab = 1}">
                    Customize
                </span>
            </div>
            <div class="debug-inspect" :hidden="indexOfTab != 0">
                <details class="debug-model" v-for="localModel, index in models">
                    <summary>
                        <div>
                            <span class="index">{{ index }}</span>
                            <span class="title">{{ localModel.constructor.name }}</span>
                        </div>
                    </summary>
                    <div class="debug-model-content">
                        <details v-for="localProps, name in (localModel as any).debugParams()">
                            <summary> 
                                <div style="gap: 0.5em;">
                                    <span class="title">{{ localProps[0] }}</span>  
                                    <span v-if="'api' in localProps[1] && localProps[1].api.pagination.size != 0" class="tag">
                                        Pagination
                                    </span>
                                    <span v-if="'cache' in localProps[1]" class="tag">
                                        Caching
                                    </span>
                                    <span v-if="'api' in localProps[1] && localProps[1].watching" class="tag">
                                        Watching
                                    </span>
                                    <span v-if="'api' in localProps[1] && localProps[1].api.filters.length > 0" class="tag">
                                        Filtering
                                    </span>
                                    <span v-if="'template' in localProps[1] && localProps[1].template == ''" class="tag">
                                        Raw
                                    </span>
                                    <span v-if="'template' in localProps[1] && localProps[1].template == 'yii2-data-provider'" class="tag">
                                        Yii 2
                                    </span>
                                    <span v-if="'parent' in localProps[1] && localProps[1].parent != null" class="tag">
                                        Relations
                                    </span>
                                    <span v-if="'api' in localProps[1] && !localProps[1].api.optimization.preventRepeat" class="tag">
                                        Always Reload
                                    </span>
                                </div>
                            </summary>
                            <div class="debug-model-content">
                                <details class="preview">
                                    <summary :info="'type'">
                                        <a>{{ (Array.isArray(localProps[1].get()) ? 'many()' : 'one()') }}</a>
                                    </summary>
                                </details>
                                <details class="preview">
                                    <summary :info="(typeof localProps[1].get())">
                                        <a>Value</a>
                                    </summary>
                                    <pre class="debug-model-content"> {{ localProps[1].get() }} </pre>
                                </details>
                                <details class="preview" v-if="'template' in localProps[1] && localProps[1].template != ''">
                                    <summary :info="(typeof localProps[1].template)">
                                        <a>Template :</a><span class="value">{{ localProps[1].template }}</span>
                                    </summary>
                                </details>
                                <details class="preview" v-if="'parent' in localProps[1] && localProps[1].parent != null">
                                    <summary :info="(typeof localProps[1].parent)">
                                        <a>Parent :</a><span class="value">{{ localProps[1].parent.buxt.constructor.name }}.{{ localProps[1].parent.buxtName }}</span>
                                    </summary>
                                    <div class="debug-model-content">
                                        Linked by: {{ localProps[1].api.linkMethod }}
                                    </div>
                                </details>
                                <details class="zone" open v-if="'api' in localProps[1]">
                                    <summary>
                                        <span style="width: 90px; aspect-ratio: unset; padding-block: 0.25em;" class="index">API</span>
                                    </summary>
                                    <div class="debug-model-content">
                                        <details class="preview">
                                            <summary :info="(typeof localProps[1].api.path)">
                                                <a>Path  :</a> <span class="value">{{ localProps[1].api.path }}</span>
                                            </summary>
                                        </details>
                                        <details class="preview">
                                            <summary :info="(typeof localProps[1].api.method)">
                                                <a>Query Method :</a><span class="value">{{ localProps[1].api.method }}</span>
                                            </summary>
                                        </details>
                                        <details class="preview">
                                            <summary :info="(typeof localProps[1].api.auth.use)">
                                                <a>Use Auth :</a><span class="value">{{ localProps[1].api.auth.use }}</span>
                                            </summary>
                                        </details>
                                        <details class="preview">
                                            <summary :info="(typeof localProps[1].api.query)">
                                                <a>Init Query</a>
                                            </summary>
                                            <pre class="debug-model-content"> {{ localProps[1].api.query }} </pre>
                                        </details>
                                        <details class="preview">
                                            <summary :info="(typeof localProps[1].api.userQuery)">
                                                <a>Local Query</a>
                                            </summary>
                                            <pre class="debug-model-content"> {{ localProps[1].api.userQuery }} </pre>
                                        </details>
                                        <details class="preview">
                                            <summary :info="(typeof localProps[1].api.filters)">
                                                <a>Query Filters</a>
                                            </summary>
                                            <div class="debug-model-content">
                                                <div class="tags" v-if="localProps[1].api.filters.length > 0" v-for="oneFilter in localProps[1].api.filters">
                                                    {{ oneFilter }}
                                                </div>
                                                <span v-else>
                                                    Empty
                                                </span>
                                            </div>
                                        </details>
                                    </div>
                                </details>
  
                            </div>
                        </details>
                    </div>
                </details>
            </div>
            <div class="debug-customize" :hidden="indexOfTab != 1">
                
            </div>
        </div>
    </div>
</template>
<style scoped>
.content {
    position: relative;
}
.debug {
    font-family: Arial, Helvetica, sans-serif;
    z-index: 909090;
    top: 0;
    overflow-y: auto;
    overflow-x: hidden;
    left: 0;
    width: calc(100% - 10px);
    height: 100vh;
    padding: 0.3em;
    position: fixed;
    display: flex;
    flex-direction: column;
    padding: 0.4em;
    background: rgb(37, 37, 37);
}
.debug-tabs {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #89fade41;
    color: #89fade67;
    & span {
        display: block;
        padding: 0.5em;
        cursor: pointer;
        border: 1px solid transparent;
        user-select: none;
        border-bottom: none;
    }
    & span.active {
        color: #c4c4c4;
        border: 1px solid #89fade41;
        border-top-left-radius: 0.4em;
        border-top-right-radius: 0.4em;
        border-bottom: none;
        box-shadow: 0px 1px 0px #252525;
    }
}
.debug-header {
    color: #89fade81;
    display: flex;
    flex-direction: row;
    margin-bottom: 0.3em;
}
.debug-header-title {
    background: radial-gradient(at top left, #89fade4b 0%, #93ecaf23 20%, #f3f98b00 65%);
    color: #c4c4c4;
    padding-inline: 0.5em;
    padding-block: 0.4em;
    user-select: none;
    border-top-left-radius: 0.4em;
}
.debug-close {
    margin-left: auto;
    padding-inline: 0.5em;
    padding-block: 0.4em;
    padding-left: 2em;
    background: radial-gradient(at top right, #89fade4b 0%, #93ecaf23 20%, #f3f98b00 65%);
    color: #c4c4c4;
    user-select: none;
    cursor: pointer;
    border-top-right-radius: 0.4em;
    border-top-left-radius: 0.4em;
}
.debug-inspect, .debug-customize {
    padding-block: 1em;
}
.debug-model {
    & summary {
        cursor: pointer;
        list-style: none;
        gap: 0.5em;
        display: flex;
        flex-direction: column;
        background: radial-gradient(at top right, #89fade4b 0%, #93ecaf23 20%, #f3f98b00 65%);
        border-radius: 0.4em;
        padding: 0.8em;
        border: 1px solid #89fade4b;
        & > div {
            display: flex;
            flex-direction: row;
            gap: 1em;
        }
        & .title {
            display: block;
            color: #89fade99;
            font-weight: bold;
            user-select: none;
            padding-block: 0.25em;
        }
        & .index {
            display: flex;
            user-select: none;
            align-items: center;
            justify-content: center;
            background: #89fade99;
            background: radial-gradient(at top right, #89fade4b 0%, #93ecaf23 20%, #f3f98b00 65%);
            color: #c4c4c4;
            border: 1px solid #89fade1c;
            border-radius: 0.3em;
            width: 26px;
            aspect-ratio: 1/1;
        }
        & .tag {
            user-select: none;
            border: 1px solid #89fade3d;
            background: #89fade1c;
            color: #89faded2;
            padding: 0.25em 0.5em;
            border-radius: 0.4em;
        }
    }
    & .debug-model-content {
        display: flex;
        flex-direction: column;
        padding: 0.4em;
        gap: 0.4em;
        margin: 0.4em 0em;
        border-left: 1px solid #89fade3d;
    }
}
.preview {
    & summary {
        flex-direction: row;
        list-style: georgian;
        border: none;
        padding-inline: 0;
        padding-block: 0.2em;
        background: none;
        & a {
            margin-top: 0.15em;
            margin-left: 0.3em;
            padding-block: 0.25em;
            user-select: none;
        }
        & span.value {
            color: #89fade81;
            margin-top: 0.15em;
            margin-left: 0.3em;
            padding-block: 0.25em;
            user-select: none;
        }
    }
    & summary::before {
        content: attr(info);
        display: flex;
        justify-content: center;
        min-width: 60px;
        user-select: none;
        border: 1px solid #89fade3d;
        background: #89fade1c;
        color: #89faded2;
        padding: 0.25em 0.5em;
        border-radius: 0.4em;
    }

    color: #c4c4c4;
}
.zone {
    & > summary {
        flex-direction: row;
        list-style: georgian;
        border: none;
        border-radius: 0px;
        padding-inline: 0;
        padding-block: 0.2em;
        background: none;
    }
}
</style>