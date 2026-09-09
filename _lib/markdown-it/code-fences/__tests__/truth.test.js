import MarkdownIt from 'markdown-it';
import codeFenceOverrides from '../index.js';
import {describe, it, expect} from '@jest/globals';

describe('truth code fence override', () => {
	it('renders truth fence yaml into truth aside', () => {
		const md = new MarkdownIt();
		codeFenceOverrides(md);

		const input = [
			'```truth',
			'title: Cataclysm',
			'roll: 17',
			'result: |',
			'  **The Sun Plague extinguished the stars in our home galaxy.**',
			'  ',
			'  The anomaly traveled at incredible speeds, many times faster than light itself, and snuffed out the stars around us ',
			'  before we realized it was coming. Few of us survived as we made our way to this new galaxy. Here in the Forge, the',
			'  stars are still aflame. We cling to their warmth like weary travelers huddled around a fire.',
			'followUp:',
			"  title: 'We suspect the Sun Plague was caused by:'",
			'  roll: 68',
			'  resultBand: 51-75',
			'  resultValue: Superweapon run amok',
			'questStarter: |',
			'  The galaxy your people left behind is a cold, lightless grave. But a solitary star still glows, a beacon in a vast ',
			'  darkness. How did this star survive the plague? Why do you vow to find the means to travel across the immeasurable ',
			'  gulf to this distant light?',
			'```',
		].join('\n');

		expect(md.render(input)).toMatchSnapshot();
	});
});
