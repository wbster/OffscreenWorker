import { EventEmitter } from 'events'
import Axios from 'axios'

export class OffscreenWorker extends EventEmitter {

    /**
     * 
     * @param {string} link 
     * @param {boolean | undefined} [customCheckWorkerMode] 
     */
    constructor(link, customCheckWorkerMode) {
        super()
        this.ready = false
        this.once('ready', () => this.ready = true)
        this.init(link, customCheckWorkerMode)
    }

    /**
     * @param {string} link 
     */
    init(link, customCheckWorkerMode) {
        if (
            customCheckWorkerMode !== undefined && customCheckWorkerMode ||
            customCheckWorkerMode === undefined && !!self.OffscreenCanvas
        ) {
            this.initWorker(link)
        } else {
            this.initFakeWorker(link)
        }
    }

    /**
     * @param {string} link 
     */
    initFakeWorker(link) {
        this.ready = false
        this.once('ready', () => {
        })
        this.on('post', (data, opt) => {
            if (!this.ready) this.once('ready', () => this.emit('post', data, opt))
            else this.emit('message', data, opt)
        })
        Axios
            .get(link)
            .then(r => r.data)
            .then(code => {
                const self = this
                eval(code)
                this.emit('ready')
                return self
            })
    }

    /**
     * @param {string} link 
     */
    initWorker(link) {
        const worker = new Worker(link)
        worker.addEventListener('message', ({ data }) => this.emit('message', data))
        this.on('post', ({ data }, opt) => worker.postMessage(data, opt))
    }

    /**
     * @param {string} name 
     * @param {function(...any):void} func 
     */
    addEventListener(name, func) {
        this.on(name, func)
    }

    /**
     * 
     * @param {Object} data 
     * @param {object} [opt] 
     */
    postMessage(data, opt) {
        this.emit('post', { data }, opt)
    }

}
