'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
    value: number
    className?: string
    duration?: number
    prefix?: string
    suffix?: string
    format?: (value: number) => string
}

/**
 * Premium animated number counter
 * 
 * Creates satisfying count-up animations for stats
 * Uses spring physics for natural motion
 */
export default function AnimatedCounter({
    value,
    className,
    duration = 1,
    prefix = '',
    suffix = '',
    format = (v) => Math.round(v).toLocaleString()
}: AnimatedCounterProps) {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    // Spring animation for smooth number transitions
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: duration * 1000
    })

    const display = useTransform(spring, (current) => format(current))

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.5 }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (isInView) {
            spring.set(value)
        }
    }, [isInView, value, spring])

    return (
        <span ref={ref} className={cn('tabular-nums', className)}>
            {prefix}
            <motion.span>{display}</motion.span>
            {suffix}
        </span>
    )
}
