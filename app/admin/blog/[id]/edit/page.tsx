import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { notFound } from 'next/navigation'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

export const dynamic = 'force-dynamic'

interface EditBlogPostPageProps {
  params: { id: string }
}

async function getBlogPost(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  await requireAdmin()

  const post = await getBlogPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <p className="text-gray-600 mt-2">Update your blog post content</p>
      </div>

      <BlogPostEditor post={post} />
    </div>
  )
}
