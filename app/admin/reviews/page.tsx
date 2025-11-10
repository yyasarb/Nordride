import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getReviews() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users!reviewer_id(first_name, last_name, email),
      reviewee:users!reviewee_id(first_name, last_name, email),
      ride:rides(origin_address, destination_address, departure_time)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

export default async function ReviewsPage() {
  await requireAdmin()

  const reviews = await getReviews()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <p className="text-gray-600 mt-2">View and moderate user reviews</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({reviews.length})</CardTitle>
          <CardDescription>Recent reviews from the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No reviews found</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {review.reviewer?.first_name} {review.reviewer?.last_name}
                        <span className="text-gray-600"> → </span>
                        {review.reviewee?.first_name} {review.reviewee?.last_name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${review.reviewee_id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Reviewee
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {review.ride && (
                    <p className="text-xs text-gray-600">
                      Trip: {review.ride.origin_address} → {review.ride.destination_address}
                    </p>
                  )}

                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {review.text}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Rating: {review.rating}/5</span>
                    <span>•</span>
                    <span>Visible: {review.is_visible ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
