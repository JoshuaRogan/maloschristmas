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
