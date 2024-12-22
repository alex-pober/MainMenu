import { Metadata } from 'next'
import Link from 'next/link'
import { getSortedPostsData } from '@/lib/utils/posts'

export const metadata: Metadata = {
  title: 'Blog | MainMenu',
  description: 'Read our latest blog posts about gaming, technology, and more.',
  openGraph: {
    title: 'Blog | MainMenu',
    description: 'Read our latest blog posts about gaming, technology, and more.',
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = getSortedPostsData()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 mt-16">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <Link href={`/blog/${post.id}`}>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2 hover:text-primary">
                  {post.title}
                </h2>
                <time
                  dateTime={post.date}
                  className="text-muted-foreground block mb-4"
                >
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
