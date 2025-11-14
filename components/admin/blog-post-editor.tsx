'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Save, Eye, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

interface BlogPost {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_url: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  meta_title: string
  meta_description: string
  tags: string[]
}

interface BlogPostEditorProps {
  post?: BlogPost
}

export function BlogPostEditor({ post }: BlogPostEditorProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [formData, setFormData] = useState<BlogPost>({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featured_image_url: post?.featured_image_url || '',
    status: post?.status || 'draft',
    published_at: post?.published_at || null,
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    tags: post?.tags || [],
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: post ? prev.slug : generateSlug(title)
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async (newStatus?: 'draft' | 'published' | 'archived') => {
    setLoading(true)
    setError('')

    try {
      const status = newStatus || formData.status
      const dataToSave = {
        ...formData,
        status,
        published_at: status === 'published' && !formData.published_at
          ? new Date().toISOString()
          : formData.published_at,
        author_id: user?.id
      }

      if (post?.id) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(dataToSave)
          .eq('id', post.id)

        if (updateError) throw updateError
      } else {
        // Create new post
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(dataToSave)

        if (insertError) throw insertError
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      console.error('Error saving blog post:', err)
      setError(err.message || 'Failed to save blog post')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post?.id) return
    if (!confirm('Are you sure you want to delete this blog post?')) return

    setLoading(true)
    try {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id)

      if (deleteError) throw deleteError

      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      console.error('Error deleting blog post:', err)
      setError(err.message || 'Failed to delete blog post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
        <div className="flex gap-2">
          {post?.id && (
            <>
              <Button variant="outline" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              {formData.status === 'published' && (
                <Button variant="outline" asChild>
                  <Link href={`/blog/${formData.slug}`} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={loading}
          >
            {formData.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter post title"
              required
              disabled={loading}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="post-url-slug"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">URL: /blog/{formData.slug}</p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black min-h-[100px]"
              placeholder="Brief summary of the post"
              disabled={loading}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black min-h-[400px] font-mono text-sm"
              placeholder="Write your blog post content (supports Markdown)"
              required
              disabled={loading}
            />
          </div>

          {/* Featured Image URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Featured Image URL</label>
            <input
              type="url"
              value={formData.featured_image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Add a tag and press Enter"
                disabled={loading}
              />
              <Button type="button" onClick={addTag} disabled={loading}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="border-t pt-6 space-y-6">
            <h3 className="font-semibold">SEO Settings</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="SEO title (defaults to post title)"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black min-h-[100px]"
                placeholder="SEO description (defaults to excerpt)"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
