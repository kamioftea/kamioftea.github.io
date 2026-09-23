import { load } from 'js-yaml';
import feather from 'feather-icons';
import { z } from 'zod';
import slug from '../../helpers/slug.js';
import { hexSvg } from '../../hex/index.js';

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

function renderTrack({ name, max, current, conditions = [] }) {
    const id = `track-${slug(name)}`;
    const description = [
        `${name} track from ${max} down to 0.`,
        ...(current != null ? [`It is currently at ${current}.`] : []),
        ...(conditions?.length > 0 ? [
            `Additionally there ${conditions.length > 1 ? 'are hexes' : 'is a hex'} for`,
            conditions
            .map(condition => `${condition.label} (${condition.active ? 'marked' : 'unmarked'})`)
            .join(' and '),
        ] : [])
    ].join(' ')

    return `\
<h3 class="hex-track-title" id="${id}-title">${name}</h3>
<div 
  class="hex-track" 
  data-name="${name}" 
  aria-labelledby="${id}-title"
  aria-description="${description}"
  style="--hex-count: ${max + 1};"
>
    ${
        Array.from({ length: max + 1 }, (_, i) => max - i)
             .map(value => hexSvg({
                 text: value,
                 className: value === current ? 'current' : ''
             }))
             .join('')
    }
    ${conditions.map(({ label, active }) => {
        return `\
<span class="condition">
  ${hexSvg({ className: `condition-hex ${active ? 'active' : ''}` })}
  <span class="condition-label">${label}</span>
</span>`
    })
    .join('')}
</div>
`;
}

export default function asset({ content, md }) {
    try {
        const parsed = load(content);
        const asset = assetSchema.parse(parsed);

        return `\
        <aside class="asset ${slug(asset.type)}" id="asset-${slug(asset.name)}">
            <header>
                <span class="type">${asset.type}</span>
                <h3>${asset.name}</h3>
            </header>
            ${asset.customisations && asset.customisations.length > 0
              ? `<dl class="customisations">
                ${asset.customisations.map(customisation => `\
                    <dt>${customisation.label}</dt>
                    <dd>${customisation.value ?? ''}</dd>
                `).join('')}
                </dl>`
              : ''
        }
            <div class="abilities">
                ${feather.icons['hexagon'].toSvg({ class: 'filled' })}
                <div class="ability">${md.render(asset.startingAbility)}</div>
            </div>
            ${asset.track
              ? renderTrack(asset.track)
              : ''
        }
        </aside>`;

    } catch (error) {
        return `<div class="fence-error">Error parsing YAML: ${error}</div>`;
    }
}
