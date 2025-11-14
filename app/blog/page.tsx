import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Eye, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog | Nordride',
  description: 'Read the latest updates, tips, and stories from the Nordride community',
}

async function getBlogPosts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users!author_id(first_name, last_name, photo_url, profile_picture_url)
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[2.15rem] font-bold mb-4 text-gray-900">Blog</h1>
          <p className="text-[1.1rem] text-gray-600">
            Read the latest updates, tips, and stories from the Nordride community
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                  {post.featured_image_url && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{estimateReadingTime(post.content)}</span>
                      </div>
                      {post.view_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.view_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Author */}
                    {post.author && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        {(post.author.photo_url || post.author.profile_picture_url) ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative">
                            <Image
                              src={post.author.photo_url || post.author.profile_picture_url}
                              alt={`${post.author.first_name} ${post.author.last_name}`}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm text-gray-600">
                          {post.author.first_name} {post.author.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
