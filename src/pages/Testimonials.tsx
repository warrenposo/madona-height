import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role?: string;
  content: string;
  rating: number;
  initials?: string;
  user_id?: string;
  created_at?: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        setError("Failed to fetch testimonials!");
        setLoading(false);
        return;
      }
      
      // Map data and generate initials if not provided
      const mappedTestimonials = (data || []).map((testimonial: any) => {
        const nameParts = testimonial.name?.split(" ") || [];
        const initials = testimonial.initials || 
          (nameParts.length >= 2 
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : nameParts[0]?.[0]?.toUpperCase() || "U");
        
        return {
          ...testimonial,
          initials,
          rating: testimonial.rating || 5,
        };
      });
      
      setTestimonials(mappedTestimonials);
      setLoading(false);
    };
    
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">What Our Tenants Say</h1>
          <p className="text-xl text-muted-foreground">Real experiences from our valued residents</p>
        </div>

        {loading ? (
          <div className="text-center text-lg">Loading testimonials...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-muted-foreground">No testimonials available yet.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role || "Tenant"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
