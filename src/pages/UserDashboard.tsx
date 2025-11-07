import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Home, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "warrenokumu98@gmail.com";

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
}

interface UserBooking {
  id: number;
  room_id: number;
  room_type: string;
  price: number;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  status: string;
  payment_date: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
}

const UserDashboard = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentBooking, setCurrentBooking] = useState<UserBooking | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch user, profile, booking, and payments
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingData(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        setLoadingData(false);
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Fetch admin id (by role) with fallback
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        
        if (adminError) {
          console.error('Error fetching admin:', adminError);
          // Fallback: try by email
          const { data: emailData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', ADMIN_EMAIL)
            .limit(1)
            .maybeSingle();
          if (emailData?.id) setAdminId(emailData.id);
        } else if (adminData?.id) {
          setAdminId(adminData.id);
        }
      } catch (err) {
        console.error('Error in fetchAdmin:', err);
      }

      // Fetch user's active booking (most recent approved/paid booking)
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          room_id,
          price,
          status,
          start_date,
          end_date,
          created_at,
          rooms:room_id(type)
        `)
        .eq('user_id', user.id)
        .in('status', ['approved', 'paid', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bookingData && !bookingError) {
        setCurrentBooking({
          id: bookingData.id,
          room_id: bookingData.room_id,
          room_type: (bookingData.rooms as any)?.type || 'Unknown',
          price: bookingData.price,
          status: bookingData.status,
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          created_at: bookingData.created_at,
        });

        // Fetch payments for this booking
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('booking_id', bookingData.id)
          .order('payment_date', { ascending: false });
        
        if (paymentsData) setPayments(paymentsData);
      }

      setLoadingData(false);
    };
    
    fetchUserData();
  }, []);

  // Fetch messages
  const fetchMessages = async (uid: string, aid: string) => {
    const { data, error } = await supabase.from('messages')
      .select()
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${aid}),and(sender_id.eq.${aid},receiver_id.eq.${uid})`)
      .order('created_at');
    if (!error) {
      setMessages(data || []);
      // Mark messages as read when user views them
      const unreadMessages = (data || []).filter((msg: any) => msg.receiver_id === uid && !msg.is_read);
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg: any) => msg.id);
        await supabase.from('messages').update({ is_read: true }).in('id', messageIds);
      }
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !adminId) return;
    fetchMessages(user.id, adminId);
    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages(user.id, adminId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, adminId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  // Send a new message
  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !adminId) return;
    
    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately
    
    // Optimistically add message to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: adminId,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setMessages(prev => [...prev, tempMessage]);
    
    // Send message to database
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: user.id, receiver_id: adminId, content: messageContent })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error sending', description: error.message, variant: 'destructive' });
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore message
      return;
    }
    
    // Replace temp message with real one
    if (data) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMessage.id);
        return [...filtered, data];
      });
      // Refetch to ensure sync
      setTimeout(() => fetchMessages(user.id, adminId), 500);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, manage your rental information</p>
        </div>

        {loadingData ? (
          <div className="text-center text-lg mb-8">Loading dashboard data...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Room</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentBooking ? currentBooking.room_type : "No Active Booking"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentBooking 
                    ? `Booking #${currentBooking.id}${currentBooking.start_date ? ` • ${new Date(currentBooking.start_date).toLocaleDateString()}` : ''}` 
                    : "Book a room to get started"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentBooking 
                    ? `KSh ${currentBooking.price.toLocaleString()}` 
                    : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentBooking ? "Due on 1st of each month" : "No active booking"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                <Badge 
                  className={
                    currentBooking?.status === 'paid' 
                      ? "bg-green-500" 
                      : currentBooking?.status === 'approved'
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }
                >
                  {currentBooking?.status || "N/A"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentBooking?.status === 'paid' ? "Current" : currentBooking?.status || "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentBooking 
                    ? `Status: ${currentBooking.status}` 
                    : "No active booking"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center text-sm text-muted-foreground">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No payment history available.
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(payment.payment_date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString()}
                          {payment.payment_method && ` • ${payment.payment_method}`}
                        </p>
                        {payment.transaction_id && (
                          <p className="text-xs text-muted-foreground">Txn: {payment.transaction_id}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KSh {payment.amount.toLocaleString()}</p>
                        <Badge 
                          variant={payment.status === 'paid' ? 'secondary' : 'default'} 
                          className="text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Support Chat --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Support Chat
              </CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={chatRef} className="h-72 overflow-y-auto bg-muted/30 rounded p-2 mb-2 flex flex-col gap-2">
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`max-w-sm px-3 py-2 rounded-lg text-sm whitespace-pre-line ${msg.sender_id === user?.id ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-muted text-foreground border'}`}>
                    {msg.content}
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                ))}
                {messages.length === 0 && <div className="mt-8 text-center text-muted-foreground">No messages yet.</div>}
              </div>
              <form className="flex gap-2" onSubmit={handleSend} autoComplete="off">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." />
                <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
