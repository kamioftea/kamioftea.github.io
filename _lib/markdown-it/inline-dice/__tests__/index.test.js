import MarkdownIt from 'markdown-it';
import {describe, expect, it} from '@jest/globals';
import inlineDice from '../index.js';

describe('inline dice markdown plugin', () => {
	it('renders a rolled single die without a mode', () => {
		const md = new MarkdownIt();
		md.use(inlineDice);

		const html = md.render('A result of [d12:6].');

		expect(html).toContain('A result of ');
		expect(html).toContain('aria-label="A d12 with value 6"');
		expect(html).toContain('class="die small"');
	});

	it('renders percentile rolls using two d10s and the provided mode', () => {
		const md = new MarkdownIt();
		md.use(inlineDice);

		const html = md.render('Rolled [d100:15:oracle].');

		expect(html).toContain('aria-label="A d10 with value 1"');
		expect(html).toContain('aria-label="A d10 with value 5"');
		expect(html).toContain('class="die oracle small"');
	});

	it('renders an unrolled die placeholder', () => {
		const md = new MarkdownIt();
		md.use(inlineDice);

		const html = md.render('Waiting on [d10:-].');

		expect(html).toContain('aria-label="A d10"');
		expect(html).toContain('class="die unrolled small"');
	});

	it('leaves invalid dice syntax untouched', () => {
		const md = new MarkdownIt();
		md.use(inlineDice);

		const html = md.render('Ignore [d3:6] and [not-a-die].');

		expect(html).toContain('[d3:6]');
		expect(html).toContain('[not-a-die]');
	});
});

