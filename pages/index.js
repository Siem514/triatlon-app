import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [sportType, setSportType] = useState('Fietsen')
  const [duration, setDuration] = useState('90 min')
  const [targetBlocks, setTargetBlocks] = useState('3x15 min D2 met cadans 90-95')
  const [notes, setNotes] = useState('75g koolhydraten per uur innemen')

  const [trainings, setTrainings] = useState([])
  const [rpeInput, setRpeInput] = useState({})
  const [feedbackInput, setFeedbackInput] = useState({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      fetchTrainings()
    }
  }

  const fetchTrainings = async () => {
    const { data } = await supabase.from('trainings').select('*').order('created_at', { ascending: false })
    if (data) setTrainings(data)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(`Fout: ${error.message}`)
    } else {
      setUser(data.user)
      fetchProfile(data.user.id)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const handleAddTraining = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('trainings').insert([{
      sport_type: sportType,
      duration_or_distance: duration,
      target_blocks: targetBlocks,
      coach_notes: notes,
      date: new Date().toISOString().split('T')[0]
    }])
    if (!error) {
      alert('Training succesvol ingepland!')
      fetchTrainings()
    }
  }

  const handleUpdateFeedback = async (id) => {
    const { error } = await supabase.from('trainings').update({
      rpe_score: rpeInput[id],
      athlete_feedback: feedbackInput[id]
    }).eq('id', id)
    if (!error) {
      alert('Feedback verzonden!')
      fetchTrainings()
    }
  }

  const getSportBadgeColor = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'zwemmen': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' }
      case 'fietsen': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' }
      case 'lopen': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }
      default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em' }}>70.3 TRIATLON HUB</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.75rem' }}>Welkom Terug</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Log in op je trainingsomgeving</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>E-mailadres</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} placeholder="naam@voorbeeld.be" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Wachtwoord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#ffffff', fontWeight: '600', padding: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
          {message && <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>{message}</div>}
        </div>
      </div>
    )
  }

  const role = profile?.role || 'ADMIN'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <header style={{ background: '#0f172a', color: '#ffffff', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>70.3 TRIATLON HUB</h1>
              <span style={{ background: role === 'ADMIN' ? '#ef4444' : role === 'COACH' ? '#2563eb' : '#10b981', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                {role}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Ingelogd als <strong style={{ color: '#f8fafc' }}>{user.email}</strong></p>
          </div>
          <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
            Uitloggen
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {(role === 'COACH' || role === 'ADMIN') && (
          <section style={{ background: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '4px', height: '20px', background: '#2563eb', borderRadius: '2px' }}></div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Nieuwe Training Inplannen</h2>
            </div>
            <form onSubmit={handleAddTraining} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Sporttype</label>
                <select value={sportType} onChange={(e) => setSportType(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}>
                  <option>Fietsen</option>
                  <option>Lopen</option>
                  <option>Zwemmen</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Duur / Afstand</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Doelblokken & Intensiteit</label>
                <input type="text" value={targetBlocks} onChange={(e) => setTargetBlocks(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Voedingsadvies & Brandstof</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minHeight: '70px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
                  + Training Opslaan & Toewijzen
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Trainings- & Voedingsschema</h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{trainings.length} gepland</span>
          </div>

          {trainings.length === 0 ? (
            <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
              Nog geen trainingen gepland.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {trainings.map((t) => {
                const badge = getSportBadgeColor(t.sport_type)
                return (
                  <div key={t.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '0.3rem 0.75rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                          {t.sport_type}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{t.duration_or_distance}</h3>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>{t.date}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Kern / Doelblokken</span>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>{t.target_blocks}</p>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Voeding / Brandstof</span>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>{t.coach_notes}</p>
                      </div>
                    </div>

                    {t.rpe_score ? (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>RPE {t.rpe_score}/10</span>
                          <strong style={{ fontSize: '0.85rem', color: '#15803d' }}>Feedback van Atleet:</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>{t.athlete_feedback}</p>
                      </div>
                    ) : (
                      (role === 'ATHLETE' || role === 'ADMIN') && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.25rem', borderRadius: '12px', marginTop: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#b45309' }}>Training Afronden & Feedback Versturen</h4>
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem' }}>Ervaren Zwaarte (RPE 1 - 10)</label>
                              <input type="number" min="1" max="10" onChange={(e) => setRpeInput({ ...rpeInput, [t.id]: e.target.value })} style={{ width: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fde68a' }} placeholder="7" />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#92400e', marginBottom: '0.25rem' }}>Opmerkingen / Gevoel</label>
                              <textarea onChange={(e) => setFeedbackInput({ ...feedbackInput, [t.id]: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '0.875rem', boxSizing: 'border-box' }} placeholder="Hoe gingen de benen en de voeding?" />
                            </div>
                            <button onClick={() => handleUpdateFeedback(t.id)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                              Verstuur Feedback
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
