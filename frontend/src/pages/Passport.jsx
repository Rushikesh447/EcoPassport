import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Factory, Globe2, Scale, Recycle, PackageCheck, MapPin, Loader2, SearchX,
  Truck, Wrench, Trash2, Sparkles, Camera, Plus, ShieldCheck, Clock,
} from 'lucide-react';
import Nav from '../components/Nav';
import ScoreRing from '../components/ScoreRing';
import TrustBadge from '../components/TrustBadge';
import { api, API_ORIGIN, errMsg, getUser } from '../api';
import { useToast } from '../components/Toast';

const EVENT_TYPES = ['MANUFACTURED', 'SHIPPED', 'SOLD', 'REPAIRED', 'RECYCLED', 'DISPOSED'];
const ICONS = {
  MANUFACTURED: <Factory size={14} />,
  SHIPPED: <Truck size={14} />,
  SOLD: <PackageCheck size={14} />,
  REPAIRED: <Wrench size={14} />,
  RECYCLED: <Recycle size={14} />,
  DISPOSED: <Trash2 size={14} />,
};

export default function Passport() {
  const { id } = useParams();
  const toast = useToast();
  const user = getUser();
  const canEdit = !!user && user.role !== 'CONSUMER';

  const [p, setP] = useState(undefined);       // undefined = loading, null = not found
  const [events, setEvents] = useState([]);
  const [ev, setEv] = useState({ eventType: 'MANUFACTURED', location: '', description: '' });
  const [busy, setBusy] = useState(false);

  const loadEvents = () =>
    api.get(`/products/${id}/lifecycle`).then((r) => setEvents(r.data)).catch(() => setEvents([]));

  useEffect(() => {
    setP(undefined);
    api.get(`/products/${id}`).then((r) => setP(r.data)).catch(() => setP(null));
    loadEvents();
  }, [id]);

  const addEvent = async (e) => {
    e.preventDefault();
    if (!ev.location.trim()) { toast('Please enter a location.', 'error'); return; }
    try {
      await api.post(`/products/${id}/lifecycle`, ev);
      setEv({ ...ev, location: '', description: '' });
      toast('Lifecycle event added.', 'success');
      loadEvents();
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  const rerun = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/products/${id}/ai-analysis`);
      setP(r.data);
      toast('AI analysis refreshed.', 'success');
    } catch (err) { toast(errMsg(err), 'error'); }
    finally { setBusy(false); }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await api.post(`/products/${id}/image`, fd);
      setP(r.data);
      toast('Photo uploaded.', 'success');
    } catch (err) { toast(errMsg(err), 'error'); }
  };

  if (p === undefined) {
    return <><Nav /><main className="center"><Loader2 className="spin" size={28} /><p>Loading passport…</p></main></>;
  }
  if (p === null) {
    return (
      <><Nav /><main className="center">
        <SearchX size={40} />
        <h1>Product not found</h1>
        <p>This passport doesn't exist or the backend isn't reachable.</p>
        <Link className="btn" to="/">Back to Dashboard</Link>
      </main></>
    );
  }

  const publicUrl = `${window.location.origin}/consumer/passport/${p.passportId}`;

  return (
    <>
      <Nav />
      <main>
        <div className="passport">
          <div className="passport-photo">
            {p.imageUrl ? <img src={API_ORIGIN + p.imageUrl} alt={p.name} /> : <div className="photo-placeholder"><Camera size={28} /></div>}
            {canEdit && (
              <label className="btn photo-upload-btn">
                <Camera size={14} /> Upload photo
                <input type="file" accept="image/*" hidden onChange={upload} />
              </label>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <small className="eyebrow">DIGITAL PRODUCT PASSPORT</small>
            <h1>{p.name}</h1>
            <p>{p.passportId} · {p.category}</p>
            <TrustBadge score={p.sustainabilityScore} />
            {p.approved && <div className="trust-badge trust-good" style={{ marginLeft: 8 }}><ShieldCheck size={16} /><span>Admin approved</span></div>}
          </div>

          <div className="qr-box">
            <QRCodeSVG value={publicUrl} size={120} />
            <small>Scan for public view</small>
          </div>
        </div>

        <div className="grid stat-grid passport-stats">
          <div className="stat-card center-ring"><ScoreRing value={p.sustainabilityScore} label="Sustainability" /></div>
          <div className="stat-card"><Recycle size={20} /><small>Eco Rating</small><h2>{p.ecoRating || '—'}</h2></div>
          <div className="stat-card"><Globe2 size={20} /><small>Carbon Footprint</small><h2>{p.carbonFootprint ?? '—'} kg</h2></div>
          <div className="stat-card"><Scale size={20} /><small>Weight</small><h2>{p.weightKg} kg</h2></div>
        </div>

        <section className="panel">
          <h2>Product Information</h2>
          <div className="info-grid">
            <div><Factory size={15} /><span>Manufacturer</span><b>{p.manufacturer}</b></div>
            <div><MapPin size={15} /><span>Origin</span><b>{p.originCountry}</b></div>
            <div><Scale size={15} /><span>Material</span><b>{p.material}</b></div>
            <div><Recycle size={15} /><span>Recycled content</span><b>{p.recycledContent}%</b></div>
            <div><Clock size={15} /><span>Energy used</span><b>{p.energyKwh} kWh</b></div>
            <div><Truck size={15} /><span>Transport</span><b>{p.transportKm} km</b></div>
            <div><PackageCheck size={15} /><span>Recyclable</span><b>{p.recyclable ? 'Yes' : 'No'}</b></div>
            <div><ShieldCheck size={15} /><span>Certifications</span><b>{p.certifications || '—'}</b></div>
          </div>
        </section>

        <section className="panel ai">
          <div className="panel-head">
            <h2>🤖 AI Sustainability Recommendation</h2>
            {canEdit && (
              <button className="btn" onClick={rerun} disabled={busy}>
                {busy ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />} Re-run analysis
              </button>
            )}
          </div>
          <p>{p.aiRecommendation || 'No recommendation available yet.'}</p>
        </section>

        {(p.repairInstructions || p.recyclingInstructions) && (
          <section className="panel">
            <h2>End-of-life guidance</h2>
            {p.repairInstructions && <p><b>🔧 Repair:</b> {p.repairInstructions}</p>}
            {p.recyclingInstructions && <p><b>♻️ Recycling:</b> {p.recyclingInstructions}</p>}
          </section>
        )}

        <section className="panel">
          <h2>Lifecycle Timeline</h2>
          {canEdit && (
            <form className="lifecycle-form" onSubmit={addEvent}>
              <select value={ev.eventType} onChange={(e) => setEv({ ...ev, eventType: e.target.value })}>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input placeholder="Location" value={ev.location} onChange={(e) => setEv({ ...ev, location: e.target.value })} />
              <input placeholder="Description (optional)" value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} />
              <button className="btn"><Plus size={16} /> Add event</button>
            </form>
          )}
          {events.length === 0 && <p className="muted">No lifecycle events recorded yet.</p>}
          <div className="timeline">
            {events.map((e) => (
              <div className="timeline-item" key={e.id}>
                <div className="timeline-icon">{ICONS[e.eventType] || <PackageCheck size={14} />}</div>
                <div>
                  <b>{e.eventType}</b>
                  <span className="timeline-meta">{e.location}{e.eventDate ? ` · ${e.eventDate}` : ''}</span>
                  {e.description && <p>{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
