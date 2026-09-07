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
  const [currentActiveDay, setCurrentActiveDay] = useState('Maandag')
  const [todayFormattedDate, setTodayFormattedDate] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDates, setWeekDates] = useState({})

  // Coach waarden
  const [coachDate, setCoachDate] = useState('')
  const [coachDay, setCoachDay] = useState('Maandag')
  const [coachTime, setCoachTime] = useState('08:30')
  const [coachType, setCoachType] = useState('Lopen')
  const [coachDuration, setCoachDuration] = useState('')
  const [coachRunPace, setCoachRunPace] = useState('')
  const [coachNotes, setCoachNotes] = useState('')

  // Feedback & Meldingen Modals
  const [rpeScore, setRpeScore] = useState('5')
  const [coachFeedback, setCoachFeedback] = useState('')
  const [feedbackList, setFeedbackList] = useState([])
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  // Detailvenster Pop-up State
  const [selectedDayDetail, setSelectedDayDetail] = useState(null)

  // Gezondheidsmetingen
  const [weightInput, setWeightInput] = useState('')
  const [fatInput, setFatInput] = useState('')
  const [healthLogs, setHealthLogs] = useState([
    { date: '07/09/2026', weight: '62.5', fat: '18.2' }
  ])

  // Recepten
  const [newMealName, setNewMealName] = useState('')
  const [newMealCategory, setNewMealCategory] = useState('Ontbijt')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [gramsInput, setGramsInput] = useState('100')

  const [dbSchedules, setDbSchedules] = useState({})
  const [mealLibrary, setMealLibrary] = useState([])

  const computeClientWeekDates = (offset) => {
    const today = new Date()
    const jsDay = today.getDay()
    const distToMonday = jsDay === 0 ? -6 : 1 - jsDay

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

  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select('*')
    if (data) {
      const scheduleMap = {}
      data.forEach(item => {
        scheduleMap[item.date_str] = item
      })
      setDbSchedules(scheduleMap)
    }
  }

  useEffect(() => {
    setWeekDates(computeClientWeekDates(weekOffset))
  }, [weekOffset])

  const calculateWeeklyVolume = () => {
    let runHours = 0
    let bikeHours = 0
    let swimHours = 0
    let otherHours = 0

    WEEKDAYS.forEach(day => {
      const dateStr = weekDates[day]
      const schedule = dbSchedules[dateStr]
      if (schedule && schedule.duration) {
        const matches = schedule.duration.match(/\d+(\.\d+)?/g)
        let num = matches ? parseFloat(matches[0]) : 0
        const isKm = schedule.duration.toLowerCase().includes('km')

        if (schedule.type === 'Lopen') {
          runHours += isKm ? num / 10 : num
        } else if (schedule.type === 'Fietsen' || schedule.type === 'Koppeltraining') {
          bikeHours += isKm ? num / 28 : num
        } else if (schedule.type === 'Zwemmen') {
          swimHours += isKm ? num / 2.5 : num
        } else {
          otherHours += num
        }
      }
    })

    const total = runHours + bikeHours + swimHours + otherHours
    return {
      total: Math.round(total * 10) / 10,
      run: Math.round(runHours * 10) / 10,
      bike: Math.round(bikeHours * 10) / 10,
      swim: Math.round(swimHours * 10) / 10,
      other: Math.round(otherHours * 10) / 10
    }
  }

  const weeklyVolume = calculateWeeklyVolume()

  const calculateFuelStrategy = (type, durationStr) => {
    if (!type || type === 'Nog niet ingepland' || type === 'Rustdag') {
      return { 
        preWorkout: 'Gewoon dagelijks maaltijdschema aanhouden.',
        carbsHour: '0g', 
        hydratatie: 'Geen specifieke intra-workout voeding nodig.', 
        advies: 'Geen extra sportvoeding nodig.', 
        herstel: 'Balansmaaltijd met eiwitten en groenten.',
        gels: 0, isoServings: 0, cecemelLiters: 0 
      }
    }

    const matches = (durationStr || '').match(/\d+(\.\d+)?/g)
    let numVal = matches ? parseFloat(matches[0]) : 1.0
    const isKm = durationStr?.toLowerCase().includes('km')

    if (type === 'Fietsen' || type === 'Koppeltraining') {
      const isLongBike = isKm ? numVal >= 75 : numVal >= 2.5
      if (isLongBike) {
        const hours = isKm ? numVal / 28 : numVal
        const gelsNeeded = Math.ceil(hours * 2)
        return {
          preWorkout: '2 tot 3u vooraf: Grote koolhydraatrijke maaltijd (bijv. Havermout of MM Basmati rijst). 30 min vooraf: 1x Gel.',
          carbsHour: '75g - 90g KH / uur',
          hydratatie: '2x Bidon 750ml Iso-drink + Elektrolyten per 1.5u',
          advies: '1e uur: Bananen/Rijsttaartjes. Vanaf 2e uur: 1x Gel om de 30-35 min.',
          herstel: 'Direct na afloop: 500ml Mager Cecemel + Herstelshake.',
          gels: gelsNeeded,
          isoServings: Math.ceil(hours * 1.5),
          cecemelLiters: 0.5
        }
      } else {
        const hours = isKm ? numVal / 28 : numVal
        return {
          preWorkout: '1.5u vooraf: Licht verteerbaar ontbijt/lunch (Licht brood met jam/pindakaas).',
          carbsHour: '45g - 60g KH / uur',
          hydratatie: '1x Bidon 750ml Iso-drink met elektrolyten',
          advies: '1x Iso-gel of banaan na 45 minuten.',
          herstel: '300ml Mager Cecemel of eiwitrijke snack binnen 30 min.',
          gels: Math.ceil(hours),
          isoServings: 1,
          cecemelLiters: 0.3
        }
      }
    } else if (type === 'Lopen') {
      const isUltraRun = isKm ? numVal >= 25 : numVal >= 2.5
      const isLongRun = isKm ? numVal >= 12 : numVal >= 1.2

      if (isUltraRun) {
        const totalGels = Math.round((isKm ? numVal / 7 : numVal * 2.5))
        return {
          preWorkout: '3u vooraf: Vet- en vezelarme koolhydraatrijke maaltijd (MM Witte rijst met kip). 45 min vooraf: 500ml water.',
          carbsHour: '60g - 90g KH / uur',
          hydratatie: '500ml - 750ml Water/Iso met elektrolytentabletten per uur',
          advies: `Elke 20-25 min 1x Isotonische Gel (Totaal ca. ${totalGels} gels). Wissel af met banaan/rijsttaartje.`,
          herstel: 'Direct na afloop: Herstelshake + 500ml vocht. Warme rijst/pastamaaltijd binnen 2 uur.',
          gels: totalGels,
          isoServings: 2,
          cecemelLiters: 0.5
        }
      } else if (isLongRun) {
        const totalGels = Math.round((isKm ? numVal / 8 : numVal * 1.5))
        return {
          preWorkout: '1.5u tot 2u vooraf: Bananenpannenkoek of licht brood met honing.',
          carbsHour: '40g - 60g KH / uur',
          hydratatie: '500ml Water/Iso in softflask',
          advies: '1x Gel om de 30 tot 40 minuten met water.',
          herstel: '300ml Mager Cecemel / Herstelshake direct na afloop.',
          gels: Math.max(1, totalGels),
          isoServings: 1,
          cecemelLiters: 0.3
        }
      } else {
        return {
          preWorkout: '1u vooraf: 1 Banaan of peperkoek.',
          carbsHour: '20g - 30g KH (Optioneel)',
          hydratatie: '500ml Water met elektrolyten',
          advies: 'Korte duurloop: Geen gels nodig tijdens het lopen.',
          herstel: 'Normale eiwitrijke herstelmaaltijd (Mager kwark of MM Kip).',
          gels: 0,
          isoServings: 0,
          cecemelLiters: 0
        }
      }
    } else if (type === 'Zwemmen') {
      return {
        preWorkout: '45 min vooraf: Fast-carb snack (Banaan of 1x Gel).',
        carbsHour: '30g KH vooraf',
        hydratatie: '1x Bidon Water aan de rand van het zwembad',
        advies: 'Geen vaste voeding in het water.',
        herstel: 'Eiwitrijke herstelmaaltijd binnen 45 min.',
        gels: 0,
        isoServings: 0,
        cecemelLiters: 0
      }
    }

    return { 
      preWorkout: 'Lichte snack 1u voor de training.',
      carbsHour: '30g KH / uur', 
      hydratatie: '500ml Water per uur', 
      advies: 'Lichte snack bij lange sessies.', 
      herstel: 'Normale herstelmaaltijd.',
      gels: 0, isoServings: 0, cecemelLiters: 0 
    }
  }

  const calculateWeeklySportNutritionList = () => {
    let totalGels = 0
    let totalIsoServings = 0
    let totalCecemelLiters = 0

    WEEKDAYS.forEach(day => {
      const dateStr = weekDates[day]
      const schedule = dbSchedules[dateStr]
      if (schedule) {
        const fuel = calculateFuelStrategy(schedule.type, schedule.duration)
        totalGels += fuel.gels || 0
        totalIsoServings += fuel.isoServings || 0
        totalCecemelLiters += fuel.cecemelLiters || 0
      }
    })

    return {
      gels: totalGels,
      isoServings: totalIsoServings,
      cecemelLiters: Math.round(totalCecemelLiters * 10) / 10
    }
  }

  const weeklySportNutrition = calculateWeeklySportNutritionList()

  const fetchAllFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    if (data) {
      setFeedbackList(data)
      setUnreadFeedbackCount(data.length)
    }
  }

  const markFeedbackAsRead = () => {
    setUnreadFeedbackCount(0)
  }

  const deleteSchedule = async (dateStr) => {
    if (!window.confirm(`Weet je zeker dat je de training van ${dateStr} wilt verwijderen?`)) return

    const { error } = await supabase.from('schedules').delete().eq('date_str', dateStr)
    if (error) {
      alert(`Fout bij verwijderen: ${error.message}`)
    } else {
      alert(`Training van ${dateStr} succesvol verwijderd!`)
      fetchSchedules()
      if (selectedDayDetail && selectedDayDetail.dateStr === dateStr) {
        setSelectedDayDetail(null)
      }
    }
  }

  useEffect(() => {
    const now = new Date()
    const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
    const todayName = dayNames[now.getDay()]

    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.
