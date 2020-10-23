const tabBackupTemplate = `
    <div class="backup-container">
        <p style="margin-bottom: 10px;" class="tab-title">Backup</p>
        <progress-system></progress-system>
        <button :disabled="!semaphore" @click="beginBackup" class="btn success">Iniciar Backup</button>
        <p class="account-user">
            Conta associada: {{account}}
        </p>
    </div>
`

Vue.component('tab-backup',{
    template: tabBackupTemplate,
    data: () => ({
        account: 'kevingood120@gmail.com',
        semaphore: true
    }),
    methods: {
        async beginBackup() {
            if(this.semaphore) {
                try {
                    this.semaphore = false
                    await fetch('/actions/backup')
                }
                finally {
                    this.semaphore = true
                }
            }
        }
    }
})