const checkMarks = [
    [[5, 95], [95, 5]],
    [[5, 5], [95, 95]],
    [[50, 0], [50, 100]],
    [[0, 50], [100, 50]]
]

const JITTER = 3;

function withJitter(value) {
    return value + (Math.random() - 0.5) * JITTER * 2; // Jitter of ±5
}

function drawCheckMarks(value) {
    const marks = checkMarks.slice(0, value);
    return `\
<svg class="check-marks" viewBox="0 0 100 100" role="img">
    ${marks.map(
        ([[x1, y1], [x2, y2]]) =>
            `\
<line 
    x1="${withJitter(x1 + JITTER)}" 
    y1="${withJitter(y1 + JITTER)}" 
    x2="${withJitter(x2 - JITTER)}" 
    y2="${withJitter(y2 - JITTER)}" 
/>`
    ).join('')}
</svg>`
}

function buildAriaLabel(fullMarks, partialMark, emptyMarks) {
    const ariaLabelParts = [];
    if (fullMarks > 0) {
        ariaLabelParts.push(`${fullMarks} filled box${fullMarks === 1 ? '' : 'es'}`);
    }
    if (partialMark > 0) {
        ariaLabelParts.push(`a partially filled box with ${partialMark} mark${partialMark === 1 ? '' : 's'}`);
    }
    if (emptyMarks > 0) {
        ariaLabelParts.push(`${emptyMarks} empty box${emptyMarks === 1 ? '' : 'es'}`);
    }

    const last = ariaLabelParts.pop();

    return ariaLabelParts.length > 0
           ? `${ariaLabelParts.join(', ')}, and ${last}`
           : last;
}

export function progressHtml(value, classes = []) {
    if (value < 0 || value > 40) {
        throw new Error(`Progress value must be between 0 and 40, got ${value}`);
    }

    const fullMarks = Math.floor(value / 4);
    const partialMark = value % 4;
    const emptyMarks = 10 - fullMarks - (partialMark > 0 ? 1 : 0);

    return `\
<div class="${['progress-track', ...classes].join(' ')}" 
     aria-label="A progress track with ${buildAriaLabel(fullMarks, partialMark, emptyMarks)}">
    ${Array.from({ length: fullMarks }, () => drawCheckMarks(4)).join('')}
    ${partialMark > 0 ? drawCheckMarks(partialMark) : ''}
    ${Array.from({ length: emptyMarks }, () => drawCheckMarks(0)).join('')}
</div>`;
}
