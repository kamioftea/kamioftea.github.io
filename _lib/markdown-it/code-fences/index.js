import move from './move.js';
import truth from './truth.js';

const registry = new Map([
    ['move', move],
	['truth', truth],
]);

export default function codeFenceOverrides(md) {
	const previousFenceRenderer = md.renderer.rules.fence;

	// Default to markdown-it's existing fence renderer when no override applies.
	const renderDefaultFence = (tokens, idx, rendererOptions, env, self) => {
		if (typeof previousFenceRenderer === 'function') {
			return previousFenceRenderer(tokens, idx, rendererOptions, env, self);
		}
		return self.renderToken(tokens, idx, rendererOptions);
	};

	md.renderer.rules.fence = (tokens, idx, rendererOptions, env, self) => {
		const token = tokens[idx];
		const info = (token.info ?? '').trim();
		const language = info.split(/\s+/, 1)[0];
		const handler = registry.get(language);

		if (typeof handler === 'function') {
            try {
                const overridden = handler({
                    content: token.content,
                    token,
                    tokens,
                    idx,
                    info,
                    language,
                    rendererOptions,
                    env,
                    md,
                    renderDefault: () => renderDefaultFence(tokens, idx, rendererOptions, env, self),
                });

                if (overridden != null) {
                    return overridden;
                }
            } catch (error) {
                return `Error rendering code fence "${language}": ${error}
                
                <pre>${md.utils.escapeHtml(token.content)}</pre>`;
            }
		}

		return renderDefaultFence(tokens, idx, rendererOptions, env, self);
	};
}
