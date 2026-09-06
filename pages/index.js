const calculateFuelStrategy = (type, durationStr) => {
    if (!type || type === 'Nog niet ingepland' || type === 'Rustdag') {
      return { carbsHour: '0g', hydratatie: 'Geen specifieke intra-workout voeding nodig.', advies: 'Normale voeding op schema aanhouden.' }
    }

    // Haal het getal uit de tekst (bijv. "50 km" -> 50, "3u" -> 3)
    const matches = (durationStr || '').match(/\d+(\.\d+)?/g)
    let numVal = matches ? parseFloat(matches[0]) : 1.0

    // Bepaal of het over kilometers (km) of uren (u/uur) gaat
    const isKm = durationStr?.toLowerCase().includes('km')

    if (type === 'Fietsen' || type === 'Koppeltraining') {
      const isLongBike = isKm ? numVal >= 75 : numVal >= 2.5
      if (isLongBike) {
        return {
          carbsHour: '75g - 90g KH / uur',
          hydratatie: '2x Bidon 750ml Iso-drink + Elektrolyten per 1.5u',
          advies: '1e uur: Bananen/Rijsttaartjes (vaste voeding). Vanaf 2e uur: 1x Gel om de 30-35 min.',
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
      const isUltraRun = isKm ? numVal >= 25 : numVal >= 2.5
      const isLongRun = isKm ? numVal >= 12 : numVal >= 1.2

      if (isUltraRun) {
        // Advies voor hele lange duurlopen (>25 km of >2.5u)
        const totalGels = Math.round((isKm ? numVal / 7 : numVal * 2)) // Schatting aantal gels
        return {
          carbsHour: '60g - 90g KH / uur',
          hydratatie: '500ml - 750ml Water/Iso met elektrolytentabletten per uur',
          advies: `Elke 20-25 min 1x Isotonische Gel (Totaal ca. ${totalGels} gels over de rit). Wissel af met een vaste snelle koolhydraatbron (bijv. rijsttaartje of banaan) om de maag rust te geven.`,
          herstel: 'Direct na afloop: Herstelshake (4:1 KH/Eiwit ratio) + 500ml vocht met zout, gevolgd door een koolhydraatrijke maaltijd binnen 2 uur.'
        }
      } else if (isLongRun) {
        return {
          carbsHour: '40g - 60g KH / uur',
          hydratatie: '500ml Water/Iso in softflask',
          advies: '1x Gel om de 30 tot 40 minuten (ca. om de 6-8 km) innemen met een slok water.',
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
