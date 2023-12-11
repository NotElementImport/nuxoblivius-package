<script setup lang="ts">
import { useFetch } from 'nuxt/app';
import { Inputs } from '../../index.js';
import { ref } from 'vue';
const props = defineProps<{
    type: Inputs.InputType
    value?: boolean|string|number
    class?: string
    title?: string
    width?: string
    content?: {name: string, value: any}[]
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

const prefix = ref("")
let inputValue = ref("" as any)

if(props.value) {
    inputValue = props.value as any
}
else {
    if(props.type == 'number') inputValue.value = 0
    else if(props.type == 'checkbox') inputValue.value = false
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
            return props.options.validateMessage.value
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
let lastStringTel = ''
function inputTel() {
    if(inputValue.value[0] == '+') {
        if(inputValue.value[inputValue.value.length - 1] == ' ') {
            prefix.value = inputValue.value.trim()
            console.log(prefix.value)
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

getPrefix()
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
                <input hidden="true" type="checkbox" @change="()=>{emitFake(`vptUpdate`)}" v-model="inputValue"/>
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
        <div v-else-if="type == 'select'" class="select">
            <div class="visual">

            </div>
            <span class="title">{{ getTitle() }}</span>
        </div>
        <div v-else-if="type == 'email'" class="email">
            <div class="visual">
                <input type="text">
                <input type="text">
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
        top: 52%;
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