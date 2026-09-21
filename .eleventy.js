import {EleventyRenderPlugin} from '@11ty/eleventy';
import {join} from "node:path"
import {readFile} from "node:fs/promises"
import {readFileSync} from "node:fs"
import feather from 'feather-icons';
import inclusiveLangPlugin from '@11ty/eleventy-plugin-inclusive-language';
import {config} from 'dotenv';
import {globSync} from 'glob';
import { load } from 'js-yaml';
import codeFenceOverrides from './_lib/markdown-it/code-fences/index.js';
import inlineDice from './_lib/markdown-it/inline-dice/index.js';
import deflist from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'

import dayjs from 'dayjs';
// noinspection JSFileReferences
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
dayjs.extend(advancedFormat);

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
    eleventyConfig.addPlugin(inclusiveLangPlugin);

    // Add support for YAML data files with .yml extension
    eleventyConfig.addDataExtension("yml", contents => load(contents));

    eleventyConfig.ignores.add("README.md");
    eleventyConfig.ignores.add("/**/*.template.njk");
    eleventyConfig.ignores.add("/**/*.draft.njk");

    // IntelliJ doesn't like frontmatter before `<!doctype html>` in root layout
    // So add the layout defaults here
    eleventyConfig.addGlobalData('title', 'Jeff Horton')
    eleventyConfig.addGlobalData('layout', 'layout.njk')
    eleventyConfig.addGlobalData('maptilerKey', process.env.MAPTILER_KEY ?? '')

    eleventyConfig.addCollection('postsByDate', (collectionApi) =>
        collectionApi.getFilteredByTag('post').sort((a, b) => b.date - a.date)
    )

    eleventyConfig.addPassthroughCopy('assets')
    eleventyConfig.addPassthroughCopy('./favicon.png')

    // Don't process folders for Sveltia CMS
    eleventyConfig.addPassthroughCopy("assets/img"); // don't process the image folder
    eleventyConfig.addPassthroughCopy("admin/"); // don't process the CMS folder

    eleventyConfig.addFilter('date', (date, format = 'YYYY-MM-DD') => dayjs(date).format(format));

    eleventyConfig.addNunjucksFilter('icon', (name) => {
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

    eleventyConfig.amendLibrary("md", (mdLib) => {
        mdLib.use(inlineDice);
        mdLib.use(codeFenceOverrides);
        mdLib.use(deflist);
        mdLib.use(footnote);
    });

    return {
        passthroughFileCopy:    true,
        markdownTemplateEngine: 'njk',
        pathPrefix:             process.env.PATH_PREFIX ?? '',
    }
}
