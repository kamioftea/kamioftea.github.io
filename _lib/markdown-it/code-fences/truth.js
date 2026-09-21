import {load} from 'js-yaml';
import { d100Html } from '../../dice/index.js';
import slug from '../../helpers/slug.js';

function renderResult(spec) {
    if(spec.roll) {
        return `${d100Html({value: spec.roll})}: <strong>${spec.result}</strong>`;
    }

    if(spec.choice) {
        return `<code>Chose ${spec.choice}</code> <strong>${spec.result}</strong>`;
    }

    if(spec.custom) {
        return `<code>Custom</code> <strong>${spec.result}</strong>`;
    }
}

export default function truth({content, md}) {
	const parsed = load(content);
	const title = parsed?.title ?? '';

	const renderedDescription = md.render(parsed?.description ?? '');

    console.log({ parsed, renderedDescription })

	return `\
        <aside class="truth" id="truth-${slug(title)}">
            <h2>${md.utils.escapeHtml(title)}</h2>
            <p class="result">
                ${renderResult(parsed)}
            </p>
            ${renderedDescription}
            ${parsed.followUp
              ? `<dl class='follow-up'><dt>${parsed.followUp.title}</dt>\
                 <dd>${renderResult(parsed.followUp)}</dd>`
              : ''
            }
        </aside>`;
}
