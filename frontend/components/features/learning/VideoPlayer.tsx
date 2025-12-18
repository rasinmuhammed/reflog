// @ts-nocheck
'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Youtube, AlertCircle } from 'lucide-react'

// Dynamic import to avoid SSR issues with react-player
const ReactPlayer = dynamic(() => import('react-player'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
    )
})

interface VideoPlayerProps {
    url: string
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void
}

export default function VideoPlayer({ url, onProgress }: VideoPlayerProps) {
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const playerRef = useRef<any>(null)

    // Validate URL
    const isValidUrl = url && (
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com')
    )

    if (!isValidUrl) {
        return (
            <div className="relative w-full pt-[56.25%] bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                    <AlertCircle className="w-10 h-10 mb-3 text-yellow-500/50" />
                    <p className="text-sm">Please paste a valid YouTube or Vimeo URL</p>
                    <p className="text-xs mt-1 text-white/30">Example: https://www.youtube.com/watch?v=...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="relative w-full pt-[56.25%] bg-[#1a1a1a] rounded-xl overflow-hidden border border-red-500/20">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                    <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                    <p className="text-sm text-red-400">Failed to load video</p>
                    <p className="text-xs mt-1">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full">
                <ReactPlayer
                    ref={playerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    playing={false}
                    controls={true}
                    onReady={() => setReady(true)}
                    onError={(e: any) => {
                        console.error('Video player error:', e)
                        setError('Could not load video. Check the URL.')
                    }}
                    onProgress={onProgress || (() => { })}
                    config={{
                        youtube: {
                            playerVars: {
                                showinfo: 1,
                                origin: typeof window !== 'undefined' ? window.location.origin : ''
                            }
                        }
                    }}
                />
            </div>

            {/* Loading overlay */}
            {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                        <Youtube className="w-12 h-12 mx-auto mb-3 text-red-500 animate-pulse" />
                        <p className="text-white/60 text-sm">Loading video...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

