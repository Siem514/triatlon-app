import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [activeTab, setActiveTab] = useState('vandaag')
  const [currentActiveDay, setCurrentActiveDay] = useState('Zaterdag')
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

  // Coach velden state
  const [coachDate, setCoachDate] = useState('')
  const [coachDay, setCoachDay] = useState('Maandag')
  const [coachTime, setCoachTime] = useState('08:30')
  const [coachType, setCoachType] = useState('Lopen')
  const [coachDuration, setCoachDuration] = useState('1.0')
  const [coachRunKm, setCoachRunKm] = useState('')
  const [coachRunHours, setCoachRunHours] = useState('')
  const [coachRunPace, setCoachRunPace] = useState('')
  const [coachBikeWatts, setCoachBikeWatts] = useState('')
  const [coachSwimPace, setCoachSwimPace] = useState('')
  const [coachNotes, setCoachNotes] = useState('')

  // Feedback state
  const [rpeScore, setRpeScore] = useState('7')
  const [coachFeedback, setCoachFeedback] = useState('')

  // Nieuwe Maaltijd state
  const [newMealName, setNewMealName] = useState('')
  const [newMealCategory, setNewMealCategory] = useState('ontbijt')
  const [newMealKcal, setNewMealKcal] = useState('')
  const [newMealCarbs, setNewMealCarbs] = useState('')
  const [newMealProtein, setNewMealProtein] = useState('')
  const [newMealFat, setNewMealFat] = useState('')

  const daysOfWeekList = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']

  const [weekSchedule, setWeekSchedule] = useState({
    'Maandag': { type: 'Rustdag', startTime: '08:00', duration: '0u', target: '-', carbs: '200g KH (Low)', note: 'Volledige rust en spierherstel.', ontbijt: 'Toast met jam/honing + 1 gekookt ei', lunch: 'Volkoren Wrap met 150g Muscle Meat Kip', diner: 'Pasta Bolognese met Mager Rundergehakt', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '1', feedback: 'Goed uitgerust.' },
    'Dinsdag': { type: 'Zwemmen', startTime: '07:00', duration: '1.5u', target: 'Inzwemmen: 200m @ 32 m/min\nKern: 8x 100m @ 38 m/min (r20s)\nUitzwemmen: 100m @ 30 m/min', carbs: '320g KH (Medium)', note: 'Techniek en intervallen.', ontbijt: 'Havermout met magere melk + banaan', lunch: '150g Muscle Meat Kipfilet + Zoete Aardappel', diner: 'Vegetarische Curry met Groenten & Rijst', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '6', feedback: 'Lekker zwemgevoel.' },
    'Woensdag': { type: 'Koppeltraining', startTime: '08:30', duration: '2.0u', target: 'Fietsen: 1.5u @ 180W Zone 2\nKoppelrun: 30m @ 4:15 min/km', carbs: '450g KH (High)', note: 'Direct overgaan in koppelrun.', ontbijt: 'Havermout met magere melk + banaan', lunch: 'Volkoren Wrap met 150g Muscle Meat Kip', diner: 'Pasta Bolognese met Mager Rundergehakt', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '8', feedback: 'Zware wissel op de benen.' },
    'Donderdag': { type: 'Lopen', startTime: '17:30', duration: '12 km', target: 'Inlopen: 15m @ 5:15 min/km\nKern: 4x 1km @ 3:55 min/km (r2m)\nUitlopen: 10m @ 5:20 min/km', carbs: '380g KH (High)', note: 'Strak op tempo lopen na het werk.', ontbijt: 'Toast met jam/honing + 1 gekookt ei', lunch: '150g Muscle Meat Kipfilet + Zoete Aardappel', diner: 'Vegetarische Curry met Groenten & Rijst', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '7', feedback: 'Pace strak gehouden.' },
    'Vrijdag': { type: 'Rustdag / Herstel', startTime: '08:00', duration: '0u', target: 'Mobiliteit', carbs: '200g KH (Low)', note: 'Lichte stretch sessie.', ontbijt: 'Toast met jam/honing + 1 gekookt ei', lunch: 'Volkoren Wrap met 150g Muscle Meat Kip', diner: 'Pasta Bolognese met Mager Rundergehakt', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '2', feedback: 'Mobiliteit gedaan.' },
    'Zaterdag': { type: 'Fietsen', startTime: '09:00', duration: '3.5u', target: 'Warming up: 15m @ 140W\nKern: 3x 15m @ 195W (5m Z1)\nD2: 45m constant @ 175W\nUittrappen: 10m @ 130W', carbs: '520g KH (Extreme)', note: 'Sleutelsessie voeding/brandstof op de fiets!', ontbijt: 'Havermout met magere melk + banaan', lunch: '150g Muscle Meat Kipfilet + Zoete Aardappel', diner: 'Pasta Bolognese met Mager Rundergehakt', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '', feedback: '' },
    'Zondag': { type: 'Lopen', startTime: '10:00', duration: '1.5u', target: 'Inlopen: 10m @ 5:10 min/km\nLange duurloop: 1u10m @ 4:30 min/km\nUitlopen: 10m @ 5:15 min/km', carbs: '380g KH (High)', note: 'Constant tempo vasthouden.', ontbijt: 'Havermout met magere melk + banaan', lunch: 'Volkoren Wrap met 150g Muscle Meat Kip', diner: 'Vegetarische Curry met Groenten & Rijst', snack: '200g Magere Franse Kwark met blauwe bessen', rpe: '', feedback: '' }
  })

  const [mealLibrary, setMealLibrary] = useState([
    { id: 1, name: 'Havermout met magere melk + banaan', category: 'ontbijt', kcal: 410, carbs: 72, protein: 20, fat: 5 },
    { id: 2, name: 'Toast met jam/honing + 1 gekookt ei', category: 'ontbijt', kcal: 320, carbs: 48, protein: 12, fat: 8 },
    { id: 3, name: '150g Muscle Meat Kipfilet + Zoete Aardappel', category: 'lunch', kcal: 510, carbs: 58, protein: 38, fat: 9 },
    { id: 4, name: 'Volkoren Wrap met 150g Muscle Meat Kip', category: 'lunch', kcal: 480, carbs: 45, protein: 35, fat: 12 },
    { id: 5, name: 'Vegetarische Curry met Groenten & Rijst', category: 'diner', kcal: 590, carbs: 78, protein: 36, fat: 14 },
    { id: 6, name: 'Pasta Bolognese met Mager Rundergehakt', category: 'diner', kcal: 640, carbs: 82, protein: 32, fat: 16 },
    { id: 7, name: '200g Magere Franse Kwark met blauwe bessen', category: 'snack', kcal: 180, carbs: 16, protein: 22, fat: 1 }
  ])

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
    alert('📸 Camera / Recepten-Scanner:\n\nDeze knop activeert de camera. Onze AI scant de tekst van het recept en voegt de voedingswaarden automatisch toe aan Liesbeth\'s bibliotheek!')
  }

  const formatDate = (dateObj) => {
    let day = String(dateObj.getDate())
    if (day.length < 2) day = '0' + day
    let month = String(dateObj.getMonth() + 1)
    if (month.length < 2) month = '0' + month
    return day + '/' + month + '/' + dateObj.getFullYear()
  }

  const saveCoachPlan = () => {
    let duration = coachDuration + 'u'
    if (coachType === 'Lopen') {
      if (coachRunKm) duration = coachRunKm + ' km'
      else if (coachRunHours) duration = coachRunHours + 'u'
    }

    let targetStr = '-'
    if (coachType === 'Lopen') targetStr = coachRunPace || 'Tempo in blokken'
    else if (coachType === 'Zwemmen') targetStr = coachSwimPace || '35 m/min in blokken'
    else if (coachType === 'Fietsen' || coachType === 'Koppeltraining') targetStr = coachBikeWatts || 'Wattage in blokken'

    let carbAdvise = '350g KH (Medium)'
    let durNum = parseFloat(duration)
    if (durNum >= 3.0) carbAdvise = '500g+ KH (Extreme)'
    else if (durNum >= 1.5 || coachType === 'Koppeltraining') carbAdvise = '450g KH (High)'
    else if (coachType === 'Rustdag') carbAdvise = '200g KH (Low)'

    setWeekSchedule(prev => ({
      ...prev,
      [coachDay]: {
        ...prev[coachDay],
        type: coachType,
        startTime: coachTime,
        duration: duration,
        target: targetStr,
        carbs: carbAdvise,
        note: coachNotes
      }
    }))

    alert(`Trainingsplan van Kaat succesvol opgeslagen voor Liesbeth op ${coachDay}!`)
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
    alert(`Feedback van Liesbeth (RPE ${rpeScore}) verstuurd naar Kaat!`)
  }

  const addCustomMeal = () => {
    if (!newMealName) return alert('Vul een maaltijdnaam in')
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
    alert('Maaltijd succesvol toegevoegd aan de bibliotheek!')
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

  const currentInfo = weekSchedule[currentActiveDay] || {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b' }}>
      
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '14px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>⚡ 70.3 Triatlon Hub</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.3)', border: '1px solid #3b82f6', color: '#93c5fd', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>🏃‍♀️ Atlete: Liesbeth</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>● Garmin Fenix 7 Live Sync</span>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #475569', color: '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '8px' }}>Uitloggen</button>
          </div>
        </div>
      </header>

      {/* Navigatiebalk */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 16px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {[
            { id: 'coach', label: '⚙️ Coach Mode (Kaat)' },
            { id: 'week', label: '📅 Weekplanning' },
            { id: 'vandaag', label: '🏠 Vandaag' },
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

        {/* TAB 1: COACH MODE (KAAT) */}
        {activeTab === 'coach' && (
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>📊 Belasting & Progressie van Liesbeth</span>
              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '700' }}>Coach Dashboard (Kaat)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#1e293b', color: 'white', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>🏊 Zwemmen</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', margin: '10px 0', textAlign: 'center' }}>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8' }}>7.2 km</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>AFSTAND</div></div>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8' }}>2.5u</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>TIJD</div></div>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#34d399' }}>130</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>TSS</div></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CSS tempo 1:35/100m. Volume gestaag opgebouwd.</div>
              </div>

              <div style={{ background: '#1e293b', color: 'white', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#34d399', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>🚴 Fietsen</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', margin: '10px 0', textAlign: 'center' }}>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8' }}>145 km</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>AFSTAND</div></div>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8' }}>5.0u</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>TIJD</div></div>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#34d399' }}>245</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>TSS</div></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sterke Zone 2 ritten. KH-inname (75g/u) op schema.</div>
              </div>

              <div style={{ background: '#1e293b', color: 'white', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fbbf24', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>🏃 Lopen</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', margin: '10px 0', textAlign: 'center' }}>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8' }}>32 km</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>AFSTAND</div></div>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8' }}>2.8u</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>TIJD</div></div>
                  <div style={{ background: '#334155', padding: '6px 2px', borderRadius: '6px' }}><div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#34d399' }}>185</div><div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>TSS</div></div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Goede balans interval/koppelrun. Kuitverzorging na tempo.</div>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>⚙️ Training Inplannen voor Liesbeth</h3>
              
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>DUUR (UREN)</label>
                  <input type="number" step="0.5" value={coachDuration} onChange={(e) => setCoachDuration(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>🎯 TEMPO / DOELBLOKKEN</label>
                <textarea rows="3" value={coachRunPace} onChange={(e) => setCoachRunPace(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="Inlopen: 15m @ 5:15 min/km&#10;Kern: 4x 1km @ 3:55 min/km&#10;Uitlopen: 10m"></textarea>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>💬 INSTRUCTIES VAN KAAT</label>
                <textarea rows="2" value={coachNotes} onChange={(e) => setCoachNotes(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} placeholder="Bijv. Hydratatiebewaking, hartslag in Z2 houden..."></textarea>
              </div>

              <button onClick={saveCoachPlan} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Opslaan op Liesbeth's Schema</button>
            </div>
          </div>
        )}

        {/* TAB 2: WEEKPLANNING */}
        {activeTab === 'week' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📅 Jaaragenda & Trainingshistorie van Liesbeth</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(day => {
                const info = weekSchedule[day] || {}
                return (
                  <div key={day} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>{day}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>🏋️ {info.type || 'Rustdag'} ({info.duration || '0u'})</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line', marginBottom: '8px' }}>{info.target || '-'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      • <strong>Ontbijt:</strong> {info.ontbijt}<br/>
                      • <strong>Lunch:</strong> {info.lunch}<br/>
                      • <strong>Diner:</strong> {info.diner}<br/>
                      • <strong>Snack:</strong> {info.snack}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: VANDAAG */}
        {activeTab === 'vandaag' && (
          <div>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>📅 SELECTEER ACTIEVE DAG FOCUS:</label>
              <select value={currentActiveDay} onChange={(e) => setCurrentActiveDay(e.target.value)} style={{ width: '100%', fontSize: '1rem', fontWeight: '800', color: '#2563eb', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>🚴‍♀️ Training voor Liesbeth ({currentActiveDay})</h3>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>Sleutelsessie</span>
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>{currentInfo.type} ({currentInfo.duration}) - Start om {currentInfo.startTime || '08:30'}</div>
              <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-line', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>{currentInfo.target}</div>
              <div style={{ fontSize: '0.82rem', color: '#1e293b', background: '#eff6ff', padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>💬 <strong>Instructies van Kaat:</strong> "{currentInfo.note || 'Geen opmerkingen'}"</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>🥗 Dynamisch Dageetschema (Getimed op Training)</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: '0.85rem' }}>07:30 - Pre-Workout Ontbijt</strong><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{currentInfo.ontbijt}</p></div>
                  <button onClick={triggerPhotoScan} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>📷 Foto Scan</button>
                </div>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: '0.85rem' }}>12:30 - Herstellunch (Eiwit + Koolhydraten)</strong><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{currentInfo.lunch}</p></div>
                  <button onClick={triggerPhotoScan} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>📷 Foto Scan</button>
                </div>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong style={{ fontSize: '0.85rem' }}>19:00 - Avondeten</strong><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{currentInfo.diner}</p></div>
                  <button onClick={triggerPhotoScan} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>📷 Foto Scan</button>
                </div>
              </div>
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
                <textarea rows="2" value={coachFeedback} onChange={(e) => setCoachFeedback(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Gevoel, benen, maag opname..."></textarea>
              </div>
              <button onClick={submitFeedback} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Verstuur Feedback naar Kaat</button>
            </div>
          </div>
        )}

        {/* TAB 4: MAALTIJDEN BEHEREN */}
        {activeTab === 'maaltijden' && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>📸 Recept Scannen via Foto</h3>
              <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '12px' }}>Maak een foto van een recept uit een kookboek. Onze AI herkent automatisch de ingrediënten en berekent de macro's:</p>
              <button onClick={triggerPhotoScan} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📸 Maak of Upload Foto van Recept</button>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>➕ Handmatig Nieuwe Maaltijd Toevoegen</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>NAAM VAN HET GERECHT</label>
                <input type="text" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="bijv. Muscle Meat Kip + Zoete Aardappel" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
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
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📖 Liesbeth's Maaltijden Bibliotheek</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {mealLibrary.map(m => (
                  <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{m.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.kcal} kcal | {m.carbs}g KH | {m.protein}g Eiwit</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MEALPREP & BOODSCHAPPEN */}
        {activeTab === 'boodschappen' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>🛒 Geautomatiseerde Boodschappenlijst</h3>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem', color: '#166534' }}>
                <div>🛒 <strong>Muscle Meat Kipfilet:</strong> ~1.25 kg (incl. extra voor herstel na fietssessie)</div>
                <div>🛒 <strong>Mager Rundergehakt:</strong> ~600 gram</div>
                <div>🛒 <strong>Magere Franse Kwark:</strong> 7x potten (200g)</div>
                <div>🛒 <strong>Mager Cecemel / Chocomel (0% vet):</strong> 3.5 Liter</div>
                <div>🛒 <strong>Bananen:</strong> 3 trossen</div>
              </div>
            </div>
            <button onClick={() => alert('Boodschappenlijst gekopieerd!')} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Kopieer Boodschappenlijst</button>
          </div>
        )}

        {/* TAB 6: GEZONDHEID & GARMIN */}
        {activeTab === 'gezondheid' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>❤️ Liesbeth's Garmin Gezondheidsstatistieken & Herstel</h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#059669', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>● Garmin Fenix 7 Live Sync</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>⚡ BODY BATTERY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>88 / 100</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Opgeladen & Hersteld</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>😴 SLAAP & HERSTELSCORE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>84 / 100</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>7u 45m (1u 50m Diep)</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>🔥 TRAININGSREADINESS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>Optimaal</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Klaar voor Sleutelsessie</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>⚖️ LICHAAMSGEWICHT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>59.4 kg</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vet %: 17.2%</div>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#166534' }}>
              <strong>💡 Gezondheidsanalyse voor Kaat & Liesbeth:</strong> Liesbeth's herstel- en slaapscores laten zien dat haar spieren volledig zijn hersteld. De Body Battery van 88 geeft groen licht voor de zware fiets-koppelsessie.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
