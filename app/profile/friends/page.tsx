'use client'

import { useState, useEffect, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Users, UserPlus, Send } from 'lucide-react'
import { RequestCard } from '@/components/friends/request-card'
import { FriendCard } from '@/components/friends/friend-card'
import { SentRequestCard } from '@/components/friends/sent-request-card'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface FriendRequest {
  friendship_id: string
  id: string
  first_name: string
  last_name: string
  profile_picture_url?: string
  photo_url?: string
  current_tier?: number
  message?: string
  requested_at: string
}

interface Friend {
  friendship_id: string
  id: string
  first_name: string
  last_name: string
  profile_picture_url?: string
  photo_url?: string
  current_tier?: number
  accepted_at: string
}

function FriendsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams?.get('tab') || 'friends'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      // Fetch incoming requests
      const incomingRes = await fetch('/api/friends/requests?type=incoming&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (incomingRes.ok) {
        const data = await incomingRes.json()
        setIncomingRequests(data.requests || [])
      }

      // Fetch sent requests
      const sentRes = await fetch('/api/friends/requests?type=sent&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (sentRes.ok) {
        const data = await sentRes.json()
        setSentRequests(data.requests || [])
      }

      // Fetch friends
      const friendsRes = await fetch('/api/friends/list?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (friendsRes.ok) {
        const data = await friendsRes.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFriends = friends.filter((friend) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      friend.first_name?.toLowerCase().includes(searchLower) ||
      friend.last_name?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="text-gray-600 mt-2">Manage your Nordride connections</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Friends {friends.length > 0 && `(${friends.length})`}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent {sentRequests.length > 0 && `(${sentRequests.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
              <CardDescription>Incoming friend requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : incomingRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending friend requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <RequestCard
                      key={request.friendship_id}
                      request={request}
                      onUpdate={fetchData}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>My Friends ({filteredFriends.length})</CardTitle>
              <CardDescription>Your Nordride connections</CardDescription>
              {friends.length > 0 && (
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : filteredFriends.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">
                    {searchQuery ? 'No friends found matching your search' : 'Start building your travel network!'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Add friends to see their upcoming rides and travel together
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFriends.map((friend) => (
                    <FriendCard
                      key={friend.friendship_id}
                      friend={friend}
                      onUpdate={fetchData}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Requests</CardTitle>
              <CardDescription>Pending friend requests you&apos;ve sent</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : sentRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending sent requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <SentRequestCard
                      key={request.friendship_id}
                      request={request}
                      onUpdate={fetchData}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function FriendsPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Friends</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    }>
      <FriendsPageContent />
    </Suspense>
  )
}
