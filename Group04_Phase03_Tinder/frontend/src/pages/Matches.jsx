import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './Matches.css';

export default function Matches() {
  const [myCats, setMyCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyCats();
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
      console.error('Failed to fetch cats:', err);
    }
  };

  const fetchMatches = async (catId) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/v1/cats/matches?cat_id=${catId}`);
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMeetingDetails = (match) => {
    setSelectedMeeting(match);
  };

  const closeMeetingDetails = () => {
    setSelectedMeeting(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancelMeeting = async () => {
    if (!selectedMeeting?.meeting_id) return;
    try {
      await api.post(`/api/v1/meetings/${selectedMeeting.meeting_id}/cancel`);
      closeMeetingDetails();
      // Refetch matches to update status
      if (selectedCat?.cat_id) {
        fetchMatches(selectedCat.cat_id);
      }
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
    }
  };

  return (
    <div className='page animate-fade-in'>
      <h1 className='page-title'>💕 Your Matches</h1>
      <p className='page-subtitle'>See who likes your cat back 💘</p>

      {/* Cat Selector */}
      <div style={{ marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
        <label className='form-label' style={{ fontWeight: 'bold', marginRight: '10px' }}>Your Cat:</label>
        <select
          value={selectedCat?.cat_id || ''}
          onChange={(e) => {
            const cat = myCats.find(c => c.cat_id === parseInt(e.target.value));
            setSelectedCat(cat);
          }}
          className='form-input'
        >
          <option value="">Select your cat</option>
          {myCats.map(cat => (
            <option key={cat.cat_id} value={cat.cat_id}>
              {cat.name} (ID: {cat.cat_id})
            </option>
          ))}
        </select>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className='page-loader'>Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className='empty-state'>
          <div className='empty-state-icon'>💔</div>
          <p className='empty-state-text'>No matches found yet</p>
          <p className='empty-state-sub'>Keep swiping to find matches! 🐱</p>
        </div>
      ) : (
        <div className='grid-2 stagger'>
          {matches.map(match => (
            <div
              key={match.match_id}
              className='card match-card animate-slide-up'
              style={{ cursor: match.meeting_id ? 'pointer' : 'default' }}
            >
              {/* Cat Photos */}
              <div className='match-card-header'>
                <div className='match-cats'>
                  <div className='match-cat-avatar'>
                    <img
                      src={match.cat1_photo || `https://cataas.com/cat?width=80&height=80&t=${match.cat1_id}`}
                      alt={match.cat1_name}
                    />
                  </div>
                  <div className='match-heart'>💕</div>
                  <div className='match-cat-avatar'>
                    <img
                      src={match.cat2_photo || `https://cataas.com/cat?width=80&height=80&t=${match.cat2_id}`}
                      alt={match.cat2_name}
                    />
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className='match-card-body'>
                <h3 className='match-names'>
                  {match.cat1_name} & {match.cat2_name}
                </h3>

                {/* Match Date */}
                <p className='match-date'>
                  Matched {new Date(match.matched_at).toLocaleDateString()}
                </p>

                {/* Status Badge */}
                <span className={`badge badge-${match.status}`}>
                  {match.status === 'active'
                    ? '💚 Active'
                    : match.status === 'meeting_scheduled'
                      ? '📅 Meeting Set'
                      : '❌ Cancelled'}
                </span>

                {/* Meeting Details Button */}
                {match.meeting_id && match.status === 'meeting_scheduled' && (
                  <button
                    onClick={() => openMeetingDetails(match)}
                    style={{
                      marginTop: '15px',
                      padding: '10px 15px',
                      backgroundColor: '#ff69b4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      width: '100%',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ff1493'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ff69b4'}
                  >
                    📋 View Meeting Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && selectedMeeting.meeting_id && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2c2c54',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            border: '3px solid #ff69b4',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ color: '#ff69b4', marginBottom: '20px', textAlign: 'center' }}>
              📅 Meeting Details
            </h2>

            {/* Match Info */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: '5px' }}>
                {selectedMeeting.cat1_name} & {selectedMeeting.cat2_name}
              </h3>
              <p style={{ color: '#999', fontSize: '14px' }}>Match ID: {selectedMeeting.match_id}</p>
            </div>

            {/* Meeting Details */}
            <div style={{
              backgroundColor: '#1a1a2e',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ff69b4',
              marginBottom: '20px'
            }}>
              {selectedMeeting.scheduled_time && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                    🕒 Date & Time
                  </label>
                  <p style={{ color: '#fff', fontSize: '16px', marginTop: '5px' }}>
                    {formatDate(selectedMeeting.scheduled_time)}
                  </p>
                </div>
              )}

              {selectedMeeting.duration_hours && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                    ⏱️ Duration
                  </label>
                  <p style={{ color: '#fff', fontSize: '16px', marginTop: '5px' }}>
                    {selectedMeeting.duration_hours} hour{selectedMeeting.duration_hours > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {selectedMeeting.venue_name && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                    📍 Venue
                  </label>
                  <p style={{ color: '#fff', fontSize: '16px', marginTop: '5px' }}>
                    {selectedMeeting.venue_name}
                  </p>
                </div>
              )}

              {selectedMeeting.total_cost && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                    💰 Total Cost
                  </label>
                  <p style={{ color: '#ffd700', fontSize: '16px', marginTop: '5px', fontWeight: 'bold' }}>
                    ${parseFloat(selectedMeeting.total_cost).toFixed(2)}
                  </p>
                </div>
              )}

              {selectedMeeting.meeting_id && (
                <div>
                  <label style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                    # Meeting ID
                  </label>
                  <p style={{ color: '#fff', fontSize: '16px', marginTop: '5px' }}>
                    {selectedMeeting.meeting_id}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedMeeting.status === 'meeting_scheduled' && (
                <button
                  onClick={handleCancelMeeting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                >
                  ✕ Cancel Meeting
                </button>
              )}
              <button
                onClick={closeMeetingDetails}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ff69b4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ff1493'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff69b4'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
