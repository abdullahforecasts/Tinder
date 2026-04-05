import { useEffect, useState } from 'react';
import { api } from '../api/client';
import './MyCats.css';

const initialForm = {
  name: '',
  breed: '',
  age: '',
  gender: 'M',
  neutered: false,
  vaccination_status: 'unknown',
  bio: '',
  photo_url: '',
  looking_for: 'playmate',
  preferred_gender: 'A',
  preferred_age_min: '',
  preferred_age_max: '',
  max_distance_km: '',
  location_lat: '',
  location_lng: '',
  is_active: true,
};

function parseOptionalInt(value) {
  if (value === '' || value == null) return null;
  return Number(value);
}

function parseOptionalFloat(value) {
  if (value === '' || value == null) return null;
  return Number(value);
}

export default function MyCats() {
  const [myCats, setMyCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialForm);

  async function loadMyCats() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/v1/cats/mine');
      setMyCats(data.cats || []);
    } catch (err) {
      setError(err.message || 'Failed to load your cats');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyCats();
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.breed || !form.age || !form.gender) {
      setError('Please fill all required fields: name, breed, age, gender.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      breed: form.breed.trim(),
      age: Number(form.age),
      gender: form.gender,
      neutered: form.neutered,
      vaccination_status: form.vaccination_status || 'unknown',
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      looking_for: form.looking_for || 'playmate',
      preferred_gender: form.preferred_gender || null,
      preferred_age_min: parseOptionalInt(form.preferred_age_min),
      preferred_age_max: parseOptionalInt(form.preferred_age_max),
      max_distance_km: parseOptionalInt(form.max_distance_km),
      location_lat: parseOptionalFloat(form.location_lat),
      location_lng: parseOptionalFloat(form.location_lng),
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      await api.post('/api/v1/cats/mine', payload);
      setSuccess('Cat added successfully.');
      setForm(initialForm);
      await loadMyCats();
    } catch (err) {
      setError(err.message || 'Failed to add cat');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='page animate-fade-in'>
      <div className='my-cats-header'>
        <div>
          <h1 className='page-title'>My Cats</h1>
          <p className='page-subtitle'>
            Manage your cats and add new profiles for swiping.
          </p>
        </div>
      </div>

      {error && <div className='alert alert-error'>⚠️ {error}</div>}
      {success && <div className='alert alert-success'>✅ {success}</div>}

      <div className='my-cats-layout'>
        <section className='card my-cats-form-card'>
          <h2 className='my-cats-section-title'>Add New Cat</h2>
          <p className='my-cats-hint'>
            Required: Name, Breed, Age, Gender. All other details are optional.
          </p>

          <form onSubmit={handleSubmit}>
            <div className='my-cats-grid'>
              <div className='form-group'>
                <label className='form-label' htmlFor='cat-name'>
                  Name (required)
                </label>
                <input
                  id='cat-name'
                  className='form-input'
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-breed'>
                  Breed (required)
                </label>
                <input
                  id='cat-breed'
                  className='form-input'
                  value={form.breed}
                  onChange={(e) => updateField('breed', e.target.value)}
                  required
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-age'>
                  Age (required)
                </label>
                <input
                  id='cat-age'
                  type='number'
                  min='1'
                  max='30'
                  className='form-input'
                  value={form.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  required
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-gender'>
                  Gender (required)
                </label>
                <select
                  id='cat-gender'
                  className='form-select'
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                >
                  <option value='M'>Male</option>
                  <option value='F'>Female</option>
                </select>
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-looking'>
                  Looking For (optional)
                </label>
                <select
                  id='cat-looking'
                  className='form-select'
                  value={form.looking_for}
                  onChange={(e) => updateField('looking_for', e.target.value)}
                >
                  <option value='playmate'>Playmate</option>
                  <option value='breeding'>Breeding</option>
                  <option value='adoption'>Adoption</option>
                </select>
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-vaccination'>
                  Vaccination Status (optional)
                </label>
                <input
                  id='cat-vaccination'
                  className='form-input'
                  value={form.vaccination_status}
                  onChange={(e) =>
                    updateField('vaccination_status', e.target.value)
                  }
                  placeholder='Up to date / unknown'
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-photo'>
                  Photo URL (optional)
                </label>
                <input
                  id='cat-photo'
                  className='form-input'
                  value={form.photo_url}
                  onChange={(e) => updateField('photo_url', e.target.value)}
                  placeholder='https://...'
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-pref-gender'>
                  Preferred Gender (optional)
                </label>
                <select
                  id='cat-pref-gender'
                  className='form-select'
                  value={form.preferred_gender}
                  onChange={(e) =>
                    updateField('preferred_gender', e.target.value)
                  }
                >
                  <option value='A'>Any</option>
                  <option value='M'>Male</option>
                  <option value='F'>Female</option>
                </select>
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-pref-min'>
                  Preferred Age Min (optional)
                </label>
                <input
                  id='cat-pref-min'
                  type='number'
                  min='0'
                  className='form-input'
                  value={form.preferred_age_min}
                  onChange={(e) =>
                    updateField('preferred_age_min', e.target.value)
                  }
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-pref-max'>
                  Preferred Age Max (optional)
                </label>
                <input
                  id='cat-pref-max'
                  type='number'
                  min='0'
                  className='form-input'
                  value={form.preferred_age_max}
                  onChange={(e) =>
                    updateField('preferred_age_max', e.target.value)
                  }
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-max-distance'>
                  Max Distance KM (optional)
                </label>
                <input
                  id='cat-max-distance'
                  type='number'
                  min='1'
                  className='form-input'
                  value={form.max_distance_km}
                  onChange={(e) =>
                    updateField('max_distance_km', e.target.value)
                  }
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-lat'>
                  Latitude (optional)
                </label>
                <input
                  id='cat-lat'
                  type='number'
                  step='0.000001'
                  className='form-input'
                  value={form.location_lat}
                  onChange={(e) => updateField('location_lat', e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='cat-lng'>
                  Longitude (optional)
                </label>
                <input
                  id='cat-lng'
                  type='number'
                  step='0.000001'
                  className='form-input'
                  value={form.location_lng}
                  onChange={(e) => updateField('location_lng', e.target.value)}
                />
              </div>
            </div>

            <div className='form-group'>
              <label className='form-label' htmlFor='cat-bio'>
                Bio (optional)
              </label>
              <textarea
                id='cat-bio'
                className='form-input my-cats-textarea'
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Describe your cat's personality"
              />
            </div>

            <div className='my-cats-checkbox-row'>
              <label className='my-cats-checkbox'>
                <input
                  type='checkbox'
                  checked={form.neutered}
                  onChange={(e) => updateField('neutered', e.target.checked)}
                />
                Neutered
              </label>
              <label className='my-cats-checkbox'>
                <input
                  type='checkbox'
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                />
                Active profile
              </label>
            </div>

            <button type='submit' className='btn btn-primary' disabled={saving}>
              {saving ? 'Adding...' : 'Add Cat'}
            </button>
          </form>
        </section>

        <section className='card my-cats-list-card'>
          <h2 className='my-cats-section-title'>Your Cats</h2>
          {loading ? (
            <div className='page-loader'>Loading your cats...</div>
          ) : myCats.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-state-icon'>🐱</div>
              <p className='empty-state-text'>No cats yet</p>
              <p className='empty-state-sub'>
                Use the form to add your first cat profile.
              </p>
            </div>
          ) : (
            <div className='my-cats-list'>
              {myCats.map((cat) => (
                <article className='my-cat-item' key={cat.cat_id}>
                  <img
                    className='my-cat-photo'
                    src={cat.photo_url}
                    alt={cat.name}
                  />
                  <div>
                    <h3 className='my-cat-name'>{cat.name}</h3>
                    <p className='my-cat-meta'>
                      ID: {cat.cat_id} • {cat.breed} • {cat.age} yrs •{' '}
                      {cat.gender}
                    </p>
                    <p className='my-cat-meta'>
                      Looking for: {cat.looking_for || 'Not set'} •{' '}
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
