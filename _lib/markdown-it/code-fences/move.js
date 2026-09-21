import {load} from 'js-yaml';
import slug from '../../helpers/slug.js';

export default function move({content, md}) {
	const parsed = load(content);
	const name = parsed?.name ?? '';
	const renderedDescription = md.render(parsed?.description ?? '');

	return `\
        <aside class="move" id="move-${slug(name)}">
            <h2>${md.utils.escapeHtml(name)}</h2>
            ${renderedDescription}
        </aside>`;
}
