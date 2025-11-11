'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music, ExternalLink, Loader2 } from 'lucide-react'
import NextImage from 'next/image'

interface SpotifyPlaylistProps {
  userId: string
  profile: any
  onUpdate: () => void
  isOwnProfile?: boolean
}

interface Playlist {
  id: string
  name: string
  external_urls: {
    spotify: string
  }
  images: Array<{
    url: string
    height: number
    width: number
  }>
  owner: {
    display_name: string
  }
  tracks: {
    total: number
  }
  collaborative: boolean
}

export function SpotifyPlaylist({ userId, profile, onUpdate, isOwnProfile = true }: SpotifyPlaylistProps) {
  const [loading, setLoading] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isConnected = profile?.spotify_connected
  const hasPlaylist = profile?.spotify_playlist_id

  useEffect(() => {
    // Check for Spotify connection success/error in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('spotify_connected') === 'true') {
        // Clear the URL parameter
        window.history.replaceState({}, '', '/profile')
        // Trigger profile reload
        onUpdate()
      }
      if (params.get('spotify_error')) {
        const error = params.get('spotify_error')
        console.error('Spotify error:', error)
        // Clear the URL parameter
        window.history.replaceState({}, '', '/profile')
      }
    }
  }, [onUpdate])

  const handleConnectSpotify = () => {
    window.location.href = '/api/spotify/auth'
  }

  const handleFetchPlaylists = async () => {
    setLoading(true)
    setShowSelector(true)
    try {
      const response = await fetch(`/api/spotify/playlists?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch playlists')
      }
      const data = await response.json()
      setPlaylists(data.playlists || [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlaylist = async () => {
    if (!selectedPlaylist) return

    setSaving(true)
    try {
      const playlist = playlists.find(p => p.id === selectedPlaylist)
      if (!playlist) return

      const response = await fetch('/api/spotify/playlist/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          playlistId: playlist.id,
          playlistName: playlist.name,
          playlistUrl: playlist.external_urls.spotify,
          playlistImage: playlist.images[0]?.url || null,
          playlistOwner: playlist.owner.display_name,
          trackCount: playlist.tracks.total,
          isCollaborative: playlist.collaborative
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save playlist')
      }

      setShowSelector(false)
      setSelectedPlaylist(null)
      onUpdate()
    } catch (error) {
      console.error('Error saving playlist:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePlaylist = async () => {
    if (!confirm('Are you sure you want to remove this playlist?')) return

    setLoading(true)
    try {
      const response = await fetch('/api/spotify/playlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to remove playlist')
      }

      onUpdate()
    } catch (error) {
      console.error('Error removing playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  // Read-only view for other users' profiles
  if (!isOwnProfile) {
    if (!hasPlaylist) {
      return null // Don't show section if no playlist
    }

    return (
      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Road Playlist</h3>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
          {profile.spotify_playlist_image ? (
            <NextImage
              src={profile.spotify_playlist_image}
              alt={profile.spotify_playlist_name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{profile.spotify_playlist_name}</p>
            {profile.spotify_playlist_owner && (
              <p className="text-xs text-gray-600">by {profile.spotify_playlist_owner}</p>
            )}
            {profile.spotify_playlist_track_count && (
              <p className="text-xs text-gray-500">{profile.spotify_playlist_track_count} tracks</p>
            )}
            <a
              href={profile.spotify_playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
            >
              Open in Spotify <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Card>
    )
  }

  // State 1: Not Connected
  if (!isConnected) {
    return (
      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Road Playlist</h3>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Music className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">No playlist connected yet.</p>
          <Button
            onClick={handleConnectSpotify}
            className="rounded-full bg-[#1DB954] hover:bg-[#1aa34a] text-white"
          >
            <Music className="h-4 w-4 mr-2" />
            Connect Spotify Account
          </Button>
        </div>
      </Card>
    )
  }

  // State 2: Connected, No Playlist Selected
  if (!hasPlaylist || showSelector) {
    return (
      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">Road Playlist</h3>

        {!showSelector ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Music className="h-4 w-4 text-green-600" />
              <span>Connected as <span className="font-medium">{profile.spotify_display_name}</span></span>
            </div>
            <Button
              onClick={handleFetchPlaylists}
              disabled={loading}
              className="w-full rounded-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Select Your Road Playlist'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Choose a playlist to link:</p>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-green-600" />
                <p className="text-sm text-gray-500">Loading your playlists...</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-xl p-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => setSelectedPlaylist(playlist.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPlaylist === playlist.id
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      {playlist.images[0] ? (
                        <NextImage
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Music className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{playlist.name}</p>
                        <p className="text-xs text-gray-500">{playlist.tracks.total} tracks</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePlaylist}
                    disabled={!selectedPlaylist || saving}
                    className="flex-1 rounded-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Playlist'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSelector(false)
                      setSelectedPlaylist(null)
                    }}
                    variant="outline"
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    )
  }

  // State 3: Playlist Selected
  return (
    <Card className="p-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-3">Road Playlist</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
          {profile.spotify_playlist_image ? (
            <NextImage
              src={profile.spotify_playlist_image}
              alt={profile.spotify_playlist_name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{profile.spotify_playlist_name}</p>
            {profile.spotify_playlist_owner && (
              <p className="text-xs text-gray-600">by {profile.spotify_playlist_owner}</p>
            )}
            {profile.spotify_playlist_track_count && (
              <p className="text-xs text-gray-500">{profile.spotify_playlist_track_count} tracks</p>
            )}
            <a
              href={profile.spotify_playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
            >
              Open in Spotify <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleFetchPlaylists}
            variant="outline"
            size="sm"
            className="flex-1 rounded-full text-xs"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              'Change Playlist'
            )}
          </Button>
          <Button
            onClick={handleRemovePlaylist}
            variant="outline"
            size="sm"
            className="flex-1 rounded-full text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            disabled={loading}
          >
            Remove
          </Button>
        </div>

        <p className="text-xs text-gray-500 italic text-center">
          This playlist will be visible to approved riders on your trips.
        </p>
      </div>
    </Card>
  )
}
