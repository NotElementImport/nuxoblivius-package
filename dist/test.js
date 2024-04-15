import { IStore, defineStore } from "./index.js";
class Testing extends IStore {
    innerData = "testValue";
    outerArray = {
        inner: this.ref.innerData
    };
}
const store = defineStore(Testing);
console.log(store.outerArray.inner.value);
// class TNameStore {
//     private _fio: string = ''
//             fio: string
//     private _firstName: string = ''
//         set firstName(v: string) {
//             this._firstName = v
//             this.buildFio()
//         }
//     private _lastName: string = ''
//         set lastName(v: string) {
//             this._lastName = v
//             this.buildFio()
//         }
//     private _surName: string = ''
//         set surName(v: string) {
//             this._surName = v
//             this.buildFio()
//         }
//     private buildFio() {
//         this._fio = `${this._lastName} ${this._firstName} ${this._surName}`.trim()
//     }
// }
// class Structing extends IStore<Structing> {
//     private _name = subStore<TNameStore>(TNameStore)
//             name: TNameStore
//     private _demo: string = 'test'
//         demo: string
//     public log() {
//         console.log('======')
//         console.log('name', this.name.fio)
//         console.log('demo', this.demo)
//     }
// }
// const store = defineStore<Structing>(Structing)
// store.log()
// store.name.firstName = "Test"
// store.name.lastName = "Testovic"
// store.name.surName = "Testov"
// store.log()
// const store2 = defineStore<Structing>(Structing)
// store2.log()
