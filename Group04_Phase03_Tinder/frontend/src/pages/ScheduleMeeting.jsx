import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './ScheduleMeeting.css';

export default function ScheduleMeeting() {
  const [myCats, setMyCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [matches, setMatches] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [meetingTime, setMeetingTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [slots, setSlots] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelId, setCancelId] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelResult, setCancelResult] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyCats();
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedCat?.cat_id) {
      fetchMatches(selectedCat.cat_id);
    }
  }, [selectedCat]);

  const fetchMyCats = async () => {
    try {
      const data = await api.get('/api/v1/cats/mine');
      setMyCats(data.cats || []);
      if (data.cats && data.cats.length > 0) {
        setSelectedCat(data.cats[0]);
      }
    } catch (err) {
      setError(`Failed to fetch your cats: ${err.message}`);
    }
  };

  const fetchMatches = async (catId) => {
    try {
      const data = await api.get(`/api/v1/cats/matches?cat_id=${catId}`);
      setMatches(data.matches || []);
      setSelectedMatch(null);
    } catch (err) {
      setError(`Failed to fetch matches: ${err.message}`);
    }
  };

  const fetchVenues = async () => {
    try {
      const data = await api.get('/api/v1/venues');
      console.log('Venues response:', data); // Debug: see what backend returns
      
      // Handle different response formats
      let venuesList = [];
      if (Array.isArray(data)) {
        venuesList = data;
      } else if (data.venues && Array.isArray(data.venues)) {
        venuesList = data.venues;
      } else if (data.data && Array.isArray(data.data)) {
        venuesList = data.data;
      }
      
      console.log('Parsed venues:', venuesList); // Debug: see what we're setting
      setVenues(venuesList);
    } catch (err) {
      setError(`Failed to fetch venues: ${err.message}`);
      console.error('Venues fetch error:', err); // Debug: see the error
    }
  };

  const handleScheduleMeeting = async () => {
    setError('');
    setSuccess('');

    if (!selectedCat) {
      setError('Please select your cat');
      return;
    }
    if (!selectedMatch) {
      setError('Please select a match');
      return;
    }
    if (!selectedVenue) {
      setError('Please select a venue');
      return;
    }
    if (!meetingTime) {
      setError('Please select a meeting time');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/api/v1/meetings', {
        match_id: selectedMatch.match_id,
        venue_id: selectedVenue.venue_id,
        scheduled_time: new Date(meetingTime).toISOString(),
        duration_hours: parseInt(duration),
        slots_reserved: parseInt(slots)
      });

      setSuccess(`✅ Meeting scheduled successfully! Booking ID: ${data.booking?.booking_id || data.meeting?.meeting_id}`);
      
      // Reset form
      setSelectedMatch(null);
      setSelectedVenue(null);
      setMeetingTime('');
      setDuration(2);
      setSlots(2);
      
      // Refresh matches
      if (selectedCat) fetchMatches(selectedCat.cat_id);
      
    } catch (err) {
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  }
  const handleCancel = async () => {
    setCancelError('');
    setCancelResult(null);
    setCancelling(true);

    try {
      const data = await api.post(`/api/v1/meetings/${cancelId}/cancel`);
      setCancelResult(data);
      setCancelId('');
    } catch (err) {
      setCancelError(err.data?.error || err.message || 'Failed to cancel meeting');
    } finally {
      setCancelling(false);
    }
  };
  return (
    <div className='page animate-fade-in'>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 className='page-title'>Schedule a Meeting</h1>
        <p className='page-subtitle'>Arrange a meetup at a cat-friendly venue for your matched cats 📅</p>

        <div className='card' style={{ padding: '30px' }}>
          {error && <div className='alert alert-error'>⚠️ {error}</div>}
          {success && <div className='alert alert-success'>{success}</div>}

          {/* Step 1: Select Your Cat */}
          <div style={{ marginBottom: '25px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Your Cat:
            </label>
            <select
              value={selectedCat?.cat_id || ''}
              onChange={(e) => {
                const cat = myCats.find(c => c.cat_id === parseInt(e.target.value));
                setSelectedCat(cat);
              }}
              className='form-input'
            >
              <option value="">-- Select Your Cat --</option>
              {myCats.map(cat => (
                <option key={cat.cat_id} value={cat.cat_id}>
                  {cat.name} (ID: {cat.cat_id})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Match */}
          <div style={{ marginBottom: '25px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Select a Match:
            </label>
            <select
              value={selectedMatch?.match_id || ''}
              onChange={(e) => {
                const match = matches.find(m => m.match_id === parseInt(e.target.value));
                setSelectedMatch(match);
              }}
              className='form-input'
              disabled={!selectedCat}
            >
              <option value="">-- Choose Match --</option>
              {matches.map(match => (
                <option key={match.match_id} value={match.match_id}>
                  {match.cat1_name} & {match.cat2_name} • Match ID: {match.match_id}
                </option>
              ))}
            </select>
            {matches.length === 0 && selectedCat && (
              <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>No matches found for this cat</p>
            )}
          </div>

          {/* Step 3: Select Venue */}
          <div style={{ marginBottom: '25px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Select a Venue:
            </label>
            <select
              value={selectedVenue?.venue_id || ''}
              onChange={(e) => {
                const venue = venues.find(v => v.venue_id === parseInt(e.target.value));
                setSelectedVenue(venue);
              }}
              className='form-input'
            >
              <option value="">-- Choose Venue --</option>
              {venues.map(venue => (
                <option key={venue.venue_id} value={venue.venue_id}>
                  {venue.name} (${venue.hourly_rate}/hr) • Venue ID: {venue.venue_id}
                </option>
              ))}
            </select>
            {venues.length === 0 && (
              <p style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>❌ No venues available</p>
            )}
          </div>

          {/* Step 4: Select Date & Time */}
          <div style={{ marginBottom: '25px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Date & Time:
            </label>
            <input
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className='form-input'
            />
          </div>

          {/* Step 5: Duration */}
          <div style={{ marginBottom: '25px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Duration (hours): <strong>{duration}</strong>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Step 6: Slots */}
          <div style={{ marginBottom: '25px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Spots to Reserve: <strong>{slots}</strong>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={slots}
              onChange={(e) => setSlots(parseInt(e.target.value))}
              className='form-input'
            />
          </div>

          {/* Cost Preview */}
          {selectedVenue && (
            <div style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '15px', 
              borderRadius: '6px', 
              marginBottom: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              💰 <strong>Total Cost:</strong> ${(selectedVenue.hourly_rate * duration).toFixed(2)}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleScheduleMeeting}
            disabled={loading || !selectedCat || !selectedMatch || !selectedVenue || !meetingTime}
            className='btn btn-primary btn-lg'
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Scheduling...' : '📅 Schedule Meeting'}
          </button>
        </div>

        {/* Cancel Meeting Section */}
        <div className='card' style={{ padding: '30px', marginTop: '30px' }}>
          <h2 className='meeting-card-title' style={{ marginBottom: '20px' }}>
            <span>❌</span> Cancel Meeting
          </h2>

          {cancelError && <div className='alert alert-error'>⚠️ {cancelError}</div>}
          {cancelResult && (
            <div className='alert alert-success'>
              ✅ {cancelResult.message}. Transaction: {cancelResult.transaction}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label className='form-label' style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Meeting ID
            </label>
            <input
              type="number"
              className='form-input'
              placeholder='Enter Meeting ID to cancel'
              value={cancelId}
              onChange={(e) => setCancelId(e.target.value)}
              min="1"
            />
          </div>

          <button
            onClick={handleCancel}
            className='btn btn-danger btn-lg'
            disabled={cancelling || !cancelId}
            style={{ width: '100%' }}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Meeting'}
          </button>

          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '6px', 
            marginTop: '25px',
            borderLeft: '4px solid #ff9800',
            color: '#333'
          }}>
            <h4 style={{ marginTop: 0, color: '#333' }}>💡 How it works</h4>
            <ul style={{ marginBottom: 0, color: '#333' }}>
              <li>Scheduling creates both a <strong>meeting</strong> and <strong>venue booking</strong> atomically</li>
              <li>Cost is auto-calculated from venue hourly rate × duration</li>
              <li>Cancellation rolls back both records in a single transaction</li>
              <li>Venue capacity is enforced by a database trigger</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
