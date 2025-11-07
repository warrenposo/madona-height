import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Blog {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  date: string;
  category?: string;
  image_url?: string;
  featured?: boolean;
  published?: boolean;
  published_at?: string;
  views?: number;
  slug?: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) {
        setError("Failed to fetch blogs!");
        setLoading(false);
        return;
      }
      setBlogs(data || []);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-xl text-muted-foreground">Stay updated with the latest news and tips</p>
        </div>
        {loading ? (
          <div className="text-center text-lg">Loading blogs...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-muted-foreground">No blog posts found.</div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {blogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                {blog.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2 items-center">
                      {blog.category && <Badge variant="secondary">{blog.category}</Badge>}
                      {blog.featured && <Badge variant="default">Featured</Badge>}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {blog.published_at 
                        ? new Date(blog.published_at).toLocaleDateString()
                        : blog.date || 'No date'}
                    </span>
                  </div>
                  <CardTitle className="text-2xl hover:text-primary transition-colors">
                    {blog.title}
                  </CardTitle>
                  {blog.excerpt && (
                    <CardDescription className="text-base">{blog.excerpt}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <a href="#" className="text-primary hover:underline font-medium">Read more →</a>
                    {blog.views !== undefined && (
                      <span className="text-sm text-muted-foreground">{blog.views} views</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
