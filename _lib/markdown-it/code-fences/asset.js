import {load} from 'js-yaml';
import feather from 'feather-icons';
import {z} from 'zod';
import slug from '../../helpers/slug.js';

const customisationSchema = z.object({
    label: z.string(),
    value: z.string().optional(),
});

const conditionSchema = z.object({
    label: z.string(),
    active: z.boolean(),
});

const assetSchema = z.object({
    name: z.string(),
    type: z.enum(['Command Vehicle', 'Module', 'Support Vehicle', 'Path', 'Companion', 'Deed']),
    customisations: z.array(customisationSchema).optional(),
    startingAbility: z.string(),
    otherAbilities: z.array(z.object({
        text: z.string(),
        customisation: customisationSchema.optional(),
        unlocked: z.boolean()
    })).optional(),
    track: z.object({
        name: z.string(),
        max: z.number(),
        current: z.number().optional(),
        conditions: z.array(conditionSchema).max(2).optional()
    }).optional()
});

export default function asset({content, md}) {
    try {
        const parsed = load(content);
        const asset = assetSchema.parse(parsed);

        return `\
        <aside class="asset ${slug(asset.type)}" id="asset-${slug(asset.name)}">
            <header>
                <span class="type">${asset.type}</span>
                <h3>${asset.name}</h3>
            </header>
            <div class="abilities">
                ${feather.icons['hexagon'].toSvg({class: 'filled'})}
                <div class="ability">${md.render(asset.startingAbility)}</div>
            </div>
        </aside>`;

    } catch (error) {
        return `<div class="fence-error">Error parsing YAML: ${error}</div>`;
    }
}
