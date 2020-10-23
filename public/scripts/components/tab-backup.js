const tabBackupTemplate = `
    <div class="backup-container">
        <p style="margin-bottom: 10px;" class="tab-title">Backup</p>
        <progress-system :step="step" :progress="progress"></progress-system>
        <button :disabled="!semaphore" @click="beginBackup" class="btn success">Iniciar Backup</button>
        <p class="account-user">
            Conta associada: {{account}}
        </p>
    </div>
`

Vue.component('tab-backup',{
    template: tabBackupTemplate,
    data: () => ({
        progress: 0,
        step: 'Tudo pronto',
        account: 'kevingood120@gmail.com',
        socket: null,
        semaphore: true
    }),
    methods: {
        async beginBackup() {
            if(this.semaphore) {
                try {
                    this.semaphore = false
                    const res = await fetch('/actions/backup')
                    console.log(res.status)
                }
                catch {
                    this.socket.disconnect()
                    this.task = 'Erro ao realizar backup'
                }
                finally {
                    this.semaphore = true
                }
            }
        },
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
    },
    unmounted() {
        this.socket.disconnect()
    }
})