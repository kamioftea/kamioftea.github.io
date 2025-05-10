const { EleventyRenderPlugin } = require("@11ty/eleventy");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const feather = require('feather-icons');
const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

import {EleventyRenderPlugin} from '@11ty/eleventy';
import {join} from "node:path"
import {readFile} from "node:fs/promises"
import {readFileSync} from "node:fs"
import feather from 'feather-icons';
import inclusiveLangPlugin from '@11ty/eleventy-plugin-inclusive-language';
import {config} from 'dotenv';
import {globSync} from 'glob';

const dataSheets =
    await readFile(join('.', '_data', 'dataSheets.json'), "utf8")
    .then(file => JSON.parse(file));

config()

function buildDeepGetter(path) {
    if (!path) {
        return (obj) => obj
    }
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
            if (typeof resA === 'number' && typeof resB === 'number') {
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

// noinspection JSUnusedGlobalSymbols
export default function (eleventyConfig) {
    eleventyConfig.addPlugin(EleventyRenderPlugin)
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(inclusiveLangPlugin);

    eleventyConfig.ignores.add("README.md");
    eleventyConfig.ignores.add("/**/*.template.njk");
    eleventyConfig.ignores.add("/**/*.draft.njk");

    // IntelliJ doesn't like frontmatter before <!doctype html> in root layout
    // So add the layout defaults here
    eleventyConfig.addGlobalData('title', 'Jeff Horton')
    eleventyConfig.addGlobalData('layout', 'layout.njk')
    eleventyConfig.addGlobalData('maptilerKey', process.env.MAPTILER_KEY ?? '')

    eleventyConfig.addPassthroughCopy('assets')
    eleventyConfig.addPassthroughCopy('./favicon.png')

    eleventyConfig.addFilter('icon', (name) => {
        if (feather.icons[name]) {
            return feather.icons[name].toSvg();
        }

        let [path] = globSync(`./node_modules/remixicon/icons/**/${name}.svg`);
        return path ? `<span class='remix-icon'>${readFileSync(path, 'utf8')}</span>` : '';
    })
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

    eleventyConfig.addFilter('format', (date, format) => {
        return dayjs(date).format(format)
    })

    eleventyConfig.addFilter('format', (date, format) => {
        return dayjs(date).format(format)
    })

    return {
        passthroughFileCopy:    true,
        markdownTemplateEngine: 'njk',
        pathPrefix:             process.env.PATH_PREFIX ?? '',
    }
}
