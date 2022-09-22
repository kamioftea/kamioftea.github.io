module.exports = {
    eleventyComputed: {
        breadcrumbs: ({name}) =>
                         [
                             {label: 'Home', url: '/'},
                             {label: 'Wargaming', url: '/wargaming'},
                             {
                                 label: 'Hive Fleet Morphallaxis',
                                 url:   '/wargaming/hive-fleet-morphallaxis'
                             },
                             {label: name},
                         ],
    },
};
