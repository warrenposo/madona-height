import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Kimani",
      role: "Tenant - Single Room",
      content: "Living at Madona Heights has been an excellent experience. The management is responsive, and the facilities are well-maintained.",
      rating: 5,
      initials: "JK"
    },
    {
      id: 2,
      name: "Sarah Wanjiku",
      role: "Tenant - Family Room",
      content: "Perfect for families! The security and location are outstanding. We feel safe and comfortable here.",
      rating: 5,
      initials: "SW"
    },
    {
      id: 3,
      name: "David Omondi",
      role: "Tenant - Deluxe Suite",
      content: "The quality and value are unmatched. Highly professional management team that truly cares about residents.",
      rating: 5,
      initials: "DO"
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">What Our Tenants Say</h1>
          <p className="text-xl text-muted-foreground">Real experiences from our valued residents</p>
        </div>

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
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
      </div>
    </div>
  );
};

export default Testimonials;
