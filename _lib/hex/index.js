export function hexPoint(center, size, index, hexType = 'POINTY_TOP') {
    //https://www.redblobgames.com/grids/hexagons/#angles
    const angle_deg = 60 * index + (hexType === 'POINTY_TOP' ? -30 : 0);
    const angle_rad = Math.PI / 180 * angle_deg
    return {
        x: center.x + size * Math.cos(angle_rad),
        y: center.y + size * Math.sin(angle_rad)
    };
}

export const hexSvg = ({text, className}) => {
    const strokeWidth = 6;
    const hexPoints =
        Array.from({length: 6})
             .map((_, i) => hexPoint({x: 50, y: 50}, 47, i))

    const [start, ...remainingPoints] = hexPoints;
    const pathVertexes = remainingPoints.map(({x, y}) => `L ${x} ${y}`).join(' ');

    const hexPath = `M ${start.x} ${start.y} ${pathVertexes} Z`
    const halfStrokeWidth = strokeWidth / 2;
    const xValues = hexPoints.map(({x}) => x);
    const yValues = hexPoints.map(({y}) => y);
    const minX = Math.min(...xValues) - halfStrokeWidth;
    const maxX = Math.max(...xValues) + halfStrokeWidth;
    const minY = Math.min(...yValues) - halfStrokeWidth;
    const maxY = Math.max(...yValues) + halfStrokeWidth;
    const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

    return `\
    <svg
        viewBox="${viewBox}"
        xmlns="http://www.w3.org/2000/svg"
        class="hex-code${className ? ` ${className}` : ''}"
        aria-label="${text}"
    >
        <path stroke-width="${strokeWidth}" d="${hexPath}" />
        ${text != null
          ? `<text x="50" y="50" dominant-baseline="middle" text-anchor="middle">${text}</text>`
          : ''
        }
    </svg>`;
}
