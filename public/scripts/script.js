import './filters/datetime.js'

import './components/progress.js'
import './components/tab-backup.js'


const app = new Vue({
    el: '#root',
    data: () => ({
        columns: ['Nome', 'Data', 'Ações'],
        progress: 0,
        step: '',
        data: [],
        account: 'kevingood120@gmail.com',
        query: { 
            drive: 0,
            date: ''
        }
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
            const url = `actions/restore/search?date=${new Date(date).toJSON()}&drive=${drive}`
            const res = await fetch(url)
            const json = await res.json()
            this.data = json
        },
        async restore(item) {
            if(confirm(`Você deseja realmente restaurar o seu banco de dados para o dia ${new Date(item.createdAt).toLocaleDateString()}?`)) {
                const res = await fetch(`/actions/restore/${item.id}/${item.fileName}`)
                const json = await res.json()
                console.log(json)
            }
        },
        
    }
})