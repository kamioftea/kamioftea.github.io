export const Mode = {
    UNROLLED: 'unrolled',
    ACTION: 'action',
    ORACLE: 'oracle',
    HIT: 'hit',
    MISS: 'miss',
}

export const Dice = {
    Unrated: null,
    D4: 4,
    D6: 6,
    D8: 8,
    D10: 10,
    D12: 12,
}

export const DisplaySize = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
}

function objToAttr(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}="${value}"`).join(' ')
}

export function d100Html(
    {
        value,
        displaySize = DisplaySize.SMALL,
        mode = value == null ? Mode.UNROLLED : Mode.ORACLE,
    }) {
    const tens = value != null ? Math.floor(value / 10) : null;
    const units = value != null ? value % 10 : null;

    return [
       dieHtml({sides: Dice.D10, value: tens, displaySize, mode, extraClasses: ['d100']}),
       dieHtml({sides: Dice.D10, value: units, displaySize, mode, extraClasses: ['d100']}),
    ].join('');
}

    export function dieHtml(
        {
            displaySize = DisplaySize.SMALL,
            sides = Dice.D10,
            mode = Mode.UNROLLED,
            value = sides,
            extraClasses = [],
        }
    ) {
        const data = getDieData(sides);
        const label = getLabel(mode, sides, value);

        if (!data) {
            console.error(sides, ' Not a valid die');
            return '<span class="die die-error" title="Not a valid die">?</span>';
        }

        const textProps = {
            'text-anchor': "middle",
            'font-size': "15px",
            'font-weight': "bold",
            'aria-hidden': "true",
            ...data.text
        }
        const clipPath = data.clipPath ?? null;

        return `<svg
        class="${['die', mode, displaySize, ...extraClasses].filter(cl => !!cl).join(' ')}"
        viewBox="${data.viewBox}"
        role="img"
        aria-label="${label}"
    >
        <g${clipPath ? ` clipPath="${clipPath.id}"` : ''}>
            ${data.paths.map((path) => `<path d="${path}" />`)}
            <text ${objToAttr(textProps)}>${value}</text>
        </g>    
        ${clipPath ? `<defs>${clipPath.html}</defs>` : ''}
    </svg>`;
    }

    function getDieData(sides) {
        switch (sides) {
            case Dice.D4:
                return {
                    viewBox: '0 0 30 26',
                    paths: ['M14.6814 25.5209L29.5 0H0L14.6814 25.5209Z'],
                    text: { x: 14, y: 15 },
                    clipPath: {
                        id: 'd4-clip0',
                        html: `<clipPath id="d4-clip0"><rect width="29.5" height="25.5209" fill="white" /></clipPath>`
                    },
                }
            case Dice.D6:
                return {
                    viewBox: '0 0 23 23',
                    paths: ['M21 2H2V21H21Z'],
                    text: { x: 11, y: 16, 'font-size': '12px' },
                }
            case Dice.D8:
                return {
                    viewBox: '0 0 56 57',
                    paths: ['M27.8735 2.00001L1.52148 28.3521L27.8735 54.7041L54.2256 28.3521L27.8735 2.00001Z'],
                    text: {
                        x: 27,
                        y: 38,
                        'font-size': '28px',
                    }
                }
            case Dice.D10:
                return {
                    viewBox: '0 0 26 28',
                    paths: ['M13 0L0 9.41935V18.5806L13 28L26 18.5806V9.41935L13 0Z'],
                    text: { x: 12.8, y: 19 },
                }
            case Dice.D12:
                return {
                    viewBox: '0 0 26 27',
                    paths: ['M4.94 2.57143L0 9.38571V17.7429L4.94 24.4286L13 27L21.06 24.4286L26 17.7429V9.38571L21.06 2.57143L13 0L4.94 2.57143Z'],
                    text: { x: 12.4, y: 19 },
                }
        }
    }

    function getLabel(mode, sides, value) {
        switch (mode) {
            case Mode.UNROLLED:
                return `A d${sides}`
            case Mode.HIT:
                return `A d${sides} with value ${value}, which is a Hit`;
            case Mode.MISS:
                return `A d${sides} with value ${value}, which is a Miss`;
            default:
                return `A d${sides} with value ${value}`;
        }
    }
