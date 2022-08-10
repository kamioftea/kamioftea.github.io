const json = require('./_data/jeff-horton.ghost.2022-03-12-18-35-58.json');
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')
const {PutObjectCommand, S3Client} = require("@aws-sdk/client-s3");
const {v4} = require("uuid");
const fetch = require('node-fetch')

const root = path.join('.', 'posts')
const md = require('markdown-it')('commonmark')
const image_lookup_file = path.join('.', 'image_lookup.local.json')

const s3Client = new S3Client({
    endpoint:    "https://fra1.digitaloceanspaces.com",
    region:      "us-east-1", // ignored by DO
    credentials: {
        accessKeyId:     process.env.SPACES_KEY ?? '',
        secretAccessKey: process.env.SPACES_SECRET ?? ''
    }
});

if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
}

const db = json.db[0];
const tag_lookup = Object.fromEntries(db.data.tags.map(t => [t.id, t.slug]))
const image_lookup = {}

if (fs.existsSync(image_lookup_file)) {
    const contents = fs.readFileSync(image_lookup_file, 'utf-8');
    Object.entries(JSON.parse(contents)).forEach(([k, v]) => image_lookup[k] = v)
}

const mapImageUrl = (url) => {
    if (!url) {
        return null;
    }

    if (!url.match(/^__GHOST_URL__/)) {
        return url;
    }

    if (url.match(/AoC-banner.*\.png/)) {
        url = 'https://blog.goblinoid.co.uk/content/images/2017/12/AoC-banner.png'
    } else {
        url = url.replace(/^__GHOST_URL__/, 'https://blog.goblinoid.co.uk')
    }

    if (image_lookup[url]) {
        return image_lookup[url]
    }

    const extension = url.split('.').pop();

    const newFile = `${process.env.SPACES_FOLDER ?? 'image-upload'}/${v4()}.${extension}`;
    const newUrl = `${process.env.SPACES_ROOT}/${newFile}`;

    fetch(url)
        .then(res => res.buffer())
        .then(body => saveFile(body, newFile))
        .catch(console.error)

    image_lookup[url] = newUrl;

    return newUrl;
}

function saveFile(contents, key) {
    const bucketParams = {
        Bucket: process.env.SPACES_BUCKET ?? 'default',
        Key:    key,
        Body:   contents,
        ACL:    "public-read",
    };

    return s3Client.send(new PutObjectCommand(bucketParams));
}

const filterObject = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => !!v))

const wrapLines = (str) =>
    str.split(/\s+/).reduce(
        ([curr, ...lines], word) => {
            const withWord = curr ? `${curr} ${word}` : word;
            return withWord.length <= 120
                ? [withWord, ...lines]
                : [word, curr, ...lines]
        },
        ['']
    ).reverse().join('\n')


const wrapFences = (str) => {
    let inFence = false;

    return str.split(/(\r?\n)/)
              .flatMap(line => {
                  const match = line.match(/^```[a-z]*/)
                  const lines = [line];
                  if (match) {
                      inFence
                          ? lines.push('\n{% endraw %}')
                          : lines.unshift('{% raw %}\n')
                      inFence = !inFence
                  }
                  else if (!inFence && line.trim() !== '') {
                      line = line.replaceAll(
                          /!\[([^\]]+)]\((\/content\/[^)]+)\)/g,
                          (_,title, url) => `![${title}](${mapImageUrl(`__GHOST_URL__${url}`)})`
                      )
                      return [wrapLines(line)]
                  }
                  return lines
              })
              .join('');
}

const renderCard = (index, cards) => {
    const [type, card] = cards[index]

    switch (type) {
        case 'markdown':
            return wrapFences(card.markdown)

        case 'bookmark':
            const card_yaml = filterObject({
                url:       card.metadata.url,
                title:     card.metadata.title,
                icon_url:  card.metadata.icon,
                author:    card.metadata.author,
                publisher: card.metadata.publisher,
                image_url: card.metadata.thumbnail,
                content:   md.renderInline(card.metadata.description)
            })

            return `{% renderFile './_includes/cards/bookmark.njk', ${JSON.stringify(card_yaml, null, ' ')} %}`

        case 'html':
            return card.html.replaceAll(/src="(__GHOST_URL__[^"]+)"/g, (_, url) => `src="${mapImageUrl(url)}"`);

        case 'image':
            return `<img src="${mapImageUrl(card.src)}" alt="${card.alt ?? 'TODO'}" style="width: ${card.width}; height: ${card.height};" />`

        default:
            console.log(`Unknown card: ${type}`, card)
    }
}

const buildAttrsString = attrs => {
    if (!Array.isArray(attrs) || attrs.length < 2) {
        return '';
    }
    let [key, value, ...rest] = attrs;
    if(key === 'src') {
        value = mapImageUrl(value)
    }

    return ` ${key}="${value}${buildAttrsString(rest)}"`
};

const renderMarkers = (markers, mobiledoc) => {
    const [string] = markers.reduce(
        ([string, tags], [textTypeId, openMarkupIndices, numberClosedMarkups, value]) => {
            const out = [string];

            openMarkupIndices.forEach(id => {
                if (!mobiledoc?.markups[id]) {
                    console.log(mobiledoc)
                }
                const [tag, attrs] = mobiledoc.markups[id];
                out.push(`<${tag}${(buildAttrsString(attrs))}>`)
                tags.push(tag);
            })

            if (textTypeId === 0) {
                out.push(value)
            }
            else {
                console.log('Atoms unimplemented', value, mobiledoc.atoms[value])
            }

            for (let i = 0; i < numberClosedMarkups; i++) {
                const tag = tags.pop();
                out.push(`</${tag}>`)
            }

            return [out.join(''), tags]
        },
        ['', []]
    )

    return string
}

const renderSection = ([type, value, markers], mobiledoc) => {
    switch (type) {
        case 1: // inline-tag
            switch (value) {
                case 'p':
                    return [wrapLines((renderMarkers(markers, mobiledoc)))]

                default:
                    return [`<${value}>${renderMarkers(markers, mobiledoc)}</${value}>`]
            }

        case 3: // list
            return [
                `<${value}>
${markers.map(liMarkers => `    <li>
        ${renderMarkers(liMarkers, mobiledoc)}
    </li>`).join('\n')}
</ul>`
            ]
        case 10: // card
            return [renderCard(value, mobiledoc.cards)];

        default:
            console.log('Unsupported', type, value)
            return []
    }
}

for (const post of db.data.posts) {
    const filename = `${post.slug}.md`;
    const filePath = path.join(root, filename);
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath)
    }

    post.mobiledoc = JSON.parse(post.mobiledoc)
    const tags = db.data.posts_tags
                   .filter(pt => pt.post_id === post.id)
                   .sort((a, b) => a.sort_order - b.sort_order)
                   .map(pt => tag_lookup[pt.tag_id])

    const frontMatter = {
        tags:                           ['post', ...tags],
        title:                          post.title,
        header:                         post.title,
        date:                           post.published_at ?? post.created_at,
        updated:                        post.updated_at,
        eleventyExcludeFromCollections: post.published_at == null,
        coverImage:                     mapImageUrl(post.feature_image),
    }

    const yaml = YAML.stringify(frontMatter);

    const markdown = [];
    for (const section of post.mobiledoc.sections) {
        markdown.push(...renderSection(section, post.mobiledoc))
    }

    let contents = `---\n${yaml}---\n${markdown.join("\n\n")}`;

    fs.writeFileSync(filePath, contents, 'utf-8');
}

fs.writeFileSync(image_lookup_file, JSON.stringify(image_lookup, null, ' '), 'utf-8')
