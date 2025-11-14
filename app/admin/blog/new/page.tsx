import { requireAdmin } from '@/lib/admin'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

export const dynamic = 'force-dynamic'

export default async function NewBlogPostPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Blog Post</h1>
        <p className="text-gray-600 mt-2">Write a new blog post for your community</p>
      </div>

      <BlogPostEditor />
    </div>
  )
}
