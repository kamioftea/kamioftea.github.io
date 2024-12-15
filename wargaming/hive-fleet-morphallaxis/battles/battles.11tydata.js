// noinspection JSUnusedGlobalSymbols
export default {
    eleventyComputed: {
        breadcrumbs: ({name, breadcrumbs}) =>
                         breadcrumbs || [
                             {label: 'Home', url: '/'},
                             {label: 'Wargaming', url: '/wargaming'},
                             {
                                 label: 'Hive Fleet Morphallaxis',
                                 url:   '/wargaming/hive-fleet-morphallaxis'
                             },
                             {label: 'Battles', url: '/wargaming/hive-fleet-morphallaxis/battles'},
                             {label: name},
                         ],
    },
};
