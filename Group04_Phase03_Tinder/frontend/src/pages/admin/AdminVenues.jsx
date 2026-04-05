import { useState, useEffect } from "react";
import { api } from "../../api/client";
import "./AdminVenues.css";

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    capacity: "",
    hourly_rate: "",
    contact_email: "",
    contact_phone: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    setLoading(true);
    try {
      const data = await api.get("/api/v1/admin/venues");
      setVenues(data.venues || []);
    } catch (err) {
      setError(err.message || "Failed to load venues");
    } finally {
      setLoading(false);
    }
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const newVenue = await api.post("/api/v1/admin/venues", {
        ...form,
        capacity: Number(form.capacity),
        hourly_rate: Number(form.hourly_rate),
      });
      setVenues([...venues, newVenue.venue]);
      setShowForm(false);
      setForm({
        name: "", address: "", city: "", capacity: "",
        hourly_rate: "", contact_email: "", contact_phone: "",
      });
    } catch (err) {
      setCreateError(err.data?.error || err.message || "Failed to create venue");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page animate-fade-in">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Venue Management</h1>
          <p className="page-subtitle">
            Manage cat-friendly meeting venues 🏠
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Close" : "＋ Add Venue"}
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Create form */}
      {showForm && (
        <div className="card venue-form-card animate-slide-up">
          <h3 className="venue-form-title">Create New Venue</h3>

          {createError && <div className="alert alert-error">⚠️ {createError}</div>}

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label" htmlFor="venue-name">Venue Name</label>
              <input
                id="venue-name"
                className="form-input"
                placeholder="e.g. Whiskers Lounge"
                value={form.name}
                onChange={update("name")}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="venue-address">Address</label>
              <input
                id="venue-address"
                className="form-input"
                placeholder="Street address"
                value={form.address}
                onChange={update("address")}
                required
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label" htmlFor="venue-city">City</label>
                <input
                  id="venue-city"
                  className="form-input"
                  placeholder="New York"
                  value={form.city}
                  onChange={update("city")}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="venue-capacity">Capacity</label>
                <input
                  id="venue-capacity"
                  type="number"
                  className="form-input"
                  placeholder="10"
                  min="1"
                  value={form.capacity}
                  onChange={update("capacity")}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="venue-rate">$/hr</label>
                <input
                  id="venue-rate"
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="25.00"
                  min="0"
                  value={form.hourly_rate}
                  onChange={update("hourly_rate")}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="venue-email">Contact Email</label>
                <input
                  id="venue-email"
                  type="email"
                  className="form-input"
                  placeholder="info@venue.com"
                  value={form.contact_email}
                  onChange={update("contact_email")}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="venue-phone">Contact Phone</label>
                <input
                  id="venue-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+1-555-1234"
                  value={form.contact_phone}
                  onChange={update("contact_phone")}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Venue"}
            </button>
          </form>
        </div>
      )}

      {/* Venues table */}
      {loading ? (
        <div className="page-loader">Loading venues...</div>
      ) : venues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <p className="empty-state-text">No venues yet</p>
          <p className="empty-state-sub">Create the first venue for cat meetups!</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-container venues-table-desktop">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Capacity</th>
                  <th>Rate/hr</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.venue_id}>
                    <td><strong>{v.venue_id}</strong></td>
                    <td className="venue-name-cell">{v.name}</td>
                    <td>{v.city}</td>
                    <td>
                      <span className="capacity-badge">{v.capacity}</span>
                    </td>
                    <td className="venue-rate">${Number(v.hourly_rate).toFixed(2)}</td>
                    <td className="venue-contact">{v.contact_email || "—"}</td>
                    <td className="venue-contact">{v.contact_phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="venues-cards-mobile grid-2 stagger">
            {venues.map((v) => (
              <div className="card venue-mobile-card animate-slide-up" key={v.venue_id}>
                <div className="venue-mobile-header">
                  <h3>{v.name}</h3>
                  <span className="capacity-badge">{v.capacity} spots</span>
                </div>
                <p className="venue-mobile-city">📍 {v.city}</p>
                <p className="venue-mobile-rate">${Number(v.hourly_rate).toFixed(2)}/hr</p>
                {v.contact_email && <p className="venue-mobile-contact">✉️ {v.contact_email}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
