// Data derivation & helpers

export function buildYearTotals(rows) {
  const totals = {};
  rows.forEach((r) => {
    Object.entries(r).forEach(([year, val]) => {
      if (year === 'Person') return;
      if (typeof val === 'number') {
        totals[year] = (totals[year] || 0) + val;
      }
    });
  });
  return Object.entries(totals)
    .map(([year, total]) => ({ year, total }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export function combinePersonYear(giftsRows, guessRows, year, totalYearGifts) {
  const contributions = {};
  giftsRows.forEach((r) => {
    contributions[r.Person] = r[year] || 0;
  });
  const guessesByPerson = {};
  guessRows.forEach((r) => {
    const v = r[year];
    if (v === 0 || v === '0') return;
    guessesByPerson[r.Person] = v;
  });
  const people = Array.from(
    new Set([...Object.keys(contributions), ...Object.keys(guessesByPerson)]),
  ).filter((p) => p);
  const rows = people.map((p) => {
    const guessRaw = guessesByPerson[p];
    const guess = guessRaw === 0 || guessRaw === '0' ? null : guessRaw;
    if (guess == null || guess === '') {
      return {
        person: p,
        guess: null,
        contributed: contributions[p] || 0,
        total: totalYearGifts,
        over: null,
        diff: null,
      };
    }
    const over = guess > totalYearGifts;
    const diff = over ? guess - totalYearGifts : totalYearGifts - guess;
    return {
      person: p,
      guess,
      contributed: contributions[p] || 0,
      total: totalYearGifts,
      over,
      diff,
    };
  });
  rows.sort(compareGuessRows);
  return rows;
}

export function compareGuessRows(a, b) {
  const rankOver = (r) => (r.over === false ? 0 : r.over === true ? 1 : 2);
  const roA = rankOver(a);
  const roB = rankOver(b);
  if (roA !== roB) return roA - roB;
  if (roA === 2) return 0;
  if (a.diff !== b.diff) return a.diff - b.diff;
  return a.person.localeCompare(b.person);
}

export function deriveYearStats(personYear) {
  const withGuess = personYear.filter((p) => p.guess != null);
  if (!withGuess.length) return null;
  const worstDiff = Math.max(...withGuess.map((p) => p.diff));
  const worstPeople = withGuess.filter((p) => p.diff === worstDiff).map((p) => p.person);
  const guesses = withGuess.map((p) => p.guess).sort((a, b) => a - b);
  const avgGuess = guesses.reduce((a, b) => a + b, 0) / guesses.length;
  const medianGuess =
    guesses.length % 2
      ? guesses[(guesses.length - 1) / 2]
      : (guesses[guesses.length / 2 - 1] + guesses[guesses.length / 2]) / 2;
  const overCount = withGuess.filter((p) => p.over).length;
  const perfectCount = withGuess.filter((p) => !p.over && p.diff === 0).length;
  const meanAbsDiff = withGuess.reduce((a, b) => a + b.diff, 0) / withGuess.length;
  const range = `${guesses[0]} - ${guesses[guesses.length - 1]}`;
  return {
    worstDiff,
    worstPeople,
    avgGuess,
    medianGuess,
    overCount,
    perfectCount,
    meanAbsDiff,
    range,
    totalGuesses: withGuess.length,
  };
}

export function deriveWinnersByYear(gifts, guesses, giftsYearTotals) {
  if (!gifts || !guesses || !giftsYearTotals.length) return [];
  return giftsYearTotals
    .map(({ year, total }) => {
      const rows = combinePersonYear(gifts, guesses, year, total);
      const withGuesses = rows.filter((r) => r.guess != null);
      if (!withGuesses.length) return { year, winners: [] };
      const nonOver = withGuesses.filter((r) => !r.over);
      const candidatePool = nonOver.length ? nonOver : withGuesses;
      const best = Math.min(...candidatePool.map((r) => r.diff));
      const winners = candidatePool
        .filter((r) => r.diff === best)
        .map((r) => ({ person: r.person, diff: r.diff, over: r.over }));
      return { year, winners, best, allOver: !nonOver.length };
    })
    .filter((y) => y.winners.length);
}

export function deriveOverallWinCounts(winnersByYear) {
  const map = {};
  winnersByYear.forEach((y) =>
    y.winners.forEach((w) => {
      if (!map[w.person]) map[w.person] = { person: w.person, wins: 0, yearsExactMap: {} };
      map[w.person].wins += 1;
      const isExact = w.diff === 0 && !w.over;
      if (map[w.person].yearsExactMap[y.year] !== true) {
        map[w.person].yearsExactMap[y.year] = isExact;
      }
    }),
  );
  return Object.values(map)
    .map((entry) => {
      const yearsDetailed = Object.keys(entry.yearsExactMap)
        .sort()
        .map((yr) => ({ year: yr, exact: !!entry.yearsExactMap[yr] }));
      return { person: entry.person, wins: entry.wins, yearsDetailed };
    })
    .sort((a, b) => b.wins - a.wins || a.person.localeCompare(b.person));
}

export function deriveBestGuessers(guesses, giftsYearTotals) {
  if (!guesses || !giftsYearTotals.length) return [];
  const totalMap = Object.fromEntries(giftsYearTotals.map((g) => [g.year, g.total]));
  const stats = [];
  guesses.forEach((row) => {
    const person = row.Person;
    if (!person) return;
    const absErrors = [];
    const relScores = [];
    Object.entries(row).forEach(([yr, val]) => {
      if (yr === 'Person') return;
      if (val == null || val === '' || Number(val) === 0) return;
      const total = totalMap[yr];
      if (!total || total === 0) return;
      const guessVal = Number(val);
      if (isNaN(guessVal)) return;
      const absErr = Math.abs(guessVal - total);
      absErrors.push(absErr);
      const relErr = absErr / total;
      const score = Math.max(0, 1 - relErr);
      relScores.push(score);
    });
    if (!absErrors.length) return;
    absErrors.sort((a, b) => a - b);
    const yearsParticipated = absErrors.length;
    const avgAbs = absErrors.reduce((a, b) => a + b, 0) / yearsParticipated;
    const medianAbs =
      yearsParticipated % 2
        ? absErrors[(yearsParticipated - 1) / 2]
        : (absErrors[yearsParticipated / 2 - 1] + absErrors[yearsParticipated / 2]) / 2;
    const avgScore = relScores.reduce((a, b) => a + b, 0) / relScores.length;
    stats.push({
      person,
      yearsParticipated,
      avgAbsError: avgAbs,
      medianAbsError: medianAbs,
      avgScore,
    });
  });
  const eligible = stats.filter((s) => s.yearsParticipated >= 6);
  if (!eligible.length) return [];
  const maxYears = Math.max(...eligible.map((s) => s.yearsParticipated));
  const CAP_YEARS = 10;
  const denom = Math.min(maxYears, CAP_YEARS);
  const scored = eligible.map((s) => {
    const participationRatio = Math.min(s.yearsParticipated, CAP_YEARS) / denom;
    const finalIndex = s.avgScore * participationRatio * 100;
    return { ...s, baseAccuracyPct: s.avgScore * 100, index: Math.round(finalIndex * 10) / 10 };
  });
  return scored.sort(
    (a, b) =>
      b.index - a.index || a.avgAbsError - b.avgAbsError || a.person.localeCompare(b.person),
  );
}

export function deriveAllTimeMeta(winnersByYear, gifts, guesses, giftsYearTotals) {
  if (!winnersByYear.length || !gifts || !guesses || !giftsYearTotals.length)
    return {
      spotOnCounts: [],
      spotOnDetails: [],
      totalSpotOn: 0,
      backToBackSequences: [],
      worstGuesses: [],
      maxYearGiftTotal: 0,
      maxYearGiftYears: [],
      topGifterTotal: 0,
      topGifters: [],
      biggestGuessValue: 0,
      biggestGuesses: [],
      smallestGuessValue: 0,
      smallestGuesses: [],
      maxSingleYearContribution: 0,
      maxSingleYearContributors: [],
    };
  // Spot-on wins
  const spotOnMap = {};
  const spotOnYearsMap = {};
  winnersByYear.forEach((y) =>
    y.winners.forEach((w) => {
      if (w.diff === 0 && w.over === false) {
        spotOnMap[w.person] = (spotOnMap[w.person] || 0) + 1;
        if (!spotOnYearsMap[w.person]) spotOnYearsMap[w.person] = [];
        spotOnYearsMap[w.person].push(y.year);
      }
    }),
  );
  const spotOnCounts = Object.entries(spotOnMap)
    .map(([person, count]) => ({ person, count }))
    .sort((a, b) => b.count - a.count || a.person.localeCompare(b.person));
  const spotOnDetails = spotOnCounts.map((r) => ({
    person: r.person,
    count: r.count,
    years: (spotOnYearsMap[r.person] || []).sort((a, b) => a.localeCompare(b)),
  }));
  const totalSpotOn = spotOnCounts.reduce((a, b) => a + b.count, 0);
  // Back-to-back sequences
  const winsByPersonYears = {};
  winnersByYear
    .slice()
    .sort((a, b) => Number(a.year) - Number(b.year))
    .forEach((y) => {
      y.winners.forEach((w) => {
        if (!winsByPersonYears[w.person]) winsByPersonYears[w.person] = [];
        winsByPersonYears[w.person].push(Number(y.year));
      });
    });
  const backToBackSequences = [];
  Object.entries(winsByPersonYears).forEach(([person, years]) => {
    years.sort((a, b) => a - b);
    let seq = [years[0]];
    for (let i = 1; i < years.length; i++) {
      if (years[i] === years[i - 1] + 1) seq.push(years[i]);
      else {
        if (seq.length >= 2)
          backToBackSequences.push({ person, years: seq.slice(), length: seq.length });
        seq = [years[i]];
      }
    }
    if (seq.length >= 2)
      backToBackSequences.push({ person, years: seq.slice(), length: seq.length });
  });
  backToBackSequences.sort(
    (a, b) => b.length - a.length || a.person.localeCompare(b.person) || a.years[0] - b.years[0],
  );
  // Worst guesses
  let worstDiff = -1;
  const worstGuessesAll = [];
  giftsYearTotals.forEach(({ year, total }) => {
    const rows = combinePersonYear(gifts, guesses, year, total);
    rows.forEach((r) => {
      if (r.guess == null) return;
      if (r.diff > worstDiff) {
        worstDiff = r.diff;
        worstGuessesAll.length = 0;
        worstGuessesAll.push({
          person: r.person,
          year,
          guess: r.guess,
          total,
          diff: r.diff,
          over: r.over,
        });
      } else if (r.diff === worstDiff) {
        worstGuessesAll.push({
          person: r.person,
          year,
          guess: r.guess,
          total,
          diff: r.diff,
          over: r.over,
        });
      }
    });
  });
  worstGuessesAll.sort(
    (a, b) => a.person.localeCompare(b.person) || Number(a.year) - Number(b.year),
  );
  // Max gifts in a single year
  const maxYearGiftTotal = Math.max(...giftsYearTotals.map((g) => g.total || 0));
  const maxYearGiftYears = giftsYearTotals
    .filter((g) => g.total === maxYearGiftTotal)
    .map((g) => g.year)
    .sort();
  // Most gifts given by a single person (sum across years)
  const contributionTotals = {};
  gifts.forEach((row) => {
    const person = row.Person;
    if (!person) return;
    Object.entries(row).forEach(([yr, val]) => {
      if (yr === 'Person') return;
      const num = typeof val === 'number' ? val : Number(val) || 0;
      contributionTotals[person] = (contributionTotals[person] || 0) + num;
    });
  });
  const topGifterTotal = Object.keys(contributionTotals).length
    ? Math.max(...Object.values(contributionTotals))
    : 0;
  const topGifters = Object.entries(contributionTotals)
    .filter(([, total]) => total === topGifterTotal)
    .map(([p]) => p)
    .sort();
  // Biggest & smallest (non-zero) guesses ever
  let biggestGuessValue = 0;
  let smallestGuessValue = Infinity;
  const biggestGuesses = [];
  const smallestGuesses = [];
  guesses.forEach((row) => {
    const person = row.Person;
    Object.entries(row).forEach(([yr, val]) => {
      if (yr === 'Person') return;
      if (val == null || val === '' || Number(val) === 0) return; // ignore 0 as per logic
      const num = Number(val);
      if (isNaN(num)) return;
      if (num > biggestGuessValue) {
        biggestGuessValue = num;
        biggestGuesses.length = 0;
        biggestGuesses.push({ person, year: yr, guess: num });
      } else if (num === biggestGuessValue) {
        biggestGuesses.push({ person, year: yr, guess: num });
      }
      if (num < smallestGuessValue) {
        smallestGuessValue = num;
        smallestGuesses.length = 0;
        smallestGuesses.push({ person, year: yr, guess: num });
      } else if (num === smallestGuessValue) {
        smallestGuesses.push({ person, year: yr, guess: num });
      }
    });
  });
  if (smallestGuessValue === Infinity) {
    smallestGuessValue = 0;
  }
  biggestGuesses.sort((a, b) => a.person.localeCompare(b.person) || a.year.localeCompare(b.year));
  smallestGuesses.sort((a, b) => a.person.localeCompare(b.person) || a.year.localeCompare(b.year));
  // Single person max contribution in any year
  let maxSingleYearContribution = 0;
  const maxSingleYearContributors = [];
  gifts.forEach((row) => {
    const person = row.Person;
    if (!person) return;
    Object.entries(row).forEach(([yr, val]) => {
      if (yr === 'Person') return;
      const num = typeof val === 'number' ? val : Number(val) || 0;
      if (num > maxSingleYearContribution) {
        maxSingleYearContribution = num;
        maxSingleYearContributors.length = 0;
        maxSingleYearContributors.push({ person, year: yr, value: num });
      } else if (num === maxSingleYearContribution && num > 0) {
        maxSingleYearContributors.push({ person, year: yr, value: num });
      }
    });
  });
  maxSingleYearContributors.sort(
    (a, b) => a.person.localeCompare(b.person) || a.year.localeCompare(b.year),
  );
  return {
    spotOnCounts,
    spotOnDetails,
    totalSpotOn,
    backToBackSequences,
    worstGuesses: worstGuessesAll,
    maxYearGiftTotal,
    maxYearGiftYears,
    topGifterTotal,
    topGifters,
    biggestGuessValue,
    biggestGuesses,
    smallestGuessValue,
    smallestGuesses,
    maxSingleYearContribution,
    maxSingleYearContributors,
  };
}
