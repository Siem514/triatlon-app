import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const INGREDIENT_DATABASE = [
  { name: 'Aardappel (Gekookt)', kcal: 85, carbs: 17, protein: 2, fat: 0.1 },
  { name: 'Avocado', kcal: 160, carbs: 9, protein: 2, fat: 15 },
  { name: 'Banaan', kcal: 89, carbs: 23, protein: 1.1, fat: 0.3 },
  { name: 'Broccoli', kcal: 34, carbs: 7, protein: 2.8, fat: 0.4 },
  { name: 'Chocomel (Mager/Cecemel)', kcal: 60, carbs: 10, protein: 3.5, fat: 0.2 },
  { name: 'Ei (1 middelgroot ~50g)', kcal: 155, carbs: 1.1, protein: 13, fat: 11 },
  { name: 'Havermout', kcal: 389, carbs: 66, protein: 17, fat: 7 },
  { name: 'Kipfilet (Rauw/Bereid)', kcal: 110, carbs: 0, protein: 23, fat: 1.5 },
  { name: 'Kwark (Mager)', kcal: 52, carbs: 4, protein: 8.5, fat: 0.2 },
  { name: 'MM Basmati Rijst (Gekookt)', kcal: 120, carbs: 25, protein: 2.5, fat: 0.4 },
  { name: 'MM Biefstuk Reepjes/Blokjes', kcal: 115, carbs: 0, protein: 22, fat: 2.5 },
  { name: 'MM Gegaarde Kipfilet Blokjes', kcal: 112, carbs: 0, protein: 24, fat: 1.8 },
  { name: 'MM Kalkoenfilet Blokjes', kcal: 108, carbs: 0, protein: 24, fat: 1.2 },
  { name: 'MM Mager Rundergehakt 5%', kcal: 133, carbs: 0, protein: 21, fat: 5 },
  { name: 'MM Paarden Tartaar', kcal: 105, carbs: 0, protein: 21, fat: 2 },
  { name: 'MM Zoete Aardappel Blokjes', kcal: 86, carbs: 20, protein: 1.6, fat: 0.1 },
  { name: 'Olijfolie', kcal: 884, carbs: 0, protein: 0, fat: 100 },
  { name: 'Pasta (Gekookt)', kcal: 131, carbs: 25, protein: 5, fat: 1.1 },
  { name: 'Pindakaas', kcal: 588, carbs: 20, protein: 25, fat: 50 },
  { name: 'Spinazie', kcal: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
  { name: 'Tonijn (in eigen nat)', kcal: 113, carbs: 0, protein: 26, fat: 0.9 },
  { name: 'Volkoren Brood', kcal: 247, carbs: 41, protein: 9, fat: 2 },
  { name: 'Zalmfilet', kcal: 208, carbs: 0, protein: 20, fat: 13 }
].sort((a, b) => a.name.localeCompare(b.name))

const WEEKDAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [activeTab, setActiveTab] = useState('vandaag')
  const [currentActiveDay, setCurrentActiveDay] = useState('Zondag')
  const [weekOffset, setWeekOffset] = useState(0)

  // Coach waarden
  const [coachDate, setCoachDate] = useState('2026-09-06')
  const [coachDay, setCoachDay] = useState('Zondag')
  const [coachTime, setCoachTime] = useState('08:30')
  const [coachType, setCoachType] = useState('Lopen')
  const [coachDuration, setCoachDuration] = useState('')
  const [coachRunPace, setCoachRunPace] = useState('')
  const [coachNotes, setCoachNotes] = useState('')

  // Feedback waarden
  const [rpeScore, setRpeScore] = useState('5')
  const [coachFeedback, setCoachFeedback] = useState('')
  const [feedbackList, setFeedbackList] = useState([])

  // Recepten
  const [newMealName, setNewMealName] = useState('')
  const [newMealCategory, setNewMealCategory] = useState('Ontbijt')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [gramsInput, setGramsInput] = useState('100')

  const [weekSchedule, setWeekSchedule] = useState({
    'Maandag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' },
    'Dinsdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' },
    'Woensdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' },
    'Donderdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' },
    'Vrijdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' },
    'Zaterdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' },
    'Zondag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '' }
  })

  const [mealLibrary, setMealLibrary] = useState([])

  // Eenvoudige datumberekening zonder tijdzones
  const getWeekDates = (offset) => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Zondag, 1 = Maandag...
    const distToMonday = currentDay === 0 ? -6 : 1 - currentDay

    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + distToMonday + (offset * 7))

    const result = {}
    WEEKDAYS.forEach((dayName, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      result[dayName] = `${dd}/${mm}/${d.getFullYear()}`
    })
    return result
  }

  const weekDates = getWeekDates(weekOffset)

  const calculateFuelStrategy = (type, durationStr) => {
    if (!type || type === 'Nog niet ingepland' || type === 'Rustdag') {
      return { carbsHour: '0g', hydratatie: 'Geen specifieke intra-workout voeding nodig.', advies: 'Normale voeding op schema aanhouden.' }
    }

    let durNum = parseFloat(durationStr) || 1.0

    if (type === 'Fietsen' || type === 'Koppeltraining') {
      if (durNum >= 2.5) {
        return {
          carbsHour: '75g - 90g KH / uur',
          hydratatie: '2x Bidon 750ml Iso-drink + Elektrolyten per 1.5u',
          advies: '1e uur: Bananen/Rijsttaartjes. Vanaf 2e uur: 1x Gel om de 35-40 min.',
          herstel: 'Direct na afloop: 500ml Mager Cecemel / Chocomel (0% vet) + Herstelshake'
        }
      } else {
        return {
          carbsHour: '45g - 60g KH / uur',
          hydratatie: '1x Bidon 750ml Iso-drink met elektrolyten',
          advies: '1x Iso-gel of banaan na 45 minuten.',
          herstel: '300ml Mager Cecemel of eiwitrijke snack binnen 30 min.'
        }
      }
    } else if (type === 'Lopen') {
      if (durNum >= 1.5 || durationStr.includes('12') || durationStr.includes('15') || durationStr.includes('20')) {
        return {
          carbsHour: '40g - 60g KH / uur',
          hydratatie: '500ml Water/Iso in softflask',
          advies: '1x Gel om de 6 tot 8 km met water.',
          herstel: 'Herstelshake met snelle koolhydraten direct na de run.'
        }
      } else {
        return {
          carbsHour: '20g - 30g KH (Optioneel)',
          hydratatie: '500ml Water met elektrolyten',
          advies: 'Korte/Middelmatige duurloop: voeding vooraf innemen.',
          herstel: 'Normale herstelmaaltijd (Kip + Rijst / Kwark).'
        }
      }
    } else if (type === 'Zwemmen') {
      return {
        carbsHour: '30g KH vooraf',
        hydratatie: '1x Bidon Water aan de rand van het zwembad',
        advies: 'Kleine snelle koolhydraatsnack 20 min voor de duik.',
        herstel: 'Herstelmaaltijd binnen 45 min na de training.'
      }
    }

    return { carbsHour: '30g KH / uur', hydratatie: '500ml Water per uur', advies: 'Lichte snack bij lange sessies.' }
  }

  const fetchAllFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    if (data) setFeedbackList(data)
  }

  useEffect(() => {
    const today = new Date()
    const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
    const todayName = dayNames[today.getDay()]

    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')

    setCurrentActiveDay(todayName)
    setCoachDay(todayName)
    setCoachDate(`${yyyy}-${mm}-${dd}`)

    fetchAllFeedback()

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

  // Zet gekozen datum om naar de juiste dag van de week
  const handleDateChange = (dateStr) => {
    setCoachDate(dateStr)
    if (!dateStr) return

    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
      setCoachDay(dayNames[d.getDay()])
    }
  }

  const addIngredientToList = (item) => {
    const grams = parseInt(gramsInput, 10) || 100
    const factor = grams / 100

    const newItem = {
      id: Date.now(),
      name: item.name,
      grams: grams,
      kcal: Math.round(item.kcal * factor),
      carbs: Math.round(item.carbs * factor),
      protein: Math.round(item.protein * factor),
      fat: Math.round(item.fat * factor)
    }

    setSelectedIngredients(prev => [...prev, newItem])
    setSearchQuery('')
  }

  const removeIngredientFromList = (id) => {
    setSelectedIngredients(prev => prev.filter(item => item.id !== id))
  }

  const totalMacros = selectedIngredients.reduce((acc, curr) => ({
    kcal: acc.kcal + curr.kcal,
    carbs: acc.carbs + curr.carbs,
    protein: acc.protein + curr.protein,
    fat: acc.fat + curr.fat
  }), { kcal: 0, carbs: 0, protein: 0, fat: 0 })

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

  const saveCoachPlan = () => {
    if (!coachDuration) {
      alert('Vul a.u.b. de duur van de training in.')
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

    alert(`Training opgeslagen voor ${coachDay}!`)
    setCoachDuration('')
    setCoachRunPace('')
    setCoachNotes('')
  }

  const submitFeedback = async () => {
    const { error } = await supabase.from('feedback').insert([
      {
        day_name: currentActiveDay,
        rpe: rpeScore,
        comments: coachFeedback
      }
    ])

    if (error) {
      alert(`Fout bij versturen: ${error.message}`)
    } else {
      alert(`Feedback voor ${currentActiveDay} verstuurd!`)
      setCoachFeedback('')
      fetchAllFeedback()
    }
  }

  const addCustomMeal = () => {
    if (!newMealName) return alert('Vul a.u.b. een maaltijdnaam in.')
    if (selectedIngredients.length === 0) return alert('Voeg minstens 1 ingrediënt toe.')

    const newMeal = {
      id: Date.now(),
      name: newMealName,
      category: newMealCategory,
      composition: selectedIngredients.map(i => `${i.grams}g ${i.name}`).join(', '),
      kcal: totalMacros.kcal,
      carbs: totalMacros.carbs,
      protein: totalMacros.protein,
      fat: totalMacros.fat
    }

    setMealLibrary(prev => [...prev, newMeal])
    setNewMealName('')
    setSelectedIngredients([])
    alert('Gerecht toegevoegd aan bibliotheek!')
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
  const currentFuel = calculateFuelStrategy(currentInfo.type, currentInfo.duration)

  const filteredIngredients = INGREDIENT_DATABASE.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#166534', marginBottom: '12px' }}>📩 Ontvangen Feedback van Liesbeth ({feedbackList.length})</h3>
              {feedbackList.length === 0 ? (
                <p style={{ color: '#166534', fontSize: '0.85rem', margin: 0 }}>Nog geen feedback ontvangen van Liesbeth.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {feedbackList.map(item => (
                    <div key={item.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{item.day_name}</strong>
                        <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>RPE: {item.rpe}/10</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155' }}>"{item.comments || 'Geen opmerking ingevoerd.'}"</p>
                    </div>
                  ))}
                </div>
              )}
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
                    {WEEKDAYS.map(d => <option key={d}>{d}</option>)}
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
                {WEEKDAYS.map(d => <option key={d}>{d} ({weekDates[d]})</option>)}
              </select>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>🚴‍♀️ Training voor Liesbeth ({currentActiveDay} {weekDates[currentActiveDay]})</h3>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', color: currentInfo.type === 'Nog niet ingepland' ? '#94a3b8' : '#0f172a' }}>{currentInfo.type} {currentInfo.duration && `(${currentInfo.duration})`}</div>
              <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-line', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>{currentInfo.target || 'Nog geen trainingsdoelen ingepland.'}</div>
              
              {currentInfo.note && <div style={{ fontSize: '0.82rem', color: '#1e293b', background: '#eff6ff', padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '12px' }}>💬 <strong>Instructies van Kaat:</strong> "{currentInfo.note}"</div>}

              {currentInfo.type && currentInfo.type !== 'Nog niet ingepland' && currentInfo.type !== 'Rustdag' && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#065f46', fontSize: '0.9rem', marginBottom: '6px' }}>🍼 Brandstof- & Hydratatiestrategie tijdens de Training:</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#047857', display: 'grid', gap: '4px' }}>
                    <li>⚡ <strong>Koolhydraten:</strong> {currentFuel.carbsHour}</li>
                    <li>💧 <strong>Hydratatie:</strong> {currentFuel.hydratatie}</li>
                    <li>🍌 <strong>Inname Advies:</strong> {currentFuel.advies}</li>
                    {currentFuel.herstel && <li>🥛 <strong>Direct Na Training:</strong> {currentFuel.herstel}</li>}
                  </ul>
                </div>
              )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <button onClick={() => setWeekOffset(prev => prev - 1)} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>← Vorige Week</button>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Week van {weekDates['Maandag']} t/m {weekDates['Zondag']}</strong><br/>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {weekOffset < 0 ? `📜 Historie (${Math.abs(weekOffset)} week/weken geleden)` : weekOffset === 0 ? '📍 Huidige Trainingsweek' : `🔮 Toekomstige Planning (+${weekOffset} week/weken)`}
                </span>
              </div>
              <button onClick={() => setWeekOffset(prev => prev + 1)} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>Volgende Week →</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {WEEKDAYS.map(day => {
                const info = weekSchedule[day] || {}
                return (
                  <div key={day} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>{day}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>{weekDates[day]}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: info.type === 'Nog niet ingepland' ? '#94a3b8' : '#0f172a', marginBottom: '4px' }}>🏋️ {info.type} {info.duration && `(${info.duration})`}</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line', marginBottom: '8px' }}>{info.target || 'Geen blokken ingevoerd.'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB: MAALTIJDEN BEHEREN */}
        {activeTab === 'maaltijden' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>🥗 Slim Gerecht Samenstellen</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>NAAM VAN HET GERECHT</label>
                  <input type="text" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="bijv. MM Kip + Broccoli + Zoete Aardappel" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>CATEGORIE</label>
                  <select value={newMealCategory} onChange={(e) => setNewMealCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option>Ontbijt</option>
                    <option>Ochtendsnack</option>
                    <option>Lunch</option>
                    <option>Namiddagsnack</option>
                    <option>Diner</option>
                    <option>Late Night Snack</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#0369a1', marginBottom: '4px' }}>🔍 ZOEK INGREDIËNT (ALFABETISCH):</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Typ ingrediënt... (bijv. mm, broccoli, kip, kwark)"
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="number"
                    value={gramsInput}
                    onChange={(e) => setGramsInput(e.target.value)}
                    placeholder="Gram"
                    style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: '700' }}
                  />
                </div>

                {searchQuery.length > 0 && (
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {filteredIngredients.length === 0 ? (
                      <div style={{ padding: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>Geen resultaten gevonden voor "{searchQuery}"</div>
                    ) : (
                      filteredIngredients.map(item => (
                        <div
                          key={item.name}
                          onClick={() => addIngredientToList(item)}
                          style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <strong>{item.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+ Voeg {gramsInput}g toe</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedIngredients.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>TOEGEVOEGDE INGREDIËNTEN:</label>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {selectedIngredients.map(item => (
                      <div key={item.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span><strong>{item.grams}g</strong> {item.name} ({item.kcal} kcal | {item.carbs}g KH)</span>
                        <button onClick={() => removeIngredientFromList(item.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div><div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>KCAL</div><strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{totalMacros.kcal}</strong></div>
                <div><div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '700' }}>KH (G)</div><strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>{totalMacros.carbs}g</strong></div>
                <div><div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>EIWIT (G)</div><strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{totalMacros.protein}g</strong></div>
                <div><div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '700' }}>VET (G)</div><strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{totalMacros.fat}g</strong></div>
              </div>

              <button onClick={addCustomMeal} style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Opslaan in Bibliotheek</button>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>📖 Gerechten Bibliotheek ({mealLibrary.length})</h3>
              {mealLibrary.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Nog geen gerechten toegevoegd. Stel hierboven een maaltijd samen via de alfabetische zoekbank.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {mealLibrary.map(m => (
                    <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{m.name}</strong>
                          <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: '700' }}>{m.category}</span>
                        </div>
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
