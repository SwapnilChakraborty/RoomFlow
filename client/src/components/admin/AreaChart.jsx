import React from 'react';
import { motion } from 'framer-motion';

export function AreaChart({ data = [30, 45, 25, 60, 40, 75, 50], color = "#0D9488" }) {
    const max = Math.max(...data);
    const width = 800;
    const height = 200;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / max) * height;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <motion.polygon
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    points={areaPoints}
                    fill="url(#areaGradient)"
                />

                {/* Line */}
                <motion.polyline
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />

                {/* Dots */}
                {data.map((val, i) => (
                    <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        cx={(i / (data.length - 1)) * width}
                        cy={height - (val / max) * height}
                        r="4"
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
}
