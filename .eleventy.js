const { EleventyRenderPlugin } = require("@11ty/eleventy");
const feather = require('feather-icons');
const inclusiveLangPlugin = require("@11ty/eleventy-plugin-inclusive-language");
const dataSheets = require('./_data/dataSheets.json');

function buildDeepGetter(path) {
    if(!path) return (obj) => obj
    const [key, ...rest] = path.split('.');
    return (obj) => buildDeepGetter(rest.join("."))(obj[key]);
}

class Comparator {
    #fn

    constructor(fn) {
        this.#fn = this.#toComparator(fn)
    }

    #toComparator(fn) {
        return (a, b) => {
            const [resA, resB] = [fn(a), fn(b)];
            if(typeof resA === 'number' && typeof resB === 'number') {
                return resA - resB
            }
            return resA.toString().localeCompare(resB.toString())
        }
    }

    thenComparing(fn) {
        const prev = this.#fn;
        const next = this.#toComparator(fn)
        this.#fn = (a, b) => {
            const prevRes = prev(a, b);
            return prevRes || next(a, b)
        }
        return this
    }

    build() {
        return this.#fn
    }
}

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(EleventyRenderPlugin)
    eleventyConfig.addPlugin(inclusiveLangPlugin);

    eleventyConfig.ignores.add("README.md");
    eleventyConfig.ignores.add("/**/*.template.njk");
    eleventyConfig.ignores.add("/**/*.draft.njk");

    // IntelliJ doesn't like frontmatter before <!doctype html> in root layout
    // So add the layout defaults here
    eleventyConfig.addGlobalData('title', 'Jeff Horton')
    eleventyConfig.addGlobalData('layout', 'layout.njk')

    eleventyConfig.addPassthroughCopy('assets')
    eleventyConfig.addPassthroughCopy('./favicon.png')

    eleventyConfig.addNunjucksFilter('icon', (name) => feather.icons[name].toSvg())
    eleventyConfig.addNunjucksFilter('intersect', (collection, values, path) => {
        const lens = buildDeepGetter(path)

        return collection.filter((page) => values.includes(lens(page)))
    });
    eleventyConfig.addNunjucksFilter('lens', (arr, path) => {
        const lens = buildDeepGetter(path)
        return arr.map((obj) => lens(obj))
    })

    eleventyConfig.addNunjucksFilter('sortUnits', (units) =>
        [...units].sort(
            new Comparator((unit) => [...Object.keys(dataSheets)].indexOf(unit.data.type))
                .thenComparing((unit) => unit.data.name)
                .build()
        ))

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: 'njk',
        pathPrefix: process.env.PATH_PREFIX ?? ''
    }
};
