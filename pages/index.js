import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [activeTab, setActiveTab] = useState('vandaag')
  const [currentActiveDay, setCurrentActiveDay] = useState('Maandag')

  // Coach velden state
  const [coachDate, setCoachDate] = useState('')
  const [coachDay, setCoachDay] = useState('Maandag')
  const [coachTime, setCoachTime] = useState('08:30')
  const [coachType, setCoachType] = useState('Lopen')
  const [coachDuration, setCoachDuration] = useState('')
  const [coachRunPace, setCoachRunPace] = useState('')
  const [coachNotes, setCoachNotes] = useState('')

  // Feedback state
  const [rpeScore, setRpeScore] = useState('5')
  const [coachFeedback, setCoachFeedback] = useState('')

  // Nieuwe Maaltijd state
  const [newMealName, setNewMealName] = useState('')
  const [newMealCategory, setNewMealCategory] = useState('ontbijt')
  const [newMealKcal, setNewMealKcal] = useState('')
  const [newMealCarbs, setNewMealCarbs] = useState('')
  const [newMealProtein, setNewMealProtein] = useState('')
  const [newMealFat, setNewMealFat] = useState('')

  const [weekSchedule, setWeekSchedule] = useState({
    'Maandag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' },
    'Dinsdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' },
    'Woensdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' },
    'Donderdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' },
    'Vrijdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' },
    'Zaterdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' },
    'Zondag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', carbs: '', note: '', ontbijt: 'Nog niet gekozen', lunch: 'Nog niet gekozen', diner: 'Nog niet gekozen', snack: 'Nog niet gekozen', rpe: '', feedback: '' }
  })

  const [mealLibrary, setMealLibrary] = useState([])

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
    if (data) setProfile(data)
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

  const triggerPhotoScan = () => {
    alert('📸 Camera / Recepten-Scanner:\n\nMaak een foto van een recept. Onze AI scant het recept en voegt het direct toe aan de bibliotheek!')
  }

  const saveCoachPlan = () => {
    if (!coachDuration) {
      alert('Vul a.u.b. de duur of omvang van de training in.')
      return
    }

    setWeekSchedule(prev => ({
      ...prev,
      [coachDay]: {
        ...prev[coachDay],
        type: coachType,
        startTime: coachTime,
        duration: coachDuration,
        target: coachRunPace || '-',
        note: coachNotes || ''
      }
    }))

    alert(`Training van Kaat opgeslagen voor Liesbeth op ${coachDay}!`)
    setCoachDuration('')
    setCoachRunPace('')
    setCoachNotes('')
  }

  const submitFeedback = () => {
    setWeekSchedule(prev => ({
      ...prev,
      [currentActiveDay]: {
        ...prev[currentActiveDay],
        rpe: rpeScore,
        feedback: coachFeedback
      }
    }))
    alert(`Feedback voor ${currentActiveDay} verstuurd naar Kaat!`)
    setCoachFeedback('')
  }

  const addCustomMeal = () => {
    if (!newMealName) return alert('Vul a.u.b. een maaltijdnaam in.')
    const newMeal = {
      id: Date.now(),
      name: newMealName,
      category: newMealCategory,
      kcal: parseInt(newMealKcal) || 0,
      carbs: parseInt(newMealCarbs) || 0,
      protein: parseInt(newMealProtein) || 0,
      fat: parseInt(newMealFat) || 0
    }
    setMealLibrary(prev => [...prev, newMeal])
    setNewMealName('')
    setNewMealKcal('')
    setNewMealCarbs('')
    setNewMealProtein('')
    setNewMealFat('')
    alert('Gerecht toegevoegd aan de maaltijdenbibliotheek!')
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em' }}>70.3 TRIATLON HUB</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.75rem' }}>Liesbeth & Kaat</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Performance & Nutrition Hub</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem', textTransform: 'uppercase' }}>E-mailadres</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} placeholder="naam@voorbeeld.be" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Wachtwoord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#ffffff', fontWeight: '700', padding: '0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
          {message && <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>{message}</div>}
        </div>
      </div>
    )
  }

  const role = profile?.role || 'ATHLETE'
  const isCoachOrAdmin = role === 'COACH' || role === 'ADMIN'
  const currentInfo = weekSchedule[currentActiveDay] || {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b' }}>
      
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '14px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>⚡ 70.3 Triatlon Hub</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.3)', border: '1px solid #3b82f6', color: '#93c5fd', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
              {role === 'COACH' ? '⚙️ Coach: Kaat' : role === 'ADMIN' ? '👑 Admin' : '🏃‍♀️ Atlete: Liesbeth'}
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>● Garmin Sync Ready</span>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #475569', color: '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '8px' }}>Uitloggen</button>
          </div>
        </div>
      </header>

      {/* Navigatiebalk */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 16px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {isCoachOrAdmin && (
            <button
              onClick={() => setActiveTab('coach')}
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                border: '1px solid transparent',
                background: activeTab === 'coach' ? '#2563eb' : 'none',
                color: activeTab === 'coach' ? '#ffffff' : '#64748b'
              }}
            >
              ⚙️ Coach Mode (Kaat)
            </button>
          )}

          {[
            { id: 'vandaag', label: '🏠 Vandaag' },
            { id: 'week', label: '📅 Weekplanning' },
            { id: 'maaltijden', label: '🥗 Gerechten' },
            { id: 'boodschappen', label: '🛒 Mealprep' },
            { id: 'gezondheid', label: '❤️ Gezondheid & Garmin' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                border: '1px solid transparent',
                background: activeTab === tab.id ? '#2563eb' : 'none',
                color: activeTab === tab.id ? '#ffffff' : '#64748b'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

        {/* TAB 1: COACH MODE (ALLEEN ZICHTBAAR VOOR KAAT / ADMIN) */}
        {activeTab === 'coach' && isCoachOrAdmin && (
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>📊 Belasting & Progressie van Liesbeth</span>
              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '700' }}>Coach Dashboard (Kaat)</span>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>⚙️ Nieuwe Training Inplannen voor Liesbeth</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>📅 PLANNINSDATUM</label>
                  <input type="date" value={coachDate} onChange={(e) => setCoachDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>DAG VAN DE WEEK</label>
                  <select value={coachDay} onChange={(e) => setCoachDay(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>⏰ STARTTIJD</label>
                  <input type="time" value={coachTime} onChange={(e) => setCoachTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>TYPE TRAINING</label>
                  <select value={coachType} onChange={(e) => setCoachType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <option>Lopen</option>
                    <option>Fietsen</option>
                    <option>Koppeltraining</option>
                    <option>Zwemmen</option>
                    <option>Krachttraining</option>
                    <option>Rustdag</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>DUUR / AFSTAND</label>
                  <input type="text" value={coachDuration} onChange={(e) => setCoachDuration(e.target.value)} placeholder="bijv. 1.5u of 12 km" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>🎯 TEMPO / DOELBLOKKEN</label>
                <textarea rows="3" value={coachRunPace} onChange={(e) => setCoachRunPace(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="Vul hier de doelen of intervallen in..."></textarea>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>💬 INSTRUCTIES VAN KAAT</label>
                <textarea rows="2" value={coachNotes} onChange={(e) => setCoachNotes(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="Optionele opmerkingen over voeding of hartslag..."></textarea>
              </div>

              <button onClick={saveCoachPlan} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Opslaan op Liesbeth's Schema</button>
            </div>
          </div>
        )}

        {/* TAB: VANDAAG */}
        {activeTab === 'vandaag' && (
          <div>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>📅 SELECTEER DAG OM TE BEKIJKEN:</label>
              <select value={currentActiveDay} onChange={(e) => setCurrentActiveDay(e.target.value)} style={{ width: '100%', fontSize: '1rem', fontWeight: '800', color: '#2563eb', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>🚴‍♀️ Training voor Liesbeth ({currentActiveDay})</h3>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px', color: currentInfo.type === 'Nog niet ingepland' ? '#94a3b8' : '#0f172a' }}>{currentInfo.type} {currentInfo.duration && `(${currentInfo.duration})`}</div>
              <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-line', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>{currentInfo.target || 'Nog geen trainingsdoelen ingepland.'}</div>
              {currentInfo.note && <div style={{ fontSize: '0.82rem', color: '#1e293b', background: '#eff6ff', padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>💬 <strong>Instructies van Kaat:</strong> "{currentInfo.note}"</div>}
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📝 Terugkoppeling van Liesbeth naar Kaat</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>RPE SCORE (1 - 10 ZWAARTE)</label>
                <select value={rpeScore} onChange={(e) => setRpeScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="1">1 - Heel erg licht</option>
                  <option value="5">5 - Matig / Zone 2</option>
                  <option value="7">7 - Zwaar / Goede prikkel</option>
                  <option value="9">9 - Extreem zwaar</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>OPMERKINGEN VOOR KAAT</label>
                <textarea rows="2" value={coachFeedback} onChange={(e) => setCoachFeedback(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Hoe voelden de benen en de voeding?"></textarea>
              </div>
              <button onClick={submitFeedback} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Verstuur Feedback naar Kaat</button>
            </div>
          </div>
        )}

        {/* TAB: WEEKPLANNING */}
        {activeTab === 'week' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📅 Weekplanning van Liesbeth</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(day => {
                const info = weekSchedule[day] || {}
                return (
                  <div key={day} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>{day}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: info.type === 'Nog niet ingepland' ? '#94a3b8' : '#2563eb', marginBottom: '4px' }}>🏋️ {info.type} {info.duration && `(${info.duration})`}</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line', marginBottom: '8px' }}>{info.target || 'Geen blokken ingevoerd.'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      • <strong>RPE Feedback:</strong> {info.rpe ? `${info.rpe}/10` : 'Nog niet ingevuld'}<br/>
                      • <strong>Opmerking:</strong> {info.feedback || '-'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB: MAALTIJDEN BEHEREN */}
        {activeTab === 'maaltijden' && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>📸 Recept Scannen via Foto</h3>
              <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '12px' }}>Maak een foto van een recept. De AI herkent automatisch de ingrediënten en voegt ze toe aan de bibliotheek:</p>
              <button onClick={triggerPhotoScan} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📸 Maak of Upload Foto van Recept</button>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>➕ Handmatig Nieuw Gerecht Toevoegen</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>NAAM VAN HET GERECHT</label>
                <input type="text" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="bijv. Havermout met Banaan" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>KCAL</label><input type="number" value={newMealKcal} onChange={(e) => setNewMealKcal(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>KH (G)</label><input type="number" value={newMealCarbs} onChange={(e) => setNewMealCarbs(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>EIWIT (G)</label><input type="number" value={newMealProtein} onChange={(e) => setNewMealProtein(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>VET (G)</label><input type="number" value={newMealFat} onChange={(e) => setNewMealFat(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
              </div>
              <button onClick={addCustomMeal} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Toevoegen aan Bibliotheek</button>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📖 Gerechten Bibliotheek ({mealLibrary.length})</h3>
              {mealLibrary.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nog geen gerechten toegevoegd. Maak een foto of voeg er handmatig een toe.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {mealLibrary.map(m => (
                    <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{m.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.kcal} kcal | {m.carbs}g KH | {m.protein}g Eiwit</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: MEALPREP & BOODSCHAPPEN */}
        {activeTab === 'boodschappen' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>🛒 Boodschappenlijst</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>De boodschappenlijst past zich automatisch aan zodra er maaltijden en trainingen worden ingepland.</p>
          </div>
        )}

        {/* TAB: GEZONDHEID & GARMIN */}
        {activeTab === 'gezondheid' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>❤️ Garmin Gezondheidsstatistieken</h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#059669', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>● Sync Ready</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>De Garmin Fenix gegevens worden geladen zodra de eerste echte trainings- en hersteldata worden binnengehaald.</p>
          </div>
        )}

      </div>
    </div>
  )
}
