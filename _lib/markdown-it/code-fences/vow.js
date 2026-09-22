import { z } from 'zod';
import {load} from 'js-yaml';
import { progressHtml } from '../../progress/index.js';

const vowSchema = z.object({
    level: z.enum(['troublesome', 'dangerous', 'formidable', 'extreme', 'epic']),
    slug: z.string(),
    character: z.string(),
    tags: z.array(z.string()).optional(),
    vow: z.string(),
    progress: z.number().min(0).max(40)
});

export default function vow({content, md}) {
    try {
        const parsed = load(content);
        const vow = vowSchema.parse(parsed);

        return `\
<aside class="vow" id="vow-${vow.slug}" data-tags="${[...(vow.tags ?? [vow.level]), 'vow'].join(' ')}">
    <p class="character">${vow.character}</p>
    <blockquote class="vow-text">${md.renderInline(vow.vow)}</blockquote>
    ${progressHtml(vow.progress)}
</aside>`;

    } catch (error) {
        return `<div class="fence-error">Error parsing YAML: ${error}</div>`;
    }
}
