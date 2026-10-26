import { supabase } from '@/lib/supabase';

export type BlogPostMeta = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  dateLabel: string;
  datePublished: string;
  author: string;
  icon: string;
  coverImage: string;
  coverImageAlt: string;
  published: boolean;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  read_time: string;
  date_label: string;
  date_published: string;
  author: string;
  icon: string;
  cover_image: string;
  cover_image_alt: string;
  published: boolean;
};

function rowToMeta(row: BlogPostRow): BlogPostMeta {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    readTime: row.read_time || '',
    dateLabel: row.date_label || '',
    datePublished: row.date_published || '',
    author: row.author || '',
    icon: row.icon || '',
    coverImage: row.cover_image || '',
    coverImageAlt: row.cover_image_alt || '',
    published: row.published,
  };
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, read_time, date_label, date_published, author, icon, cover_image, cover_image_alt, published')
    .order('date_published', { ascending: false });

  return (data || []).map(rowToMeta);
}

export async function getPublishedBlogPosts(excludeSlug?: string): Promise<BlogPostMeta[]> {
  try {
    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, read_time, date_label, date_published, author, icon, cover_image, cover_image_alt, published')
      .eq('published', true)
      .order('date_published', { ascending: false });

    if (excludeSlug) {
      query = query.neq('slug', excludeSlug);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(rowToMeta);
  } catch (e) {
    console.error('Failed to fetch published blog posts:', e);
    return [];
  }
}
