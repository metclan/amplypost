import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const blogDirectory = path.join(process.cwd(), "content/blog");

export type BlogPost = {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    author?: string;
    tags: string[];
    readingTime: string;
};

export type BlogPostWithContent = BlogPost & {
    content: string;
};

type BlogFrontmatter = {
    title?: string;
    description?: string;
    date?: string | Date;
    updated?: string | Date;
    author?: string;
    tags?: string[];
};

function formatDate(value: string | Date | undefined) {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return undefined;

    return date.toISOString();
}

function getReadingTime(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));

    return `${minutes} min read`;
}

function getPostSlug(filename: string) {
    return filename.replace(/\.mdx$/, "");
}

function parsePost(filename: string): BlogPostWithContent {
    const slug = getPostSlug(filename);
    const filePath = path.join(blogDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(fileContents);
    const frontmatter = data as BlogFrontmatter;
    const date = formatDate(frontmatter.date);

    if (!frontmatter.title || !frontmatter.description || !date) {
        throw new Error(`Blog post "${filename}" is missing title, description, or date frontmatter.`);
    }

    return {
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        date,
        updated: formatDate(frontmatter.updated),
        author: frontmatter.author,
        tags: frontmatter.tags ?? [],
        readingTime: getReadingTime(content),
        content,
    };
}

function toBlogPost(post: BlogPostWithContent): BlogPost {
    return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        updated: post.updated,
        author: post.author,
        tags: post.tags,
        readingTime: post.readingTime,
    };
}

export function getAllBlogPosts(): BlogPost[] {
    if (!fs.existsSync(blogDirectory)) return [];

    return fs
        .readdirSync(blogDirectory)
        .filter((filename) => filename.endsWith(".mdx"))
        .map(parsePost)
        .sort((postA, postB) => new Date(postB.date).getTime() - new Date(postA.date).getTime())
        .map(toBlogPost);
}

export function getBlogPostBySlug(slug: string): BlogPostWithContent | null {
    const filename = `${slug}.mdx`;
    const filePath = path.join(blogDirectory, filename);

    if (!fs.existsSync(filePath)) return null;

    return parsePost(filename);
}
