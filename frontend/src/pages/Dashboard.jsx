import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Search, PackagePlus, BadgeCheck, Boxes, Recycle, ArrowRight } from 'lucide-react';
import Nav from '../components/Nav';
import { CardSkeleton, RowSkeleton } from '../components/Skeleton';
import { api, API_ORIGIN } from '../api';
import BarChart from '../components/BarChart';
import ActivityFeed from '../components/ActivityFeed';
import FeatureSlider from '../components/FeatureSlider';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';

const PAGE_SIZE = 6;

export default function Dashboard() {
  const [p, setP] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { api.get('/products').then((r) => setP(r.data)).catch(() => setP([])); }, []);

  const categories = useMemo(() => {
    if (!p) return [];
    return [...new Set(p.map((x) => x.category).filter(Boolean))];
  }, [p]);

  const filtered = useMemo(() => {
    if (!p) return [];
    let list = p.filter((x) =>
      ((x.name || '').toLowerCase().includes(q.toLowerCase()) ||
      (x.category || '').toLowerCase().includes(q.toLowerCase()) ||
      (x.passportId || '').toLowerCase().includes(q.toLowerCase())) &&
      (category === 'all' || x.category === category)
    );
    if (sort === 'score') list = [...list].sort((a, b) => (b.sustainabilityScore || 0) - (a.sustainabilityScore || 0));
    if (sort === 'name') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [p, q, sort, category]);

  useEffect(() => { setPage(1); }, [q, sort, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgScore = p && p.length ? Math.round(p.reduce((s, x) => s + (x.sustainabilityScore || 0), 0) / p.length) : 0;

  return (
    <>
      <Nav />
      <main>
        <section className="hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div>
            <small className="eyebrow">SMART DIGITAL PRODUCT PASSPORT</small>
            <h1>Make every product <b>traceable.</b></h1>
            <p>Track lifecycle, materials, carbon impact and sustainability — all in one living passport.</p>
            <Link className="btn" to="/add"><PackagePlus size={18} /> Register Product</Link>
          </div>
          <div className="hero-icon"><Leaf size={90} /></div>
        </section>

        <FeatureSlider />
        <Testimonials />

        {p === null ? (
          <CardSkeleton />
        ) : (
          <div className="grid stat-grid">
            <div className="stat-card"><Boxes size={20} /><small>Total Products</small><h2>{p.length}</h2></div>
            <div className="stat-card"><BadgeCheck size={20} /><small>Avg. Sustainability</small><h2>{avgScore}%</h2></div>
            <div className="stat-card"><Recycle size={20} /><small>Recyclable</small><h2>{p.filter((x) => x.recyclable).length}</h2></div>
            <div className="stat-card"><Leaf size={20} /><small>AI Analysis</small><h2>✓ Enabled</h2></div>
          </div>
        )}

        {p !== null && p.length > 0 && (
          <section className="panel">
            <h2>Avg. Sustainability by Category</h2>
            <BarChart
              data={Object.entries(
                p.reduce((acc, x) => {
                  const cat = x.category || 'Uncategorized';
                  if (!acc[cat]) acc[cat] = { sum: 0, count: 0 };
                  acc[cat].sum += x.sustainabilityScore || 0;
                  acc[cat].count += 1;
                  return acc;
                }, {})
              ).map(([label, { sum, count }]) => ({ label, value: Math.round(sum / count) }))}
            />
          </section>
        )}

        <ActivityFeed />

        <section className="panel">
          <div className="panel-head">
            <h2>Products</h2>
            <div className="toolbar">
              <label className="input-icon compact">
                <Search size={15} />
                <input placeholder="Search by name, category or ID…" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Most recent</option>
                <option value="score">Highest score</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>

          {p === null && <RowSkeleton count={4} />}

          {p !== null && filtered.length === 0 && (
            <div className="empty-state">
              <Leaf size={36} />
              <p>{p.length === 0 ? 'No products yet. Add your first product to get started.' : 'No products match your search.'}</p>
              {p.length === 0 && <Link className="btn" to="/add">+ Register Product</Link>}
            </div>
          )}

          {paged.map((x, i) => (
            <Link className="prod fade-in" style={{ animationDelay: `${i * 40}ms` }} to={'/passport/' + x.id} key={x.id}>
              <div className="prod-main">
                <div className="prod-thumb">
                  {x.imageUrl ? <img src={API_ORIGIN + x.imageUrl} alt={x.name} /> : <span className="prod-emoji">🌿</span>}
                </div>
                <div>
                  <b>{x.name}</b>
                  <span>{x.passportId} · {x.category}</span>
                </div>
              </div>
              <div className="prod-score">
                <span className={`score-pill ${(x.sustainabilityScore || 0) >= 75 ? 'good' : (x.sustainabilityScore || 0) >= 45 ? 'mid' : 'low'}`}>
                  {x.sustainabilityScore ?? '—'}%
                </span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}

          {filtered.length > PAGE_SIZE && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage((n) => n - 1)}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((n) => n + 1)}>Next</button>
            </div>
          )}
        </section>

        <FAQ />
      </main>
    </>
  );
}