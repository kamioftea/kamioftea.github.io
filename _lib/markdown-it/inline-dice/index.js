import {Mode, d100Html, dieHtml} from '../../dice/index.js';

const INLINE_DICE_PATTERN = /\[d(100|12|10|8|6|4):(-|\d+)(?::(action|oracle|hit|miss))?]/g;

function normalizeMode(sides, modeName) {
	switch (modeName) {
		case 'action':
			return Mode.ACTION;
		case 'oracle':
			return Mode.ORACLE;
		case 'hit':
			return Mode.HIT;
		case 'miss':
			return Mode.MISS;
		default:
			switch (sides) {
                case 100: return Mode.ORACLE;
                case 6: return Mode.ACTION;
                default: return Mode.UNROLLED;
            }
	}
}

function renderInlineDice({sides, result, modeName}) {
	if (result === '-') {
		if (sides === 100) {
			return d100Html({value: null, mode: Mode.UNROLLED});
		}

		return dieHtml({sides, mode: Mode.UNROLLED});
	}

	const mode = normalizeMode(sides, modeName);

	if (sides === 100) {
		return d100Html({value: Number(result), mode});
	}

	return dieHtml({sides, value: result, mode});
}

function toToken(state, type, content, referenceToken) {
	const token = new state.Token(type, '', 0);
	token.content = content;
	token.level = referenceToken.level;
	token.block = referenceToken.block;
	token.map = referenceToken.map;
	token.meta = referenceToken.meta;
	return token;
}

function transformTextToken(state, token) {
	if (token.type !== 'text' || !token.content) {
		return null;
	}

	INLINE_DICE_PATTERN.lastIndex = 0;
	const transformed = [];
	let lastIndex = 0;
	let matched = false;
	let match;

	while ((match = INLINE_DICE_PATTERN.exec(token.content)) !== null) {
		matched = true;

		if (match.index > lastIndex) {
			transformed.push(toToken(state, 'text', token.content.slice(lastIndex, match.index), token));
		}

		const [, sidesText, resultText, modeName] = match;
		transformed.push(toToken(state, 'html_inline', renderInlineDice({
			sides: Number(sidesText),
			result: resultText,
			modeName,
		}), token));

		lastIndex = match.index + match[0].length;
	}

	if (!matched) {
		return null;
	}

	if (lastIndex < token.content.length) {
		transformed.push(toToken(state, 'text', token.content.slice(lastIndex), token));
	}

	return transformed;
}

export default function inlineDice(md) {
	md.core.ruler.after('inline', 'inline-dice', (state) => {
		for (const inlineToken of state.tokens) {
			if (inlineToken.type !== 'inline' || !Array.isArray(inlineToken.children)) {
				continue;
			}

			const nextChildren = [];
			let changed = false;

			for (const child of inlineToken.children) {
				const transformed = transformTextToken(state, child);

				if (transformed) {
					nextChildren.push(...transformed);
					changed = true;
					continue;
				}

				nextChildren.push(child);
			}

			if (changed) {
				inlineToken.children = nextChildren;
			}
		}
	});
}





