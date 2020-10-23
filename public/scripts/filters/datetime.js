Vue.filter('format-date', value => {
    return new Date(value).toLocaleString()
})