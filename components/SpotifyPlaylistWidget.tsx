'use client'

import { Music2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpotifyPlaylistWidgetProps {
  playlistUrl?: string | null
  isCollaborative?: boolean
  variant?: 'compact' | 'full' | 'badge'
  className?: string
}

// Demo playlist for rides without a real playlist
const DEMO_PLAYLIST = {
  url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', // Example: Top Hits playlist
  name: 'Road Trip Mix',
}

export default function SpotifyPlaylistWidget({
  playlistUrl,
  isCollaborative = true,
  variant = 'full',
  className = '',
}: SpotifyPlaylistWidgetProps) {
  const displayUrl = playlistUrl || DEMO_PLAYLIST.url

  // Badge variant - for ride snippets
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs text-green-600 ${className}`}>
        <Music2 className="h-3.5 w-3.5" />
        <span className="font-medium">Playlist for this trip</span>
      </div>
    )
  }

  // Compact variant - for smaller displays
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl ${className}`}>
        <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <Music2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Spotify Playlist</p>
          <p className="text-xs text-gray-600">
            {isCollaborative ? 'Add your favorite songs' : 'Listen along'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(displayUrl, '_blank')}
          className="flex-shrink-0 hover:bg-green-100"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Full variant - for detail pages
  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <Music2 className="h-8 w-8 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            Spotify Playlist
            {isCollaborative && (
              <span className="text-xs font-normal bg-green-600 text-white px-2 py-0.5 rounded-full">
                Collaborative
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isCollaborative
              ? 'This ride has a collaborative playlist! Add your favorite songs to set the vibe for the journey.'
              : 'Listen to the driver\'s curated playlist for this ride.'
            }
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => window.open(displayUrl, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-2"
            >
              <Music2 className="h-4 w-4" />
              Open in Spotify
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>

            {isCollaborative && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-2 rounded-full border border-gray-200">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Add-only permissions for approved riders
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Spotify-style bars */}
      <div className="mt-4 flex gap-1 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-green-600 rounded-t"
            style={{
              height: `${Math.random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
