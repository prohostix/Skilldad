import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

const CountingNumber = ({ value, duration = 2, suffix: manualSuffix }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const strValue = String(value);
    const target = parseFloat(strValue.replace(/[^0-9.]/g, '')) || 0;
    const autoSuffix = strValue.replace(/[0-9.]/g, '');
    const suffix = manualSuffix || autoSuffix;

    const springValue = useSpring(0, {
        stiffness: 25,
        damping: 15,
        duration: duration * 1000 // Convert to ms for reference, though spring uses stiffness/damping
    });

    const hasDecimal = strValue.includes('.');
    const decimalPlaces = hasDecimal ? strValue.split('.')[1].replace(/[^0-9]/g, '').length : 0;

    const displayValue = useTransform(springValue, (latest) => {
        if (hasDecimal) {
            return latest.toLocaleString(undefined, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces
            });
        }
        return Math.floor(latest).toLocaleString();
    });


    useEffect(() => {
        if (isInView) {
            springValue.set(target);
        }
    }, [isInView, target, springValue]);

    return (
        <span ref={ref}>
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    );
};

export default CountingNumber;

