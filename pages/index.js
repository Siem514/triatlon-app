import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Uitgebreide alfabetische ingrediëntenlijst inclusief Muscle Meat (MM) producten
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

// Vaste Europese volgorde: Maandag = 0, Zondag = 6
const WEEKDAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']

// Helper om van JS Date (0=Zondag) naar Europese index (0=Maandag) te gaan
const getEuropeanDayIndex = (date) => {
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

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

  // Coach velden state
  const [coachDate, setCoachDate] = useState('')
  const [coachDay, setCoachDay] = useState('Zondag')
  const [coachTime, setCoachTime] = useState('08:30')
  const [coachType, setCoachType] = useState('Lopen')
  const [coachDuration, setCoachDuration] = useState('')
  const [coachRunPace, setCoachRunPace] = useState('')
  const [coachNotes, setCoachNotes] = useState('')

  // Feedback state & overzicht voor Kaat
  const [rpeScore, setRpeScore] = useState('5')
  const [coachFeedback, setCoachFeedback] = useState('')
  const [feedbackList, setFeedbackList] = useState([])

  // Recepten & Ingrediënten state
  const [newMealName, setNewMealName] = useState('')
  const [newMealCategory, setNewMealCategory] = useState('Ontbijt')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [gramsInput, setGramsInput] = useState('100')

  const [weekSchedule, setWeekSchedule] = useState({
    'Maandag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' },
    'Dinsdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' },
    'Woensdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' },
    'Donderdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' },
    'Vrijdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' },
    'Zaterdag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' },
    'Zondag': { type: 'Nog niet ingepland', startTime: '', duration: '', target: '', note: '', rpe: '', feedback: '' }
  })

  const [mealLibrary, setMealLibrary] = useState([])

  // Foutloze Europese datumberekening
  const getWeekDates = (offset) => {
    const now = new Date()
    const euroIndex = getEuropeanDayIndex(now)

    // Bepaal de maandag van de huidige gekozen week
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - euroIndex + (offset * 7))

    const result = {}
    WEEKDAYS.forEach((dayName, index) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)
      const dayStr = String(d.getDate()).padStart(2, '0')
      const monthStr = String(d.getMonth() + 1).padStart(2, '0')
      result[dayName] = `${dayStr}/${monthStr}/${d.getFullYear()}`
    })

    return result
  }

  const calculateFuelStrategy = (type, durationStr) => {
    if (!type || type === 'Nog niet ingepland' || type === 'Rustdag') {
      return { carbsHour: '0g', hydratatie: 'Geen specifieke intra-workout voeding nodig.', advies: 'Rijst/Eiwitmaaltijd op schema aanhouden.' }
    }

    let durNum = parseFloat(durationStr) || 1.0

    if (type === 'Fietsen' || type === 'Koppeltraining') {
      if (durNum >= 2.5) {
        return {
          carbsHour: '75g - 90g KH / uur',
          hydratatie: '2x Bidon 750ml Iso-drink + Elektrolyten per 1.5u',
          advies: '1e uur: Bananen/Rijsttaartjes (vaste voeding). Vanaf 2e uur: 1x 6d Sports Gel om de 35-40 min.',
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
          hydratatie: '500ml Water/Iso in softflask of bij posten',
          advies: '1x Isotonische Gel om de 6 tot 8 km innemen met een slok water.',
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
        advies: 'Kleine snelle koolhydraatsnack (banaan/peperkoek) 20 min voor de duik.',
        herstel: 'Herstelmaaltijd binnen 45 min na de training.'
      }
    }

    return { carbsHour: '30g KH / uur', hydratatie: '500ml Water per uur', advies: 'Lichte snack bij lange sessies.' }
  }

  const fetchAllFeedback = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending
