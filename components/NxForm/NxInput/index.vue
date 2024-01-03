<script setup lang="ts">
import NxEmpty from '../../NxEmpty/index.vue'
import NxBlock from '../../NxBlock/index.vue'
import NxPagination from '../../NxPagination/index.vue'
import type { Inputs } from '../../index';
import { ref } from 'vue';
import type { IStateApiPagiMany } from '../../../index';
const props = defineProps<{
    type: Inputs.InputType
    value?: boolean|string|number
    class?: string
    title?: string
    width?: string
    fields?: string[]
    content?: {name?: string, value?: any, title?: string}[] & IStateApiPagiMany<any>
    options?: {
        fileAccept?: Inputs.FileAccess[]
        prefix?: string
        name?: string
        placeholder?: string
        validateMessage?: string
        maxLength?: number
        max?: number
        min?: number
    }
}>()
const emitFake = defineEmits(['vptUpdate'])

let prefix = ref("")
let inputValue = ref("" as any)
const isOpened = ref(false)
const ValueTitle = ref("")

if(props.value) {
    if(typeof props.value == 'object') {
        inputValue = props.value as any
        if(props.type == 'email') {
            inputValue.value = "";
            ValueTitle.value = "";
            prefix.value = "";
        }
        else if(props.type == 'api') {
            ValueTitle.value = "..."
        }
    }
    else {
        inputValue.value = props.value
    }
}
else {
    if(props.type == 'number') inputValue.value = 0
    else if(props.type == 'checkbox') inputValue.value = false
    else if(props.type == 'select') inputValue.value = 0
    else if(props.type == 'email') {
        inputValue.value = "";
        ValueTitle.value = "";
        prefix.value = "";
    }
    else if(props.type == 'api') {
        ValueTitle.value = "..."
    }
}

const Title = ref("")

const incrimentValue = () => {
    inputValue.value += 1;
    emitFake(`vptUpdate`)
}
const dicrimentValue = () => {
    inputValue.value -= 1;
    emitFake(`vptUpdate`)
}

function getWidth() {
    if(props.width) {
        return props.width
    }
    return "350px"
}

function getClass() {
    if(props.class) {
        return props.class
    }
    return "vpt-input"
}
function getTitle() {
    if(props.title) {
        Title.value = props.title
    }
    else if(props.options) {
        if(props.options.name) {
            Title.value = props.options.name
        }
        else {
        Title.value = ""
    }}
    else {
        Title.value = ""
    }
    return Title.value
}
function getPlaceholder() {
    if(props.options && props.options.placeholder) {
        return props.options.placeholder
    }
    return ""
}
function getError() {
    if(props.options && props.options.validateMessage) {
        if(typeof props.options.validateMessage == 'object') {
            return (props.options.validateMessage as any).value
        }
        return props.options.validateMessage
    }
    return ""
}
function getMax() {
    if(props.options && props.options.max) {
        return props.options.max
    }
    return undefined
}
function getMin() {
    if(props.options && props.options.min) {
        return props.options.min
    }
    return undefined
}
function getMaxLength() {
    if(props.options && props.options.maxLength) {
        return props.options.maxLength
    }
    return undefined
}
function getPrefix() {
    if(props.options && props.options.prefix) {
        prefix.value = props.options.prefix 
        return prefix.value
    }
    prefix.value = "+1" 
    return prefix.value
}
function getAccept() {
    if(props.options && props.options.fileAccept) {
        return props.options.fileAccept.join(',')
    }
    return "image/*"
}
function getValue() {
    const firstItem = (object: {name?: string, title?: string, value?: any}[]) => {
        for(const item of object) {
            if(item.name) {
                return item as any
            }
        }
    }
    if(props.type == 'select' && props.content) {
        if(props.value) {
            for(const item of props.content as any) {
                if(item.name && item.value == inputValue.value) {
                    inputValue.value = item.value
                    ValueTitle.value = item.name
                }
            }
        }
        else {
            const result = firstItem(props.content as any)
            ValueTitle.value = result.name
            inputValue.value = result.value
        }
    }
    return ValueTitle.value
}
let lastStringTel = ''
function inputTel() {
    if(inputValue.value[0] == '+') {
        if(inputValue.value[inputValue.value.length - 1] == ' ') {
            prefix.value = inputValue.value.trim()
            inputValue.value = ""
        }
    }
    else {
        let yValue = inputValue.value
        if(lastStringTel.length < inputValue.value.length) {
            const lastChar = yValue[yValue.length - 1]
            if(Number.parseInt(lastChar) || lastChar == '0') {
                if(yValue.length == 4) {
                    inputValue.value = "(" + (inputValue.value as string).substring(0, yValue.length - 1) + ") "+lastChar
                }
                else if(yValue.length == 10) {
                    inputValue.value = (inputValue.value as string).substring(0, yValue.length - 1) + "-"+lastChar
                }
                else if(yValue.length == 13) {
                    inputValue.value = (inputValue.value as string).substring(0, yValue.length - 1) + "-"+lastChar
                }
            }
            else {
                inputValue.value = (inputValue.value as string).substring(0, yValue.length - 1)
            }
        }
        else {
            if(yValue.length == 5) {
                inputValue.value = (inputValue.value as string).substring(1, yValue.length - 1)
            }
            else if(yValue.length == 10) {
                inputValue.value = (inputValue.value as string).substring(0, yValue.length - 1)
            }
            else if(yValue.length == 13) {
                inputValue.value = (inputValue.value as string).substring(0, yValue.length - 1)
            }
        }
        lastStringTel = inputValue.value
    }
}
const input1Element = ref(null as any as HTMLInputElement)
const input2Element = ref(null as any as HTMLInputElement)
function dropValidate() {
    if(typeof (props.options as any).validateMessage == 'object') {
        (props.options as any).validateMessage.value = ''
    }
    else {
        (props.options as any).validateMessage = ''
    }
}
function emailPart1(event: Event) {
    const val = prefix.value as string
    if(val[val.length - 1] == '@') {
        prefix.value = val.slice(0, -1)
        input2Element.value.focus()
    }
    inputValue.value = prefix.value + '@' + ValueTitle.value
}
function emailPart2(event: Event) {
    const val = ValueTitle.value as string
    inputValue.value = prefix.value + '@' + ValueTitle.value
    if(val.length == 0) input1Element.value.focus()
}
function updateSelect(id: number|string, name: string) {
    ValueTitle.value = name;
    inputValue.value = id;
    isOpened.value = false;
    dropValidate()
}
function openApiPanel() {
    isOpened.value = true
    if(props.content) {
        props.content.page(1)
    }
}
function selectApi(item: any) {
    isOpened.value = false
    inputValue.value = item.id

    if('title' in item) {
        ValueTitle.value = item.title
    }
    else if('name' in item) {
        ValueTitle.value = item.name
    }
    else if('slug' in item) {
        ValueTitle.value = item.slug
    }
    else {
        ValueTitle.value = item.id
    }

    dropValidate()
}
if(props.type == 'tel') {
    getPrefix()
}
else if(props.type == 'select') {
    getValue()
}
</script>
<template>
    <div :class="getClass() + (getError().length > 0 && ' err' || '')" :style="`width: ${getWidth()}`">
        <div v-if="type == 'basic'" class="basic">
            <input type="text" :maxLength="getMaxLength()" @change="()=>{emitFake(`vptUpdate`)}" v-model="inputValue" placeholder="test">
            <span class="title" :class="getError().length > 0 && 'err'">{{ getTitle() }}</span>
            <span class="placeholder" :class="getError().length > 0 && 'err'">{{ getPlaceholder() }}</span>
            <span class="validate">{{ getError() }}</span>
        </div>
        <div v-else-if="type == 'multiline'" class="multiline">
            <textarea type="text" :maxLength="getMaxLength()" @change="()=>{emitFake(`vptUpdate`)}" v-model="inputValue" :placeholder="getPlaceholder()"> </textarea>
            <span class="title" :class="getError().length > 0 && 'err'">{{ getTitle() }}</span>
            <span class="validate">{{ getError() }}</span>
        </div>
        <div v-else-if="type == 'checkbox'" class="checkbox"  @click="() => {inputValue = !inputValue}">
            <label class="visual">
                <input style="display: none;" type="checkbox" @change="()=>{emitFake(`vptUpdate`)}" v-model="inputValue"/>
                <div>
                    &#x2714;
                </div>
            </label>
            <span class="title">{{ getTitle() }}</span>
        </div>
        <div v-else-if="type == 'number'" class="number">
            <div class="inputPanel">
                <button @click="dicrimentValue">&#8249;</button>
                <input v-model="inputValue" :max="getMax()" @change="()=>{emitFake(`vptUpdate`)}" :min="getMin()" type="number"/>
                <span class="validate">{{ getError() }}</span>
                <button @click="incrimentValue">&#8250;</button>
            </div>
            <span class="title">{{ getTitle() }}</span>
        </div>
        <NxBlock @lose="() => {isOpened = false}" @click="(event: MouseEvent) => {if(event.target == event.currentTarget) isOpened = true}" v-else-if="type == 'select'" class="select">
            <div style="pointer-events: none;">
                {{ ValueTitle }}
            </div>
            <span class="validate">{{ getError() }}</span>
            <div class="accardeon" :class="isOpened && 'opened' || ''">
                <NxEmpty v-for="data of props.content">
                    <button class="item" v-if="data.name" @click="() => {updateSelect((data as any).value as any, (data as any).name as any)}">
                        {{ data.name }}
                    </button>
                    <div class="group" v-else-if="(data as any).title">
                        {{ (data as any).title }}
                    </div>
                </NxEmpty>
            </div>
            <input v-model="inputValue" :hidden="true">
            <span style="pointer-events: none;" class="title">{{ getTitle() }}</span>
        </NxBlock>
        <NxBlock @click="(event: MouseEvent) => {if(event.target == event.currentTarget) openApiPanel(); }" v-else-if="type == 'api'" class="api">
            <div style="pointer-events: none;">
                {{ ValueTitle }}
            </div>
            <span class="validate">{{ getError() }}</span>
            <div class="window" @click="(event) => {if(event.target == event.currentTarget) isOpened = false}" :class="isOpened && 'opened' || ''">
                <div class="content">
                    <header>
                        <span style="display: flex; align-items: center;">
                            {{ getTitle() }}
                        </span>
                        <span style="margin-left: auto; cursor: pointer;" @click="()=>{isOpened = false}">
                            ╳
                        </span>
                    </header>
                    <table class="data" v-if="props.content && !props.content.isLoading && props.content.value.length > 0">
                        <thead>
                            <th v-for="val of fields">
                                {{ val }}
                            </th>
                        </thead>
                        <tbody>
                            <tr @click="()=>selectApi(data)" v-for="data of props.content.value">
                                <td v-for="val of fields">
                                    {{ data[val] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="empty" v-else-if="props.content && !props.content.isLoading && props.content.value.length == 0">
                        No data from server
                    </div>
                    <div class="loading" v-else>
                        <i>○</i>
                        <i>○</i>
                        <i>○</i>
                    </div>
                    <footer 
                        :hidden="props.content && !props.content.isLoading && props.content.value.length == 0" 
                        :class="props.content?.isLoading && 'deactivate'" 
                        style="justify-content: center;">
                        <NxPagination 
                            @prev="()=>{props.content?.user().prev()}"
                            @page="(index)=>{props.content?.user().page(index)}"
                            @next="()=>{props.content?.user().next()}"
                            :current="(props.content as any).current"
                            :max="(props.content as any).max" />
                    </footer>
                </div>
            </div>
            <input v-model="inputValue" :hidden="true">
            <span style="pointer-events: none;" class="title">{{ getTitle() }}</span>      
        </NxBlock>
        <div v-else-if="type == 'email'" class="email">
            <div class="visual">
                <input ref="input1Element" @click="dropValidate" @input="emailPart1" v-model="prefix" type="text" style="flex: 2.5 1;">
                <div class="seperate">@</div>
                <input ref="input2Element" @click="dropValidate" @input="emailPart2" v-model="ValueTitle" class="postfix" type="text">
                <span class="validate">{{ getError() }}</span>
            </div>
            <span class="title">{{ getTitle() }}</span>
        </div>
        <div v-else-if="type == 'tel'" class="tel">
            <div class="visual">
                <span>
                    {{ prefix }}
                </span>
                <input v-model="inputValue" maxlength="15" @change="()=>{emitFake(`vptUpdate`)}" @input="inputTel" type="text">
                <span class="validate">{{ getError() }}</span>
            </div>
            <span class="title">{{ getTitle() }}</span>
        </div>
        <div v-else-if="type == 'files'" class="files">
            <label>
                <input :accept="getAccept()" type="file"/>
            </label>
        </div>
        <div v-else>
            <span class="title">{{ getTitle() }}</span>
        </div>
    </div>
</template>
<style>
    @keyframes loadingBubble {
        0% {
            transform: scale(1);
            /* box-shadow: 0px 0px 0px #3d8ee086; */
        } 
        33% {
            transform: scale(1.2);
            /* box-shadow: 0px 0px 12px #3d8ee086; */
        } 
        100% {
            transform: scale(1);
            /* box-shadow: 0px 0px 0px #3d8ee086; */
        } 
    }
    .deactivate {
        pointer-events: none !important;
        user-select: none !important;
        opacity: 0.5;
    }
    .vpt-input .placeholder {
        opacity: 0;
        position: absolute;
        user-select: none;
        pointer-events: none;
        color: lightgray;
    }
    .vpt-input .validate {
        opacity: 0;
        position: absolute;
        user-select: none;
        transition: opacity 0.1s ease-in;
        pointer-events: none;
    }
    .vpt-input .title {
        position: absolute;
        top: 12%;
        left: 0.8em;
        color: gray;
        user-select: none;
        transition: 0.1s ease-in;
        transition-property: transform, top, font-size, color;
        font-size: 12px;
        pointer-events: none;
        transform: translateY(-0%);
    }
    /** Number */
    .vpt-input .email {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
        padding: 0.65em;
        padding-top: 1.5em;
        padding-bottom: 0.5em;
        min-width: 0px;
    }
    .vpt-input.err .email {
        border-color: #a52924;
        & .validate {
            opacity: 1;
            top: 6px;
            left: 0px;
            color: #a52924;
        }
        & .title {
            color: #a52924;
        }
        & input {
            opacity: 0;
        }
        & .visual div {
            opacity: 0;
        }
        & input:focus {
            opacity: 1;
            & + div {
                opacity: 1;
            }
            & + div + input + .validate {
                opacity: 0;
            }
            & + .validate {
                opacity: 0;
            }
        }
    }
    .vpt-input .visual {
        position: relative;
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        
        & input {
            display: block;
            border: none;
            flex: 1 1;
            box-sizing: border-box;
            padding: 0.3em;
            min-width: 0;
            border: 1px solid lightgray;
            &:first-child {
                border-bottom-left-radius: 5px;
                border-top-left-radius: 5px;
            }
            &:last-child {
                border-bottom-right-radius: 5px;
                border-top-right-radius: 5px;
            }
            outline: none;
        }
        & .seperate {
            flex: 0 0;
            pointer-events: none;
            user-select: none;
            color: gray;
            background: lightgray;
            padding: 0.3em;
        }
    }
    /** Api */
    .vpt-input .api {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 0.65em;
        padding-top: 1.5em;
        padding-bottom: 0.5em;
        user-select: none;
        cursor: pointer;
        border-radius: 7px;
    }
    .vpt-input.err .api {
        border-color: #a52924;

        & .title {
            color: #a52924;
        }

        & > div {
            opacity: 0;
        }

        & .validate {
            opacity: 1;
            color: #a52924;
        }
    }
    .vpt-input .api .window {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background: #1f1f1f54;
        z-index: 90;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: Arial, Helvetica, sans-serif;
        opacity: 0;
        cursor: default;
        pointer-events: none;
        display: flex;
        transition: opacity 0.15s ease-in-out;
        &.opened {
            pointer-events: all;
            opacity: 1;
        }
    }
    .vpt-input .api .window .content .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        & i {
            font-size: 20px;
        }
        & i:nth-child(1) {
            animation: loadingBubble 1.5s infinite;
        }
        & i:nth-child(2) {
            animation: loadingBubble 1.5s infinite;
            animation-delay: 0.5s;
        }
        & i:nth-child(3) {
            animation: loadingBubble 1.5s infinite;
            animation-delay: 1s;
        }
    }
    .vpt-input .api .window .content .empty {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #3d8fe0;
    }
    .vpt-input .api .window .content {
        background: white;
        width: min(790px, 100%);
        border-radius: 1em;
        display: flex;
        flex-direction: column;
        box-shadow: 0px 35px 45px -35px #3d8fe0;
        height: min(520px, 100%);
        box-sizing: border-box;
        overflow-y: auto;
        & header, & footer {
            display: flex;
            flex-direction: row;
            padding: 1em;
        }
        & > header + * {
            flex: 1 1;
        }
    }
    .vpt-input .api .window .content .data {
        margin: 1em;
        margin-block: 0em;
        box-sizing: border-box;
        border: 1px solid gray;
        border-radius: 5px;
        color: gray;
        & th:nth-child(even) {
            color: #313131;
            background: lightgray;
        }
        & td {
            color: #313131;
        }
        & th {
            border-bottom: 1px solid gray;
        }
        & tr:nth-child(odd) {
            & td:nth-child(odd) {
                background: #d3d3d371;
            }
        }
        & tr:nth-child(even) {
            & td:nth-child(even) {
                background: #d3d3d371;
            }
        }
        & th, & td {
            text-align: left;
            padding: 0.4em;
        }
        & tr:hover {
            background: #3d8ee06e;
        }
    }
    /** Select */
    .vpt-input .select {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 0.65em;
        padding-top: 1.5em;
        padding-bottom: 0.5em;
        user-select: none;
        cursor: pointer;
        border-radius: 7px;
    }
    .vpt-input.err .select {
        border-color: #a52924;

        & .title {
            color: #a52924;
        }

        & > div {
            opacity: 0;
        }

        & .validate {
            opacity: 1;
            color: #a52924;
        }
    }
    .vpt-input .select .accardeon {
        box-sizing: border-box;
        position: absolute;
        display: flex;
        flex-direction: column;
        border: 1px solid lightgray;
        border-radius: 7px;
        top: 100%;
        left: 0px;
        overflow-y: auto;
        width: 100%;
        max-height: 300px;
        background: white;
        z-index: 99;
        pointer-events: none;
        box-shadow: 0px 15px 50px -40px #086dd1;
        transition: transform 0.3s ease-in-out, opacity 0.25s ease-in;
        opacity: 0;
        transform: translateY(-50px) scaleY(0.9);
        &::-webkit-scrollbar {
            appearance: none;
            width: 9px;
            border-radius: 3px;
            background: white;
        }
        &::-webkit-scrollbar-thumb {
            background: #80808060;
            border-radius: 3px;
            border: 2px solid white;
        }
        &.opened {
            pointer-events: unset;
            transform: translateY(0px) scaleY(1);
            opacity: 1;
        }
    }
    .vpt-input .select .accardeon .group {
        text-align: left;
        padding: 0.5em;
        padding-block: 0.6em;
        padding-inline: 0.6em;
        border-radius: 8px;
        margin: 0.3em;
    }
    .vpt-input .select .accardeon .item {
        text-align: left;
        padding: 0.5em;
        cursor: pointer;
        padding-block: 0.6em;
        padding-inline: 0.6em;
        border-radius: 8px;
        margin: 0.3em;
        margin-block: 0;
        border: 1px solid transparent;
        margin-bottom: 0;
        color: gray;
        background: none;
        &:last-child {
            margin-bottom: 0.3em;
        }
        &:hover {
            border: 1px solid lightgrey;
        }
    }
    /** Files */
    .vpt-input .files {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
    }
    .vpt-input .files label {
        padding: 0.5em;
        margin: 0.5em;
        margin-top: 1.6em;
        aspect-ratio: 1.43/1;
        border-radius: 7px;
        border: 1px dashed lightgrey;
    }
    .vpt-input label input {
        display: none;
    }
    /** Tel */
    .vpt-input .tel {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
    }
    .vpt-input.err .tel {
        border-color: #a52924;
    }
    .vpt-input .tel .visual {
        margin-top: 1.35em;
        padding-block: 0.3em;
        color: #1f1f1f;
        padding-inline: 0.5em;
        display: flex;
        flex-direction: row;
    }
    .vpt-input .tel .visual span:first-child {
        padding: 0.3em;
        user-select: none;
        pointer-events: none;
        padding-inline: 0.4em;
        border: 1px solid lightgray;
        background: lightgray;
        border-top-left-radius: 7px;
        border-bottom-left-radius: 7px;
    }
    .vpt-input .tel .visual input {
        padding: 0.3em;
        padding-inline: 0.7em;
        outline: none;
        border: 1px solid lightgray;
        flex: 1 1;
        display: block;
        border-top-right-radius: 7px;
        border-bottom-right-radius: 7px;
    }
    .vpt-input.err .tel .title {
        color: #a52924;
    }
    .vpt-input.err .tel input:not(:focus) {
        color: transparent;
    }
    .vpt-input .tel .validate {
        top: 28%;
        transform: translateY(-0%);
        color: #a52924;
        left: 3.3em;
    }
    .vpt-input.err .tel input:not(:focus) + .validate {
        opacity: 1;
    }
    /** Multiline */
    .vpt-input .multiline {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
    }
    .vpt-input .multiline textarea {
        margin-top: 1em;
        padding: 0.3em;
        padding-block: 0.5em;
        outline: none;
        line-height: 1.3;
        padding-inline: 0.5em;
        min-height: 34px;
        resize: vertical;
        border: none;
        border-bottom: 1px dashed lightgray;
        margin-bottom: 0.3em;
        font-family: Arial, Helvetica, sans-serif;
    }
    .vpt-input .multiline .title {
        top: 0.45em;
        transform: translateY(0%);
    }
    .vpt-input.err .multiline {
        border: #a52924 1px solid;
    }
    .vpt-input.err .multiline .title {
        color: #a52924;
    }
    .vpt-input.err .multiline textarea:not(:focus) {
        opacity: 0;
    }
    .vpt-input.err .multiline .validate {
        top: 50%;
        color: #a52924;
        left: 0.57em;
        transform: translateY(-10%);
    }
    .vpt-input.err .multiline textarea:not(:focus) + .title + .validate {
        opacity: 1;
    }
    /** Basic */
    .vpt-input .basic {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
    }
    .vpt-input.err .basic {
        border-color: #a52924;
    }
    .vpt-input .basic input {
        padding: 0.55em;
        margin-top: 1em;
        outline: none;
        border: none;
        border-radius: 7px;
    }
    .vpt-input .basic input::placeholder {
        color: transparent;
    }
    .vpt-input .basic input:placeholder-shown:not(:focus) + .title {
        font-size: 14px;
        color: #1f1f1f;
        top: 50%;
        transform: translateY(-50%);
    }
    .vpt-input.err .basic input + .title {
        color: #a52924;
    }
    .vpt-input .basic input:placeholder-shown:focus + .title + .placeholder {
        opacity: 1;
        position: absolute;
        top: 65%;
        left: 0.8em;
        transition: opacity 0.3s ease-in;
        font-size: 14px;
        transform: translateY(-50%);
    }
    .vpt-input .basic input:not(:focus) + .title + .placeholder + .validate {
        position: absolute;
        top: 50%;
        opacity: 1;
        color: #a52924;
        left: 0.8em;
        transition: opacity 0.3s ease-in;
        font-size: 14px;
        transform: translateY(-50%);
    }
    .vpt-input .basic input:not(:placeholder-shown):not(:focus) + .title + .placeholder + .validate {
        transform: translateY(-5%);
    }
    .vpt-input.err .basic input:not(:focus) {
        opacity: 0;
    }
    .vpt-input .basic input:placeholder-shown:not(:focus) + .title.err {
        opacity: 0;
        color: #a52924;
    }
    /** Number */
    .vpt-input .number {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
    }
    .vpt-input.err .number {
        border-color: #a52924;
    }
    .vpt-input .number .inputPanel {
        display: flex;
        flex-direction: row;
    }
    .vpt-input .number .inputPanel input {
        flex: 1 1;
        padding: 0.55em;
        margin-top: 1em;
        outline: none;
        border: none;
        border-radius: 7px;
    }
    .vpt-input.err .number .inputPanel input:not(:focus) {
        opacity: 0;
    }
    .vpt-input.err .number .inputPanel .validate {
        transform: translateY(-5%);
        color: #a52924;
        top: 50%;
        left: 2.25em;
    }
    .vpt-input.err .number .inputPanel input:not(:focus) + .validate {
        opacity: 1;
    }
    .vpt-input .number .title {
        left: 2.95em;
    }
    .vpt-input.err .number .title {
        color: #a52924;
    }
    .vpt-input .inputPanel button {
        user-select: none;
        border: none;
        border-radius: 5px;
        width: 25px;
        cursor: pointer;
        outline: none;
    }
    /** Checkbox */
    .vpt-input .checkbox {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: Arial, Helvetica, sans-serif;
        border: 1px solid lightgray;
        padding: 3px;
        border-radius: 7px;
    }
    .vpt-input .checkbox .visual {
        position: relative;
        pointer-events: none;
        height: 43px;
        user-select: none;
        width: 43px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: transparent;
        border-radius: 5px;
    }
    .vpt-input .checkbox input + div {
        width: 60%;
        height: 60%;
        user-select: none;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        color: transparent;
        border: 1px solid lightgray;
    }
    .vpt-input .checkbox input:checked + div {
        width: 60%;
        height: 60%;
        user-select: none;
        border-radius: 4px;
        background: #086dd1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        color: white;
        border: 1px solid lightgray;
    }
    .vpt-input .checkbox .title {
        top: 50%;
        user-select: none;
        transform: translateY(-50%);
        left: 15%;
        font-size: 16px;
        color: #1f1f1f;
    }
</style>