import { EventEmitter } from 'events'
import Axios from 'axios'

export class OffscreenWorker extends EventEmitter {

    constructor(link) {
        super()
        if (!!self.OffscreenCanvas) {
            console.log('origin offscreen')
            const worker = new Worker(link)
            // @ts-ignore
            return worker
        }
        this.ready = false
        this.on('message', data => {
            if (!this.ready) {
                setTimeout(() => this.emit('message', data), 10)
            }
        })
        console.log('fake offscreen')
        Axios
            .get(link)
            .then(r => r.data)
            .then(code => {
                const self = this
                eval(code)
                this.ready = true
                return self
            })
    }

    addEventListener(name, func) {
        this.on(name, func)
    }

    postMessage(data, opt) {
        this.emit('message', ({ data }))
    }

}
