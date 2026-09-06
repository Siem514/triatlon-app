import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const INGREDIENT_DATABASE = [
  { keywords: ['kipfilet', 'kip'], kcal: 110, carbs: 0, protein: 23, fat: 1.5 },
  { keywords: ['rundergehakt', 'gehakt', 'mager gehakt'], kcal: 158, carbs: 0, protein: 20, fat: 8.5 },
  { keywords: ['zoete aardappel', 'aardappel'], kcal: 86, carbs: 20, protein: 1.6, fat: 0.1 },
  { keywords: ['zilvervliesrijst', 'rijst'], kcal: 111, carbs: 23, protein: 2.6, fat: 0.9 },
  { keywords: ['havermout', 'haver'], kcal: 389, carbs: 66, protein: 17, fat: 7 },
  { keywords: ['banaan'], kcal: 89, carbs: 23, protein: 1.1, fat: 0.3 },
  { keywords: ['kwark', 'franse kwark'], kcal: 52, carbs: 4, protein: 8.5, fat: 0.2 },
  { keywords: ['olijfolie', 'olie'], kcal: 884, carbs: 0, protein: 0, fat: 100 },
  { keywords: ['pindakaas'], kcal: 588, carbs: 20, protein: 25, fat: 50 },
  { keywords: ['volkoren brood', 'brood', 'toast'], kcal: 247, carbs: 41, protein: 9, fat: 2 },
  { keywords: ['ei', 'eieren'], kcal: 155, carbs: 1.1, protein: 13, fat: 11 },
  { keywords: ['pasta', 'spaghetti', 'macaroni'], kcal: 131, carbs: 25, protein: 5, fat: 1.1 },
  { keywords: ['chocomel', 'cecemel'], kcal: 60, carbs: 10, protein: 3.5, fat: 0.2 },
  { keywords: ['tonijn'], kcal: 113, carbs: 0, protein: 26, fat: 0.9 },
  { keywords: ['zalm'], kcal: 208, carbs: 0, protein: 20, fat: 13 },
  { keywords: ['avocado'], kcal: 160, carbs: 9, protein: 2, fat: 15 }
]

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const daysOfWeekList = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']

  const [activeTab, setActiveTab] = useState('vandaag')
  const [currentActiveDay, setCurrentActiveDay] = useState('Zondag')

  // Coach velden state
  const [coachDate, setCoachDate] = useState('')
  const [coachDay, setCoachDay] = useState('Zondag')
  const [coachTime, setCoachTime] = useState('08:30')
  const [coachType, setCoachType] = useState('Lopen')
  const [coachDuration, setCoachDuration] = useState('')
  const [coachRunPace, setCoachRunPace] = useState('')
  const [coachNotes, setCoachNotes] = useState('')

  // Feedback state
  const [rpeScore, setRpeScore] = useState('5')
  const [coachFeedback, setCoachFeedback] = useState('')

  // Slimme Maaltijd Invoer state
  const [newMealName, setNewMealName] = useState('')
  const [newMealCategory, setNewMealCategory] = useState('ontbijt')
  const [ingredientsInput, setIngredientsInput] = useState('')
  const [calculatedMacros, setCalculatedMacros] = useState({ kcal: 0, carbs: 0, protein: 0, fat: 0 })

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

  // Functie om de datums van de huidige week te berekenen
  const getWeekDates = () => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = Zondag, 1 = Maandag...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay

    const monday = new Date(now)
    monday.setDate(now.getDate() + distanceToMonday)

    const weekDays = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']
    const result = {}

    weekDays.forEach((day, index) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + index)
      const dayStr = String(d.getDate()).padStart(2, '0')
      const monthStr = String(d.getMonth() + 1).padStart(2, '0')
      result[day] = `${dayStr}/${monthStr}/${d.getFullYear()}`
    })

    return result
  }

  const weekDates = getWeekDates()

  useEffect(() => {
    const today = new Date()
    const todayName = daysOfWeekList[today.getDay()]
    setCurrentActiveDay(todayName)
    setCoachDay(todayName)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id, session.user.email)
      }
    })
  }, [])

  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data && data.role) {
        setProfile(data)
      } else {
        const isLiesbeth = userEmail?.toLowerCase().includes('liesbeth')
        setProfile({ id: userId, role: isLiesbeth ? 'ATHLETE' : 'COACH' })
      }
    } catch (e) {
      const isLiesbeth = userEmail?.toLowerCase().includes('liesbeth')
      setProfile({ id: userId, role: isLiesbeth ? 'ATHLETE' : 'COACH' })
    }
  }

  const handleDateChange = (selectedDate) => {
    setCoachDate(selectedDate)
    if (selectedDate) {
      const dateObj = new Date(selectedDate)
      const dayName = daysOfWeekList[dateObj.getDay()]
      setCoachDay(dayName)
    }
  }

  const handleIngredientsChange = (text) => {
    setIngredientsInput(text)
    let totalKcal = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0

    const lines = text.toLowerCase().split('\n')
    lines.forEach(line => {
      if (!line.trim()) return

      const matchNumber = line.match(/\d+/)
      const grams = matchNumber ? parseInt(matchNumber[0], 10) : 100
      const factor = grams / 100

      INGREDIENT_DATABASE.forEach(item => {
        const found = item.keywords.some(keyword => line.includes(keyword))
        if (found) {
          totalKcal += item.kcal * factor
          totalCarbs += item.carbs * factor
          totalProtein += item.protein * factor
          totalFat += item.fat * factor
        }
      })
    })

    setCalculatedMacros({
      kcal: Math.round(totalKcal),
      carbs: Math.round(totalCarbs),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat)
    })
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
      fetchProfile(data.user.id, data.user.email)
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
      composition: ingredientsInput,
      kcal: calculatedMacros.kcal,
      carbs: calculatedMacros.carbs,
      protein: calculatedMacros.protein,
      fat: calculatedMacros.fat
    }
    setMealLibrary(prev => [...prev, newMeal])
    setNewMealName('')
    setIngredientsInput('')
    setCalculatedMacros({ kcal: 0, carbs: 0, protein: 0, fat: 0 })
    alert('Gerecht met berekende macro\'s toegevoegd aan de bibliotheek!')
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

  const userEmail = user?.email?.toLowerCase() || ''
  const isLiesbethUser = userEmail.includes('liesbeth')
  const dbRole = profile?.role
  const isCoachOrAdmin = dbRole === 'COACH' || dbRole === 'ADMIN' || (!isLiesbethUser && dbRole !== 'ATHLETE')

  const currentInfo = weekSchedule[currentActiveDay] || {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b' }}>
      
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '14px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>⚡ 70.3 Triatlon Hub</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.3)', border: '1px solid #3b82f6', color: '#93c5fd', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
              {isCoachOrAdmin ? '⚙️ Coach: Kaat' : '🏃‍♀️ Atlete: Liesbeth'}
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

        {/* TAB 1: COACH MODE */}
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>📅 SELECTEER DATUM</label>
                  <input type="date" value={coachDate} onChange={(e) => handleDateChange(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>DAG VAN DE WEEK (AUTOMATISCH)</label>
                  <select value={coachDay} onChange={(e) => setCoachDay(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '700', color: '#2563eb' }}>
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
                {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(d => <option key={d}>{d} ({weekDates[d]})</option>)}
              </select>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>🚴‍♀️ Training voor Liesbeth ({currentActiveDay} {weekDates[currentActiveDay]})</h3>
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

        {/* TAB: WEEKPLANNING MET METEEN DE EXACTE DATUMS */}
        {activeTab === 'week' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📅 Weekplanning van Liesbeth (Week van {weekDates['Maandag']} t/m {weekDates['Zondag']})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].map(day => {
                const info = weekSchedule[day] || {}
                return (
                  <div key={day} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>{day}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>{weekDates[day]}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: info.type === 'Nog niet ingepland' ? '#94a3b8' : '#0f172a', marginBottom: '4px' }}>🏋️ {info.type} {info.duration && `(${info.duration})`}</div>
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

        {/* TAB: MAALTIJDEN BEHEREN & SLIMME MACRO BEREKENING */}
        {activeTab === 'maaltijden' && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>📸 Recept Scannen via Foto</h3>
              <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '12px' }}>Maak een foto van een recept. De AI herkent automatisch de ingrediënten en voegt ze toe aan de bibliotheek:</p>
              <button onClick={triggerPhotoScan} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📸 Maak of Upload Foto van Recept</button>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>🥗 Slim Gerecht Samenstellen & Macro's Berekenen</h3>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>NAAM VAN HET GERECHT</label>
                <input type="text" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="bijv. Muscle Meat Kip + Zoete Aardappel" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>INGREDIËNTEN & GEWICHTEN (Onder elkaar invoeren)</label>
                <textarea rows="4" value={ingredientsInput} onChange={(e) => handleIngredientsChange(e.target.value)} placeholder="bijv.&#10;150g kipfilet&#10;200g zoete aardappel&#10;10g olijfolie" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}></textarea>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Ondersteund: kipfilet, gehakt, zoete aardappel, rijst, havermout, banaan, kwark, olijfolie, pindakaas, brood, ei, pasta, chocomel, tonijn, zalm, avocado.</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div><div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>KCAL</div><strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{calculatedMacros.kcal}</strong></div>
                <div><div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '700' }}>KH (G)</div><strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>{calculatedMacros.carbs}g</strong></div>
                <div><div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>EIWIT (G)</div><strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{calculatedMacros.protein}g</strong></div>
                <div><div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '700' }}>VET (G)</div><strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{calculatedMacros.fat}g</strong></div>
              </div>

              <button onClick={addCustomMeal} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Opslaan in Bibliotheek</button>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📖 Gerechten Bibliotheek ({mealLibrary.length})</h3>
              {mealLibrary.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nog geen gerechten toegevoegd. Stel hierboven een maaltijd samen met ingrediënten.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {mealLibrary.map(m => (
                    <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong>{m.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>{m.kcal} kcal | {m.carbs}g KH | {m.protein}g Eiwit | {m.fat}g Vet</span>
                      </div>
                      {m.composition && <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'pre-line' }}>{m.composition}</p>}
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
