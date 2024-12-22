import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'blogs');

// Define the type for post metadata
interface PostMetadata {
  title: string;
  date: string;
  [key: string]: any; // Additional metadata fields
}

// Define the type for a post
interface PostData extends PostMetadata {
  id: string;
  content?: string;
}

export function getSortedPostsData(): PostData[] {
  // Get file names under /blogs
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: PostData[] = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as PostMetadata),
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(id: string): PostData {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  return {
    id,
    content: matterResult.content,
    ...(matterResult.data as PostMetadata),
  };
}
