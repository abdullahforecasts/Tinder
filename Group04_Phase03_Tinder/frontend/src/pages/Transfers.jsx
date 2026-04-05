import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Transfers.css';

export default function Transfers() {
  const { user } = useAuth();
  const [myCats, setMyCats] = useState([]);
  const [openListings, setOpenListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    cat_id: '',
    transfer_type: 'adoption',
    target_role: 'any',
    note: '',
  });

  const isTransferRole = ['owner', 'breeder', 'shelter'].includes(
    user?.role || '',
  );

  const groupedDirectory = useMemo(() => {
    const byRole = { owner: [], breeder: [], shelter: [] };
    directory.forEach((item) => {
      if (byRole[item.role]) {
        byRole[item.role].push(item);
      }
    });
    return byRole;
  }, [directory]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [catsRes, openRes, mineRes, usersRes] = await Promise.all([
        api.get('/api/v1/cats/mine'),
        api.get('/api/v1/transfers/listings'),
        api.get('/api/v1/transfers/listings?mine=1&status=all'),
        api.get('/api/v1/transfers/users'),
      ]);

      const ownedCats = catsRes.cats || [];
      setMyCats(ownedCats);
      setOpenListings(openRes.listings || []);
      setMyListings(mineRes.listings || []);
      setDirectory(usersRes.users || []);

      if (!form.cat_id && ownedCats.length > 0) {
        setForm((prev) => ({ ...prev, cat_id: String(ownedCats[0].cat_id) }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateListing(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.cat_id) {
      setError('Select one of your cats before creating a listing.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/transfers/listings', {
        cat_id: Number(form.cat_id),
        transfer_type: form.transfer_type,
        target_role: form.target_role,
        note: form.note.trim() || null,
      });

      setSuccess('Listing created. Eligible users can now claim this cat.');
      setForm((prev) => ({ ...prev, note: '' }));
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClaim(listingId) {
    setError('');
    setSuccess('');
    try {
      const data = await api.post(
        `/api/v1/transfers/listings/${listingId}/claim`,
        {},
      );
      setSuccess(data.message || 'Claim completed. Ownership transferred.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to claim listing');
    }
  }

  async function handleCancel(listingId) {
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/v1/transfers/listings/${listingId}/cancel`, {});
      setSuccess('Listing cancelled.');
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to cancel listing');
    }
  }

  function canClaim(listing) {
    if (!isTransferRole) return false;
    if (listing.from_user_id === user.user_id) return false;
    if (listing.status !== 'open') return false;
    return listing.target_role === 'any' || listing.target_role === user.role;
  }

  return (
    <div className='page animate-fade-in'>
      <div className='transfer-header'>
        <div>
          <h1 className='page-title'>Transfer Hub</h1>
          <p className='page-subtitle'>
            List cats for adoption or breeding and transfer ownership when
            someone claims.
          </p>
        </div>
      </div>

      {error && <div className='alert alert-error'>⚠️ {error}</div>}
      {success && <div className='alert alert-success'>✅ {success}</div>}

      {!isTransferRole ? (
        <div className='card'>
          <h3>Transfers are disabled for this role</h3>
          <p className='page-subtitle'>
            Only owner, breeder, and shelter accounts can list or claim transfer
            offers.
          </p>
        </div>
      ) : loading ? (
        <div className='page-loader'>Loading transfer hub...</div>
      ) : (
        <div className='transfer-layout'>
          <section className='card transfer-form-card'>
            <h2 className='transfer-section-title'>Create Listing</h2>
            <p className='transfer-hint'>
              Put one of your cats up for adoption or breeding and choose who
              can claim it.
            </p>

            {myCats.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-state-icon'>🐾</div>
                <p className='empty-state-text'>
                  No cats linked to your account
                </p>
                <p className='empty-state-sub'>
                  Add a cat in My Cats before creating listings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateListing}>
                <div className='form-group'>
                  <label className='form-label' htmlFor='listing-cat'>
                    Cat
                  </label>
                  <select
                    id='listing-cat'
                    className='form-select'
                    value={form.cat_id}
                    onChange={(e) => updateForm('cat_id', e.target.value)}
                    required
                  >
                    {myCats.map((cat) => (
                      <option key={cat.cat_id} value={cat.cat_id}>
                        {cat.name} (ID: {cat.cat_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className='transfer-form-grid'>
                  <div className='form-group'>
                    <label className='form-label' htmlFor='listing-type'>
                      Transfer Type
                    </label>
                    <select
                      id='listing-type'
                      className='form-select'
                      value={form.transfer_type}
                      onChange={(e) =>
                        updateForm('transfer_type', e.target.value)
                      }
                    >
                      <option value='adoption'>Adoption</option>
                      <option value='breeding'>Breeding</option>
                    </select>
                  </div>

                  <div className='form-group'>
                    <label className='form-label' htmlFor='listing-target'>
                      Who Can Claim
                    </label>
                    <select
                      id='listing-target'
                      className='form-select'
                      value={form.target_role}
                      onChange={(e) =>
                        updateForm('target_role', e.target.value)
                      }
                    >
                      <option value='any'>
                        Anyone (owner/breeder/shelter)
                      </option>
                      <option value='owner'>Owners only</option>
                      <option value='breeder'>Breeders only</option>
                      <option value='shelter'>Shelters only</option>
                    </select>
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label' htmlFor='listing-note'>
                    Notes (optional)
                  </label>
                  <textarea
                    id='listing-note'
                    className='form-input transfer-note'
                    value={form.note}
                    onChange={(e) => updateForm('note', e.target.value)}
                    placeholder='Health, temperament, requirements, etc.'
                  />
                </div>

                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={submitting}
                >
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </form>
            )}
          </section>

          <section className='card transfer-open-card'>
            <h2 className='transfer-section-title'>Open Listings</h2>
            {openListings.length === 0 ? (
              <p className='page-subtitle'>No open listings yet.</p>
            ) : (
              <div className='transfer-list'>
                {openListings.map((listing) => (
                  <article key={listing.listing_id} className='transfer-item'>
                    <div className='transfer-item-main'>
                      <h3>
                        {listing.cat_name} • {listing.transfer_type}
                      </h3>
                      <p className='transfer-meta'>
                        From: {listing.from_user_name} ({listing.from_user_role}
                        )
                      </p>
                      <p className='transfer-meta'>
                        Target:{' '}
                        {listing.target_role === 'any'
                          ? 'Any eligible role'
                          : listing.target_role}
                      </p>
                      {listing.note && (
                        <p className='transfer-note-preview'>{listing.note}</p>
                      )}
                    </div>

                    <div className='transfer-actions'>
                      {listing.from_user_id === user.user_id ? (
                        <button
                          className='btn btn-secondary'
                          onClick={() => handleCancel(listing.listing_id)}
                        >
                          Cancel
                        </button>
                      ) : canClaim(listing) ? (
                        <button
                          className='btn btn-primary'
                          onClick={() => handleClaim(listing.listing_id)}
                        >
                          Claim & Transfer
                        </button>
                      ) : (
                        <button className='btn btn-secondary' disabled>
                          Not eligible
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className='card transfer-history-card'>
            <h2 className='transfer-section-title'>My Listing History</h2>
            {myListings.length === 0 ? (
              <p className='page-subtitle'>No listing activity yet.</p>
            ) : (
              <div className='transfer-list'>
                {myListings.map((listing) => (
                  <article
                    key={listing.listing_id}
                    className='transfer-item transfer-item-small'
                  >
                    <h4>
                      {listing.cat_name} • {listing.status}
                    </h4>
                    <p className='transfer-meta'>
                      Type: {listing.transfer_type} • Target:{' '}
                      {listing.target_role}
                    </p>
                    {listing.claimed_by_name && (
                      <p className='transfer-meta'>
                        Claimed by: {listing.claimed_by_name} (
                        {listing.claimed_by_role})
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className='card transfer-directory-card'>
            <h2 className='transfer-section-title'>
              Owner / Breeder / Shelter Directory
            </h2>
            <p className='transfer-hint'>
              Quick view so owners can find shelters/breeders and vice versa.
            </p>

            <div className='directory-columns'>
              <div>
                <h4>Owners</h4>
                {groupedDirectory.owner.slice(0, 8).map((entry) => (
                  <p key={entry.user_id} className='transfer-meta'>
                    {entry.full_name} ({entry.cats_count} cats)
                  </p>
                ))}
              </div>

              <div>
                <h4>Breeders</h4>
                {groupedDirectory.breeder.slice(0, 8).map((entry) => (
                  <p key={entry.user_id} className='transfer-meta'>
                    {entry.full_name} ({entry.cats_count} cats)
                  </p>
                ))}
              </div>

              <div>
                <h4>Shelters</h4>
                {groupedDirectory.shelter.slice(0, 8).map((entry) => (
                  <p key={entry.user_id} className='transfer-meta'>
                    {entry.full_name} ({entry.cats_count} cats)
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
