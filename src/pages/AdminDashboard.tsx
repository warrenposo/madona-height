import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Users, Home, DollarSign, MessageSquare, Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: number;
  type: string;
  price: number;
  description?: string;
  features: string[];
  images?: string[];
  status: string;
}

interface BookingWithRoomUser {
  id: number;
  room_type: string;
  room_id: number;
  user_id: string;
  full_name?: string;
  price: number;
  status: string;
}

const ADMIN_EMAIL = "warrenokumu98@gmail.com";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  // Fix the type for roomForm state
  type RoomForm = Omit<Room, 'id'|'image_url'> & { status?: string; images?: string[] };
  const [roomForm, setRoomForm] = useState<RoomForm>({ type: '', price: 0, description: '', features: [], images: [], status: 'Available' });
  const [saving, setSaving] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  // Bookings/Tenants state
  const [bookings, setBookings] = useState<BookingWithRoomUser[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Chat state
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch rooms
  const fetchRooms = async () => {
    setLoadingRooms(true);
    const { data, error } = await supabase.from("rooms").select();
    if(error) {
      toast({ title: "Error fetching rooms", description: error.message, variant: "destructive" });
      setLoadingRooms(false);
      return;
    }
    setRooms((data || []).map((r: any) => ({ ...r, features: r.features || [], images: r.images || [] })));
    setLoadingRooms(false);
  };

  // Fetch bookings with join
  const fetchBookings = async () => {
    setLoadingBookings(true);
    // Join bookings, rooms, and profiles
    const { data, error } = await supabase.rpc('admin_bookings_view');
    // See below: should define this rpc or do client-side join if not available
    if (error) {
      toast({ title: "Error fetching bookings", description: error.message, variant: "destructive" });
      setLoadingBookings(false);
      return;
    }
    setBookings(data || []);
    setLoadingBookings(false);
  };

  // Fetch admin profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAdmin(user);
    })();
  }, []);
  // Get users who have chatted (distinct sender_id where sender is not admin)
  useEffect(() => {
    if (!admin?.id) return;
    (async () => {
      const { data, error } = await supabase.from('messages').select('sender_id, profiles:sender_id(full_name, email)').neq('sender_id', admin.id).order('created_at', { ascending: false });
      const unique = [];
      const map = new Map();
      (data || []).forEach(d => {
        if (!map.has(d.sender_id)) {
          map.set(d.sender_id, true);
          unique.push({ id: d.sender_id, ...d.profiles });
        }
      });
      setUsers(unique);
      if (!selectedUser && unique.length > 0) setSelectedUser(unique[0]);
    })();
  }, [admin?.id]);
  // Fetch chat with selected user
  const fetchMessages = async (userId: string) => {
    if (!userId || !admin?.id) return;
    const { data, error } = await supabase.from('messages')
      .select()
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${admin.id}),and(sender_id.eq.${admin.id},receiver_id.eq.${userId})`)
      .order('created_at');
    if (!error) setMessages(data || []);
  };
  useEffect(() => { if (selectedUser?.id && admin?.id) fetchMessages(selectedUser.id); }, [selectedUser, admin]);
  // Subscribe for live updates
  useEffect(() => {
    if (!selectedUser?.id || !admin?.id) return;
    fetchMessages(selectedUser.id);
    const channel = supabase
      .channel('messages_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages(selectedUser.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser?.id, admin?.id]);
  // Scroll chat to bottom
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);
  // Send message
  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser?.id || !admin?.id) return;
    const { error } = await supabase.from('messages').insert({ sender_id: admin.id, receiver_id: selectedUser.id, content: newMessage });
    if (error) toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    setNewMessage("");
  };

  useEffect(() => { fetchRooms(); }, []);
  useEffect(() => { fetchBookings(); }, []);

  // Handle Add/Edit
  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({ type: '', price: 0, description: '', features: [], images: [], status: 'Available' });
    setShowRoomDialog(true);
  };
  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({ ...room, images: room.images || [] });
    setShowRoomDialog(true);
  };
  const handleRoomFormChange = (key: string, value: any) => {
    if (key === 'features' && typeof value === 'string') {
      value = value.split(',').map((v: string) => v.trim());
    }
    setRoomForm((prev) => ({ ...prev, [key]: value }));
  };

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Helper upload images to Supabase Storage
  const uploadImages = async (files: FileList) => {
    const urls = [] as string[];
    for (const file of Array.from(files).slice(0,8)) {
      const filePath = `rooms/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('room-images').upload(filePath, file, { upsert: false });
      if (error) continue;
      const { data: publicUrl } = supabase.storage.from('room-images').getPublicUrl(filePath);
      urls.push(publicUrl.publicUrl);
    }
    return urls;
  };

  const handleSaveRoom = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    let images: string[] = [];
    if (imageInputRef.current && imageInputRef.current.files && imageInputRef.current.files.length > 0) {
      setUploadingImages(true);
      images = await uploadImages(imageInputRef.current.files);
      setUploadingImages(false);
    } else if (roomForm.images) {
      images = roomForm.images;
    }
    const fullForm = { ...roomForm, images, features: roomForm.features, status: roomForm.status || 'Available' };
    if (editingRoom) {
      // update
      const { error } = await supabase.from('rooms').update(fullForm).eq('id', editingRoom.id);
      setSaving(false);
      setShowRoomDialog(false);
      if (error) { toast({ title: 'Error updating room', description: error.message, variant: 'destructive' }); } else { toast({ title: 'Room Updated' }); fetchRooms(); }
    } else {
      // create
      const { error } = await supabase.from('rooms').insert([fullForm]);
      setSaving(false);
      setShowRoomDialog(false);
      if (error) { toast({ title: 'Error adding room', description: error.message, variant: 'destructive' }); } else { toast({ title: 'Room Added' }); fetchRooms(); }
    }
  };
  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Delete this room?')) return;
    setDeletingRoomId(id);
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    setDeletingRoomId(null);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); } else { toast({ title: 'Room Deleted' }); fetchRooms(); }
  };

  // Update booking status
  const handleUpdateBookingStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking updated' });
      fetchBookings();
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm('Delete this booking?')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); } else { toast({ title: 'Booking deleted' }); fetchBookings(); }
  };

  // Admin dashboard sections
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your rental properties and tenants</p>
        </div>
        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="chat">Support Chat</TabsTrigger>
          </TabsList>
          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Management</CardTitle>
                <CardDescription>Add, edit, or remove room listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end"><Button onClick={openAddRoom}><Plus className="mr-2" />Add New Room</Button></div>
                {loadingRooms ? <div>Loading rooms...</div> : (
                <div className="grid gap-4">
                    {rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-2 items-center">
                            <span className="block font-medium text-lg truncate">{room.type}</span>
                            <Badge variant={room.status === "Occupied" ? "default" : "secondary"}>{room.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">KSh {room.price?.toLocaleString()}/month</p>
                          {room.features && <div className="flex flex-wrap gap-1 text-xs mt-1">{room.features.map((f, i) => <Badge variant="secondary" key={i}>{f}</Badge>)}</div>}
                      </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEditRoom(room)}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteRoom(room.id)} disabled={deletingRoomId===room.id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
            {/* Add/Edit Room Dialog */}
            <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveRoom} className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Input required value={roomForm.type} onChange={e => handleRoomFormChange('type', e.target.value)} />
                  </div>
                  <div>
                    <Label>Price (KES / month)</Label>
                    <Input required type="number" value={roomForm.price} onChange={e => handleRoomFormChange('price', parseInt(e.target.value)||0)} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={roomForm.description} onChange={e => handleRoomFormChange('description', e.target.value)} />
                  </div>
                  <div>
                    <Label>Features <span className="font-normal text-xs">(comma-separated)</span></Label>
                    <Input value={roomForm.features.join(', ')} onChange={e => handleRoomFormChange('features', e.target.value)} />
                  </div>
                  <div>
                    <Label>Room Images <span className="font-normal text-xs">(upload 1-8 images)</span></Label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={imageInputRef}
                      disabled={uploadingImages || saving}
                      className="block w-full border p-2 rounded"
                    />
                    {Array.isArray(roomForm.images) && roomForm.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {roomForm.images.map((url:string,i:number) => (
                          <img key={i} src={url} alt={`image ${i+1}`} className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    {uploadingImages && <div className="text-xs mt-1">Uploading images...</div>}
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Input value={roomForm.status} onChange={e => handleRoomFormChange('status', e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Management</CardTitle>
                <CardDescription>View and manage tenant bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (<div>Loading bookings...</div>) : bookings.length === 0 ? (<div>No bookings found.</div>) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                          <div className="font-semibold">{booking.full_name || booking.user_id}</div>
                          <div className="text-sm text-muted-foreground">Room: {booking.room_type}</div>
                      </div>
                      <div className="text-right">
                          <div>KSh {booking.price?.toLocaleString()}</div>
                          <Badge variant={booking.status === 'paid' ? 'secondary' : 'default'}>{booking.status}</Badge>
                        </div>
                        <div className="flex gap-1">
                          {booking.status !== 'paid' && (
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'paid')}>Mark as Paid</Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteBooking(booking.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="finances" className="space-y-6">
            <Card><CardHeader><CardTitle>Financial Dashboard</CardTitle></CardHeader><CardContent>Coming soon...</CardContent></Card>
          </TabsContent>
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Chat</CardTitle>
                <CardDescription>Respond to tenant inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {/* Sidebar: List of users */}
                  <div className="w-44 bg-muted/30 p-2 rounded max-h-96 overflow-y-auto">
                    <div className="font-bold mb-2">Tenants</div>
                    {users.length ? users.map(user => (
                      <div key={user.id}
                        className={`p-2 cursor-pointer rounded mb-1 ${selectedUser?.id === user.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                        onClick={() => setSelectedUser(user)}>
                        {user.full_name || user.email || user.id.slice(0, 8)}
                      </div>
                    )) : <div className="text-sm text-muted-foreground">No chats</div>}
                  </div>
                  {/* Chat window */}
                  <div className="flex-1 flex flex-col">
                    <div ref={chatRef} className="h-96 overflow-y-auto bg-muted/30 rounded p-2 mb-2 flex flex-col gap-2">
                      {messages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`max-w-sm px-3 py-2 rounded-lg text-sm whitespace-pre-line ${msg.sender_id === admin?.id ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-muted text-foreground border'}`}>
                          {msg.content}
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                        </div>
                      ))}
                      {messages.length === 0 && <div className="mt-8 text-center text-muted-foreground">No messages yet.</div>}
                    </div>
                    {selectedUser && <form className="flex gap-2" onSubmit={handleSend} autoComplete="off">
                      <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." />
                      <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                    </form>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
