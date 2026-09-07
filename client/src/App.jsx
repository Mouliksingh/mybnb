// client/src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

function ImageCarousel({ images, primaryImage }) {
  const imageList = images && images.length > 0 ? images : [primaryImage];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!imageList || imageList.length === 0 || !imageList[0]?.url) {
    return <div className="h-64 bg-[#F7F7F7] rounded-2xl animate-pulse" />;
  }

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-sm h-64 w-full bg-[#F7F7F7]">
      <img 
        src={imageList[currentIndex].url} 
        alt="Listing View" 
        className="w-full h-full object-cover transition-transform duration-300"
      />
      {imageList.length > 1 && (
        <>
          <button onClick={prevSlide} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#222222] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition">❮</button>
          <button onClick={nextSlide} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#222222] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition">❯</button>
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {currentIndex + 1} / {imageList.length}
          </div>
        </>
      )}
    </div>
  );
}

function ConciergeWidget({ listingTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hello! I am your AI Concierge for "${listingTitle || 'MyBnB'}". Ask me anything about this property.` }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/concierge', { query });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error connecting to RAG knowledge base.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-[#FF385C] text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#e00b41] transition flex items-center gap-2 font-semibold">
          ✨ AI Concierge
        </button>
      ) : (
        <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-[#DDDDDD]">
          <div className="bg-[#FF385C] text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-sm">MyBnB AI Concierge</h3>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold">&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F7F7] text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${m.sender === 'user' ? 'bg-[#FF385C] text-white' : 'bg-white text-[#222222] border border-[#DDDDDD] shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[#717171] text-xs italic">Retrieving database vector context...</div>}
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-[#DDDDDD] bg-white flex gap-2">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about rules, amenities..." className="flex-1 border border-[#DDDDDD] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]" />
            <button type="submit" className="bg-[#FF385C] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#e00b41]">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-[#DDDDDD] px-8 py-4 sticky top-0 bg-white z-40 flex justify-between items-center shadow-sm">
      <h1 onClick={() => navigate('/')} className="text-xl font-extrabold text-[#FF385C] tracking-wide cursor-pointer">MyBnB</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button onClick={() => navigate('/hosting')} className="text-sm font-semibold hover:bg-gray-100 px-4 py-2 rounded-full">Airbnb your home</button>
            <button onClick={logout} className="text-sm font-semibold border border-[#DDDDDD] px-4 py-2 rounded-full hover:shadow-md">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-semibold px-4 py-2 hover:bg-gray-100 rounded-full">Log in</Link>
            <Link to="/signup" className="text-sm font-semibold bg-[#FF385C] text-white px-4 py-2 rounded-full hover:bg-[#e00b41]">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/listings')
      .then(res => setListings(res.data))
      .catch(err => console.error("Failed to fetch listings", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans antialiased pb-16">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">Explore Properties</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-[#F7F7F7] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <div key={listing._id} onClick={() => navigate(`/listings/${listing._id}`)} className="group cursor-pointer">
                <ImageCarousel images={listing.images} primaryImage={listing.image} />
                <div className="mt-3">
                  <h3 className="font-semibold text-base truncate">{listing.title}</h3>
                  <p className="text-[#717171] text-sm">{listing.location}, {listing.country}</p>
                  <p className="mt-1 font-semibold text-sm">&#8377; {listing.price?.toLocaleString("en-IN")} <span className="font-normal text-[#717171]">night</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <ConciergeWidget />
    </div>
  );
}

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!listing) return null;

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1;
  const totalPrice = (listing.price || 0) * nights;

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 mt-8">
        <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
        <div className="mb-8"><ImageCarousel images={listing.images} primaryImage={listing.image} /></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Hosted by {listing.owner?.username || "Superhost"}</h2>
            <p className="text-[#717171] leading-relaxed">{listing.description}</p>
            <p className="text-lg font-semibold">{listing.location}, {listing.country}</p>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 border border-[#DDDDDD] rounded-2xl p-6 shadow-xl bg-white">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <span className="text-2xl font-bold">&#8377; {listing.price?.toLocaleString("en-IN")}</span>
                  <span className="text-[#717171] text-sm"> / night</span>
                </div>
              </div>

              <div className="border border-[#DDDDDD] rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b border-[#DDDDDD]">
                  <div className="p-3 border-r border-[#DDDDDD]">
                    <label className="block text-[10px] font-bold uppercase text-[#222222]">Check-in</label>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full text-xs text-[#717171] focus:outline-none mt-1" />
                  </div>
                  <div className="p-3">
                    <label className="block text-[10px] font-bold uppercase text-[#222222]">Checkout</label>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full text-xs text-[#717171] focus:outline-none mt-1" />
                  </div>
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase text-[#222222]">Guests</label>
                  <select value={guests} onChange={e => setGuests(e.target.value)} className="w-full text-xs text-[#717171] bg-transparent focus:outline-none mt-1">
                    <option value={1}>1 guest</option>
                    <option value={2}>2 guests</option>
                    <option value={4}>4 guests</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-[#FF385C] text-white py-3.5 rounded-xl font-bold hover:bg-[#e00b41] transition shadow-md">Reserve</button>

              <div className="mt-6 space-y-3 text-sm border-t border-[#DDDDDD] pt-4">
                <div className="flex justify-between text-[#717171]">
                  <span>&#8377; {listing.price?.toLocaleString("en-IN")} x {nights} nights</span>
                  <span>&#8377; {totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-[#DDDDDD] pt-3">
                  <span>Total before taxes</span>
                  <span>&#8377; {totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ConciergeWidget listingTitle={listing.title} />
    </div>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#DDDDDD]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#FF385C]">Welcome to MyBnB</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase text-[#717171] mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full border border-[#DDDDDD] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]" />
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-[#717171] mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-[#DDDDDD] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]" />
        </div>
        <button type="submit" className="w-full bg-[#FF385C] text-white py-3 rounded-xl font-bold hover:bg-[#e00b41] transition">Log In</button>
      </form>
    </div>
  );
}

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { username, email, password });
      navigate('/login');
    } catch (err) {
      alert('Signup failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#DDDDDD]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#FF385C]">Join MyBnB</h2>
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase text-[#717171] mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full border border-[#DDDDDD] p-3 rounded-xl" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase text-[#717171] mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-[#DDDDDD] p-3 rounded-xl" />
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-[#717171] mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-[#DDDDDD] p-3 rounded-xl" />
        </div>
        <button type="submit" className="w-full bg-[#FF385C] text-white py-3 rounded-xl font-bold hover:bg-[#e00b41]">Sign Up</button>
      </form>
    </div>
  );
}

function HostDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/listings', { listing: { title, description, price, location, country } });
      navigate('/');
    } catch (err) {
      alert('Failed to create listing.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Create a New Listing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border p-3 rounded-xl" />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full border p-3 rounded-xl" />
          <input type="number" placeholder="Price per night (INR)" value={price} onChange={e => setPrice(e.target.value)} required className="w-full border p-3 rounded-xl" />
          <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required className="w-full border p-3 rounded-xl" />
          <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} required className="w-full border p-3 rounded-xl" />
          <button type="submit" className="w-full bg-[#FF385C] text-white py-3 rounded-xl font-bold">Publish Listing</button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/hosting" element={<HostDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}