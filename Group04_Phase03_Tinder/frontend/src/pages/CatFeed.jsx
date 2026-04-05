import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './CatFeed.css';

export default function CatFeed() {
  const { user } = useAuth();
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(null); // 'left' | 'right' | null
  const [matchAlert, setMatchAlert] = useState(null);
  const [endAlert, setEndAlert] = useState(false);
  const [error, setError] = useState('');
  const [myCats, setMyCats] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);

  // Fetch user's cats to pick which one is swiping
  useEffect(() => {
    async function fetchMyCats() {
      try {
        const data = await api.get('/api/v1/cats/mine');
        const ownedCats = data.cats || [];
        setMyCats(ownedCats);

        if (ownedCats.length > 0) {
          setSelectedCatId(ownedCats[0].cat_id);
        } else {
          setSelectedCatId(null);
          setError('No cats are linked to this account yet.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load your cats');
      }
    }
    fetchMyCats();
  }, [user]);

  const fetchFeed = useCallback(async () => {
    if (!selectedCatId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setEndAlert(false); // Reset end alert when fetching new feed
    try {
      const data = await api.get(
        `/api/v1/cats/feed?swiper_cat_id=${selectedCatId}`,
      );
      setCats(data.cats || []);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [selectedCatId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  async function handleSwipe(direction) {
    if (currentIndex >= cats.length || swiping) return;
    const target = cats[currentIndex];
    setSwiping(direction);

    try {
      await api.post('/api/v1/cats/swipe', {
        swiper_cat_id: selectedCatId,
        swiped_cat_id: target.cat_id,
        direction,
      });

      // Check if it's a match (mutual right swipe)
      if (direction === 'right') {
        // The backend trigger handles match creation
        // We'll check matches to show a popup
        try {
          const matchData = await api.get(
            `/api/v1/cats/matches?cat_id=${selectedCatId}`,
          );
          const matches = matchData.matches || [];
          const isNewMatch = matches.some(
            (m) => m.cat1_id === target.cat_id || m.cat2_id === target.cat_id,
          );
          if (isNewMatch) {
            setMatchAlert(target);
            setTimeout(() => setMatchAlert(null), 3000);
          }
        } catch {
          // ignore match check errors
        }
      }
    } catch (err) {
      if (err.status !== 409) {
        setError(err.message);
      }
    }

    setTimeout(() => {
      setSwiping(null);
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        // Check if we've reached the end of the feed
        if (nextIndex >= cats.length && cats.length > 0) {
          setEndAlert(true);
        }
        return nextIndex;
      });
    }, 400);
  }

  function handleCatIdChange(e) {
    setSelectedCatId(Number(e.target.value));
  }

  const currentCat = cats[currentIndex];

  return (
    <div className='page page-centered' style={{ paddingTop: '80px' }}>
      <div className='feed-container animate-fade-in'>
        <div className='feed-header'>
          <h1 className='page-title'>Discover Cats</h1>
          <div className='swiper-selector'>
            <label className='form-label' htmlFor='swiper-select'>
              Swiping as Cat ID:
            </label>
            <select
              id='swiper-select'
              className='form-input swiper-input'
              value={selectedCatId || ''}
              onChange={handleCatIdChange}
              disabled={myCats.length === 0}
            >
              {myCats.length === 0 ? (
                <option value=''>No cats available</option>
              ) : (
                myCats.map((cat) => (
                  <option key={cat.cat_id} value={cat.cat_id}>
                    {cat.name} (ID: {cat.cat_id})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {error && <div className='alert alert-error'>⚠️ {error}</div>}

        {loading ? (
          <div className='feed-loader'>
            <div className='loader-paw'>🐾</div>
            <p>Finding cats near you...</p>
          </div>
        ) : !currentCat ? (
          <div className='feed-empty'>
            <div className='empty-state-icon'>😿</div>
            <h3 className='empty-state-text'>No more cats to show</h3>
            <p className='empty-state-sub'>
              You've seen everyone! Come back later or change your swiper cat.
            </p>
            <button
              className='btn btn-primary'
              onClick={fetchFeed}
              style={{ marginTop: '1rem' }}
            >
              Refresh Feed
            </button>
          </div>
        ) : (
          <>
            <div
              className={`cat-card-stack ${swiping ? `swiping-${swiping}` : ''}`}
            >
              {/* Next card (behind) */}
              {currentIndex + 1 < cats.length && (
                <div className='cat-card cat-card-behind'>
                  <div className='cat-card-photo'>
                    <img
                      src={cats[currentIndex + 1].photo_url}
                      alt={cats[currentIndex + 1].name}
                    />
                  </div>
                </div>
              )}

              {/* Current card */}
              <div className='cat-card cat-card-front' key={currentCat.cat_id}>
                <div className='cat-card-photo'>
                  <img
                    src={currentCat.photo_url}
                    alt={currentCat.name}
                  />
                  <div className='cat-card-gradient'></div>

                  {swiping === 'right' && (
                    <div className='swipe-label swipe-like'>LIKE 💕</div>
                  )}
                  {swiping === 'left' && (
                    <div className='swipe-label swipe-nope'>NOPE 👋</div>
                  )}
                </div>

                <div className='cat-card-info'>
                  <div className='cat-name-row'>
                    <h2 className='cat-name'>{currentCat.name}</h2>
                    <span className='cat-age'>{currentCat.age} yrs</span>
                  </div>
                  <p className='cat-breed'>{currentCat.breed}</p>
                  <p className='cat-bio'>{currentCat.bio}</p>
                  <span
                    className={`badge badge-${currentCat.looking_for === 'playmate' ? 'active' : currentCat.looking_for === 'breeding' ? 'pending' : 'confirmed'}`}
                  >
                    {currentCat.looking_for === 'playmate'
                      ? '🎾 Playmate'
                      : currentCat.looking_for === 'breeding'
                        ? '💝 Breeding'
                        : '🏠 Adoption'}
                  </span>
                </div>
              </div>
            </div>

            <div className='swipe-buttons'>
              <button
                className='swipe-btn swipe-btn-nope'
                onClick={() => handleSwipe('left')}
                disabled={!!swiping}
                aria-label='Pass'
              >
                ✕
              </button>
              <button
                className='swipe-btn swipe-btn-like'
                onClick={() => handleSwipe('right')}
                disabled={!!swiping}
                aria-label='Like'
              >
                ♥
              </button>
            </div>

            <div className='feed-counter'>
              {currentIndex + 1} / {cats.length}
            </div>
          </>
        )}

        {/* Match celebration overlay */}
        {matchAlert && (
          <div className='match-overlay animate-scale-in'>
            <div className='match-content'>
              <div className='match-sparkles'>✨💕✨</div>
              <h2 className='match-title'>It's a Match!</h2>
              <p className='match-text'>
                You matched with <strong>{matchAlert.name}</strong>!
              </p>
              <button
                className='btn btn-primary'
                onClick={() => setMatchAlert(null)}
              >
                Keep Swiping
              </button>
            </div>
          </div>
        )}

        {/* End of feed overlay */}
        {endAlert && (
          <div className='match-overlay animate-scale-in'>
            <div className='match-content'>
              <div className='match-sparkles'>🎉😸🎉</div>
              <h2 className='match-title'>All Cats Swiped!</h2>
              <p className='match-text'>
                You've seen everyone! Let's start over and find your purr-fect match.
              </p>
              <button
                className='btn btn-primary'
                onClick={() => {
                  setEndAlert(false);
                  fetchFeed();
                }}
              >
                Refresh Feed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
