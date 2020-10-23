import './filters/datetime.js'

import './components/progress.js'
import './components/tab-backup.js'
import './components/tab-restore.js'


const app = new Vue({
    el: '#root',
    data: () => ({
        selectedTab: 'restore',
        disabled: false
    }),
    methods: {
        changeTab(tab) {
            console.log(tab)
            this.selectedTab = tab
        }
    }
})