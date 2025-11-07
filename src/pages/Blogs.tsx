import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("blogs").select();
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
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{blog.category}</Badge>
                    <span className="text-sm text-muted-foreground">{blog.date}</span>
                  </div>
                  <CardTitle className="text-2xl hover:text-primary transition-colors">
                    {blog.title}
                  </CardTitle>
                  <CardDescription className="text-base">{blog.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="#" className="text-primary hover:underline font-medium">Read more →</a>
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
