import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, User, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: { slug: string }
}

async function getBlogPost(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users!author_id(first_name, last_name, photo_url, profile_picture_url, bio)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .single()

  if (error || !data) {
    return null
  }

  // Increment view count
  await supabase.rpc('increment', {
    row_id: data.id,
    table_name: 'blog_posts'
  }).catch(() => {
    // Fallback if RPC doesn't exist
    supabase
      .from('blog_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id)
      .then()
  })

  return data
}

async function getRelatedPosts(currentPostId: string, tags: string[], limit = 3) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image_url, published_at, tags')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .neq('id', currentPostId)
    .limit(limit)
    .order('published_at', { ascending: false })

  return data || []
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found | Nordride',
    }
  }

  return {
    title: post.meta_title || `${post.title} | Nordride Blog`,
    description: post.meta_description || post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: 'article',
      publishedTime: post.published_at,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, post.tags || [])

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

  // Simple markdown-to-HTML converter (basic implementation)
  const renderContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, i) => {
        // Headers
        if (paragraph.startsWith('# ')) {
          return `<h1 key=${i} class="text-3xl font-bold mt-8 mb-4">${paragraph.slice(2)}</h1>`
        }
        if (paragraph.startsWith('## ')) {
          return `<h2 key=${i} class="text-2xl font-bold mt-6 mb-3">${paragraph.slice(3)}</h2>`
        }
        if (paragraph.startsWith('### ')) {
          return `<h3 key=${i} class="text-xl font-bold mt-4 mb-2">${paragraph.slice(4)}</h3>`
        }

        // Bold and italic
        let formatted = paragraph
          .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')

        return `<p key=${i} class="mb-4 leading-relaxed">${formatted}</p>`
      })
      .join('')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Article Header */}
        <article>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{estimateReadingTime(post.content)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.view_count} views</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {/* Author Card */}
          {post.author && (
            <Card className="p-6 bg-gray-50">
              <div className="flex items-start gap-4">
                {(post.author.photo_url || post.author.profile_picture_url) ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image
                      src={post.author.photo_url || post.author.profile_picture_url}
                      alt={`${post.author.first_name} ${post.author.last_name}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-semibold mb-1">
                    {post.author.first_name} {post.author.last_name}
                  </p>
                  {post.author.bio && (
                    <p className="text-sm text-gray-600">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.featured_image_url && (
                      <div className="relative w-full h-32 overflow-hidden">
                        <Image
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="300px"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
