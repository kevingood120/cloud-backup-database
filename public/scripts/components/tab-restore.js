const restoreTemplate = `
    <div class="restore-container">
        <p style="margin-bottom: 10px;" class="tab-title">Restaurar Backup</p>
        <div class="input-group">
            <label for="search-date">Pesquisar por data: </label>
            <input v-model.lazy="query.date" id="search-date" type="date">
        </div>
        <div class="input-group">
            <label for="search-drive">Pesquisar no: </label>
            <select v-model.lazy="query.drive" id="search-drive">
                <option value="0">Nuvem</option>
                <option value="1">Local</option>
            </select>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th v-for="(column, index) in columns" :key="index">
                        {{column}}
                    </th>
                </tr>
            </thead>

            <tbody v-if="data && data.length">
                <tr v-for="row in data" :key="row.id">
                    <td>{{row.fileName}}</td>
                    <td>{{row.createdAt | format-date}}</td>
                    <td>
                        <a @click="restore(row)" :disabled="disabled" href="javascript:void(0)">Restaurar</a>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr>
                    <td class="no-rows" :colspan="columns.length">
                        Sem linhas para serem exibidas
                    </td>
                </tr>
            </tbody>
        </table>
        <progress-system></progress-system>

        <p class="account-user">
            Conta associada: {{account}}
        </p>
    </div>
`

Vue.component('tab-restore', {
    template: restoreTemplate,
    data: () => ({
        columns: ['Nome', 'Data', 'Ações'],
        data: [],
        account: 'kevingood120@gmail.com',
        query: { 
            drive: 0,
            date: new Date().toISOString().substr(0, 10)
        },
        disabled: false
    }),
    watch: {
        query: {
            async handler(query){
                await this.getDataFromApi()
            },
            deep: true
        }
    },
    methods: {
        async getDataFromApi() {
            const { date, drive  } = this.query
            console.log(this.query)
            const url = `actions/restore/search?date=${new Date(date).toJSON()}&drive=${drive}`
            const res = await fetch(url)
            const json = await res.json()
            this.data = json
        },
        async restore(item) {
            if(confirm(`Você deseja realmente restaurar o seu banco de dados para o dia ${new Date(item.createdAt).toLocaleDateString()}?`)) {
                if(!this.disabled) {
                    
                    try {
                        this.disabled = true
                        const url = `/actions/restore/${item.id}/${item.fileName}`
                        const res = await fetch(url)
                        const json = await res.text()
                        console.log(json)
                    }
                    finally {
                        this.disabled = false
                    }
                    
                }
            }
        },
        
    }
})