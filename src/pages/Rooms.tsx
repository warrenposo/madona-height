import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: number;
  type: string;
  price: number;
  description: string;
  features: string[];
  image_url?: string;
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<number | null>(null); // room id being booked
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("rooms").select();
      if (error) {
        setError("Failed to fetch rooms!");
        setLoading(false);
        return;
      }
      setRooms(
        (data || []).map((room: any) => ({
          ...room,
          features: room.features || [],
          image_url: room.image_url || undefined,
        }))
      );
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // Booking logic
  const handleBook = async (room: Room) => {
    setBooking(room.id);
    // Check auth
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to book a room.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    // Optionally, prompt for confirmation (expand for date)
    if (!window.confirm(`Book the ${room.type} for KSh ${room.price.toLocaleString()} per month?`)) {
      setBooking(null);
      return;
    }
    // Create booking
    const { error } = await supabase.from("bookings").insert({
      user_id: userData.user.id,
      room_id: room.id,
      price: room.price,
      status: "pending",
    });
    setBooking(null);
    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Booking Successful!",
      description: `Your booking for ${room.type} was submitted. Our team will contact you soon.`,
    });
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Rooms</h1>
          <p className="text-xl text-muted-foreground">Find the perfect space for your needs</p>
        </div>

        {loading ? (
          <div className="text-center text-lg">Loading rooms...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-muted-foreground">No rooms available.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {room.image_url ? (
                    <img
                      src={room.image_url}
                      alt={`${room.type} Room`}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-muted-foreground">No Image</span>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{room.type}</CardTitle>
                  <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">
                      KSh {room.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground"> /month</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(room.features || []).map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" onClick={() => handleBook(room)} disabled={booking === room.id}>
                    {booking === room.id ? 'Booking...' : 'Book Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
