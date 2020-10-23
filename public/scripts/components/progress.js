const progressTemplate = `
    <div>
        <div class="progress">
            <span>{{progress + '%'}}</span>
            <div class="value" v-bind:style="{ width: progress + '%' }"></div>
        </div>
        <p class="step">{{step}}</p>
    </div>
`

Vue.component('progress-system', {
    template: progressTemplate,
    data() {
        return {
            socket: null,
            progress: 0,
            step: 'Pronto'
        }
    },
    methods: {
        onProgress(progress) {
            this.progress = progress
        },
        onStep(step) {
            this.step = step
        }
    },
    mounted() {
        this.socket = io()
        this.socket.on('progress', this.onProgress)
        this.socket.on('step', this.onStep)
    }
})