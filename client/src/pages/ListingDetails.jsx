import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ImageCarousel from '../components/ImageCarousel';
import ConciergeWidget from '../components/ConciergeWidget';
import { Star, MapPin, User, Share, Heart } from 'lucide-react';

export default function ListingDetails() {
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
      .catch(err => {
        console.error("Failed to fetch listing details", err);
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#717171]">Loading property details...</div>;
  }

  if (!listing) return null;

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1;
  const totalPrice = (listing.price || 0) * nights;

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-20">
      {/* Header Navigation */}
      <header className="border-b border-[#DDDDDD] px-8 py-4 sticky top-0 bg-white z-40 flex justify-between items-center shadow-sm">
        <h1 onClick={() => navigate('/')} className="text-xl font-extrabold text-[#FF385C] tracking-wide cursor-pointer">MyBnB</h1>
        <button onClick={() => navigate('/')} className="text-sm font-semibold border border-[#DDDDDD] px-4 py-2 rounded-full hover:bg-gray-50">
          Back to Listings
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* Title & Action Bar */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-[#717171]">
              <span className="flex items-center gap-1 font-semibold text-[#222222]">
                <Star className="w-4 h-4 fill-current text-[#FF385C]" /> 4.98
              </span>
              <span>·</span>
              <span className="underline font-semibold text-[#222222]">{listing.reviews?.length || 0} reviews</span>
              <span>·</span>
              <span className="flex items-center gap-1 underline">
                <MapPin className="w-4 h-4" /> {listing.location}, {listing.country}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-sm font-semibold underline px-3 py-2 rounded-lg hover:bg-gray-100">
              <Share className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold underline px-3 py-2 rounded-lg hover:bg-gray-100">
              <Heart className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Photo Gallery Grid / Carousel */}
        <div className="mb-8">
          <ImageCarousel images={listing.images} primaryImage={listing.image} />
        </div>

        {/* Main Content Layout (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-[#DDDDDD] pb-6">
              <div>
                <h2 className="text-xl font-semibold">Entire villa hosted by {listing.owner?.username || "Superhost"}</h2>
                <p className="text-sm text-[#717171] mt-1">16 guests · 5 bedrooms · 6 beds · 6 baths</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-700 shadow-inner">
                {listing.owner?.username ? listing.owner.username[0].toUpperCase() : <User />}
              </div>
            </div>

            <div className="border-b border-[#DDDDDD] pb-6 space-y-4">
              <div className="flex gap-4">
                <span className="text-2xl">🏡</span>
                <div>
                  <h4 className="font-semibold">Self check-in</h4>
                  <p className="text-sm text-[#717171]">You can check in with the doorman.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-semibold">Experienced host</h4>
                  <p className="text-sm text-[#717171]">Superhosts are experienced, highly rated hosts.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">About this space</h3>
              <p className="text-[#222222] leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border border-[#DDDDDD] rounded-2xl p-6 shadow-xl bg-white">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <span className="text-2xl font-bold">&#8377; {listing.price?.toLocaleString("en-IN")}</span>
                  <span className="text-[#717171] text-sm"> / night</span>
                </div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-[#FF385C]" /> 4.98
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

              <button className="w-full bg-[#FF385C] text-white py-3.5 rounded-xl font-bold hover:bg-[#e00b41] transition shadow-md">
                Reserve
              </button>
              <p className="text-center text-xs text-[#717171] mt-3">You won't be charged yet</p>

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

      {/* Scoped RAG Concierge Widget */}
      <ConciergeWidget listingTitle={listing.title} />
    </div>
  );
}