import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function getBlogPosts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users!author_id(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data
}

export default async function AdminBlogPage() {
  await requireAdmin()

  const posts = await getBlogPosts()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Manage your blog content</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No blog posts yet</p>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {post.featured_image_url && (
                    <div className="w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="192px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            By {post.author?.first_name} {post.author?.last_name}
                          </span>
                          <span>•</span>
                          <span>{formatDate(post.created_at)}</span>
                          {post.published_at && (
                            <>
                              <span>•</span>
                              <span>Published {formatDate(post.published_at)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.view_count} views
                          </span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {post.tags.map((tag: string) => (
                              <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
