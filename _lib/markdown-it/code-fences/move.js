import {load} from 'js-yaml';

export default function move({content, md}) {
	const parsed = load(content);
	const name = parsed?.name ?? '';
	const renderedDescription = md.render(parsed?.description ?? '');

	return `\
        <aside class="move">
            <h2>${md.utils.escapeHtml(name)}</h2>
            ${renderedDescription}
        </aside>`;
}
