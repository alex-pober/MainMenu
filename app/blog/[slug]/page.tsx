import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSortedPostsData, getPost } from '@/lib/utils/posts'
import Markdown from 'react-markdown'

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const slug = await params.slug; // Ensure `params` is awaited
    const post = getPost(slug);

    return {
      title: `${post.title} | MainMenu Blog`,
      description: post.content?.slice(0, 160),
      openGraph: {
        title: post.title,
        description: post.content?.slice(0, 160),
        type: 'article',
        publishedTime: post.date,
      },
    }
  } catch (error) {
    console.log('Error generating metadata for blog post:', error)
    return {
      title: 'Blog Post | MainMenu',
    }
  }
}

export async function generateStaticParams() {
  const posts = getSortedPostsData()
  return posts.map((post) => ({
    slug: post.id,
  }))
}

export default async function BlogPost({ params }: Props) {
  try {
    const slug = await params.slug; // Ensure `params` is awaited
    const post = getPost(slug);

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 mt-16">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <time
            dateTime={post.date}
            className="text-muted-foreground block"
          >
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>
        
           <div
            className={`
              prose 
              prose-lg 
              dark:prose-invert 
              max-w-none 
              prose-headings:font-bold 
              prose-h2:!text-3xl prose-h2:!text-black 
              prose-h3:!text-2xl prose-h3:!text-black 
              prose-h4:!text-xl prose-h4:!text-black
              prose-p:!text-black 
              prose-p:!leading-7 
              prose-li:!text-black 
              prose-li:!leading-7 
              prose-strong:font-bold
            `}
          >
            <Markdown>{post.content || ''}</Markdown>
          </div>

      </article>
    )
  } catch (error) {
    console.log('Error rendering blog post:', error)
    notFound()
  }
}
