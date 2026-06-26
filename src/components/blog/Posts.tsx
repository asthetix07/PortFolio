import { Grid, Text, Column } from "@once-ui-system/core";
import Post from "./Post";
import { supabase } from "@/lib/supabase";
import { Blog as DBBlog } from "@/types/database.types";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
}

export async function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
}: PostsProps) {
  let dbBlogs: DBBlog[] = [];

  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      dbBlogs = data;
    }
  } catch (err) {
    console.error("Failed to fetch blog posts from Supabase:", err);
  }

  let mappedBlogs = dbBlogs.map((b) => ({
    slug: b.slug,
    content: b.content,
    metadata: {
      title: b.title,
      summary: b.description,
      publishedAt: b.created_at,
      image: b.cover_url || undefined,
      tag: undefined,
    },
  }));

  if (exclude.length) {
    mappedBlogs = mappedBlogs.filter((post) => !exclude.includes(post.slug));
  }

  const displayedBlogs = range
    ? mappedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : mappedBlogs.length)
    : mappedBlogs;

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {displayedBlogs.map((post) => (
            <Post key={post.slug} post={post} thumbnail={thumbnail} direction={direction} />
          ))}
        </Grid>
      )}
    </>
  );
}
