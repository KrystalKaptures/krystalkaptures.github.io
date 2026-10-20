(function () {
  "use strict";

  // Datamuse is the live source. This hand-picked set is only the offline
  // fallback, so the feature never turns into a blank space on a bad connection.
  const WORDS_BY_DAY = {
    0: [
      ["serene", "calm, peaceful, and untroubled"],
      ["sunlit", "filled or illuminated by sunlight"],
      ["soulful", "full of deep feeling and warmth"],
      ["soothing", "gently calming or comforting"],
      ["sublime", "so beautiful it inspires wonder"],
      ["softhearted", "kind, tender, and sympathetic"],
      ["still", "quiet, calm, and free from motion"],
      ["slow-blooming", "unfolding beautifully in its own time"],
      ["sun-dappled", "patterned with shifting spots of sunlight"],
      ["sheltering", "offering comfort, safety, or protection"],
      ["spacious", "open, roomy, and full of possibility"],
      ["starry", "bright with stars or dreamy wonder"],
      ["sweet-tempered", "naturally gentle and good-natured"],
      ["savoring", "taking time to fully enjoy the moment"]
    ],
    1: [
      ["magical", "delightfully extraordinary or enchanting"],
      ["mindful", "gently attentive to the present moment"],
      ["mellow", "pleasantly calm, warm, and easygoing"],
      ["moonlit", "illuminated by the light of the moon"],
      ["mirthful", "full of gladness, laughter, and cheer"],
      ["marvelous", "causing wonder, delight, or admiration"],
      ["meticulous", "showing thoughtful care for tiny details"],
      ["melodic", "pleasantly musical and tuneful"],
      ["mossy", "softly covered with green moss"],
      ["motivated", "eager and ready to make something happen"],
      ["mighty", "strong, capable, and impressive"],
      ["mischievous", "playfully fond of harmless trouble"],
      ["momentous", "important enough to shape what comes next"],
      ["many-splendored", "filled with varied beauty and delight"]
    ],
    2: [
      ["tranquil", "quiet, peaceful, and free from disturbance"],
      ["tenacious", "determined to keep going"],
      ["twinkling", "shining with quick, flickering light"],
      ["tender", "gentle, caring, and kind"],
      ["timeless", "beautiful or meaningful beyond any one era"],
      ["tactful", "considerate and skillful with other people's feelings"],
      ["tactile", "inviting or perceptible through touch"],
      ["terrific", "wonderfully good or impressive"],
      ["tousled", "charmingly rumpled or windswept"],
      ["trusty", "dependable and worthy of confidence"],
      ["tuneful", "full of pleasing melody"],
      ["tropical", "lush, warm, and vividly colorful"],
      ["transformative", "able to create meaningful change"],
      ["truehearted", "sincere, loyal, and genuine"]
    ],
    3: [
      ["whimsical", "playfully imaginative and delightfully unexpected"],
      ["warmhearted", "kind, affectionate, and generous"],
      ["wondrous", "inspiring delight, awe, or amazement"],
      ["wise", "showing sound judgment and deep understanding"],
      ["welcoming", "friendly and inviting to others"],
      ["wildflowered", "brightened by freely growing flowers"],
      ["wistful", "gently thoughtful with a touch of longing"],
      ["witty", "clever and playfully expressive"],
      ["windswept", "shaped, tousled, or refreshed by the wind"],
      ["wide-eyed", "full of wonder, curiosity, or surprise"],
      ["well-loved", "cherished deeply and often"],
      ["willing", "ready and happy to take part"],
      ["woodland", "reminiscent of trees, moss, and forest paths"],
      ["wonderstruck", "filled with sudden, delighted amazement"]
    ],
    4: [
      ["thankful", "glad and appreciative for what is good"],
      ["thoughtful", "showing care, attention, and consideration"],
      ["thriving", "growing strongly and doing wonderfully well"],
      ["thrilling", "causing a rush of excitement or delight"],
      ["thorough", "careful, complete, and attentive to detail"],
      ["theatrical", "dramatic, expressive, and made to be noticed"],
      ["therapeutic", "restorative to the mind, body, or spirit"],
      ["thistledown", "soft, light, and airy like drifting seeds"],
      ["thought-provoking", "sparking curiosity and deeper reflection"],
      ["thunderous", "powerful, booming, and impossible to ignore"],
      ["thirsty", "eagerly wanting more of something nourishing"],
      ["thorny", "beautifully difficult or full of complications"],
      ["thrill-seeking", "drawn to adventure and lively excitement"],
      ["three-dimensional", "rich with depth, shape, and substance"]
    ],
    5: [
      ["fabulous", "extraordinarily good, joyful, or stylish"],
      ["fearless", "bold and ready to meet a challenge"],
      ["flourishing", "growing beautifully and doing well"],
      ["fanciful", "guided by playful imagination"],
      ["festive", "full of celebration and cheerful energy"],
      ["free-spirited", "independent, spontaneous, and openhearted"],
      ["friendly", "warm, kind, and easy to be with"],
      ["fresh", "new, bright, and full of energy"],
      ["fiery", "glowing with passion, courage, or intensity"],
      ["featherlight", "delicately and almost weightlessly light"],
      ["fond", "filled with affection or warm regard"],
      ["frolicsome", "merry, playful, and full of fun"],
      ["far-reaching", "extending widely in influence or imagination"],
      ["full-hearted", "bringing complete enthusiasm and sincerity"]
    ],
    6: [
      ["sparkling", "shining brightly with tiny flashes of light"],
      ["spontaneous", "arising naturally in the happy moment"],
      ["sprightly", "lively, cheerful, and full of energy"],
      ["stellar", "exceptionally wonderful or star-like"],
      ["sensational", "remarkably exciting or impressive"],
      ["sassy", "bold, lively, and playfully confident"],
      ["sunny", "bright, cheerful, and optimistic"],
      ["snazzy", "stylish, lively, and eye-catching"],
      ["spirited", "full of courage, energy, and enthusiasm"],
      ["serendipitous", "happily discovered by delightful chance"],
      ["showstopping", "so impressive it captures every eye"],
      ["starlit", "softly illuminated by stars"],
      ["storyworthy", "memorable enough to be told again"],
      ["supercharged", "buzzing with extra energy and excitement"]
    ]
  };

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const DAY_PREFIXES = ["s", "m", "t", "w", "th", "f", "s"];
  const DATAMUSE_URL = "https://api.datamuse.com/words";
  const HISTORY_KEY = "krystal-daily-word-history-v1";
  const BLOCKED_WORDS = new Set([
    "false", "fatal", "feared", "feeble", "filthy", "flaky", "flimsy", "foolish", "frantic", "frightening", "frigid",
    "meaningless", "mediocre", "mindless", "miserable", "moody", "morbid", "mournful", "muddy", "mushy",
    "scared", "selfish", "severe", "shabby", "shady", "shallow", "shameless", "shocking", "sinful", "slice", "sloppy",
    "smug", "spiteful", "stale", "stern", "sticky", "stormy", "stubborn", "stuck", "suspicious",
    "tacky", "tantamount", "tapped", "tasteless", "taxing", "temperamental", "tempered", "tense", "tenured", "terrible", "terrifying",
    "taxable", "taxed", "technical", "timed", "tired", "tolerable", "tortured", "toward", "toxic", "treacherous",
    "toothed", "tormented", "tormenting", "tortuous", "totaled", "tottering", "touchy",
    "treated", "tried", "trifling", "trimmed", "trying", "tuned", "turned",
    "thick", "thinned", "third", "thoroughbred", "tight", "tipped", "topped", "total",
    "wrong", "worst", "wasted", "weak", "weary", "weird", "wicked", "worried", "worthless", "wretched"
  ]);

  function makeWord(choice, dayIndex, index, total, source) {
    return {
      word: choice[0],
      definition: choice[1],
      dayName: DAY_NAMES[dayIndex],
      index: index,
      total: total,
      source: source
    };
  }

  function chooseWithoutRecentRepeats(choices, dayIndex) {
    let history = {};
    try {
      history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}") || {};
    } catch (error) {
      history = {};
    }

    const recent = Array.isArray(history[dayIndex]) ? history[dayIndex] : [];
    const available = choices.filter(function (choice) {
      return recent.indexOf(choice[0]) === -1;
    });
    const pool = available.length ? available : choices;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const index = choices.indexOf(choice);

    history[dayIndex] = [choice[0]].concat(recent.filter(function (word) {
      return word !== choice[0];
    })).slice(0, 5);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      // Private browsing or a locked-down file preview may deny storage.
    }

    return { choice: choice, index: index };
  }

  function getFallbackWord(date) {
    const chosenDate = date || new Date();
    const dayIndex = chosenDate.getDay();
    const choices = WORDS_BY_DAY[dayIndex];
    const selected = chooseWithoutRecentRepeats(choices, dayIndex);
    return makeWord(selected.choice, dayIndex, selected.index, choices.length, "curated offline list");
  }

  function adjectiveDefinition(entry) {
    if (!Array.isArray(entry.defs)) return "";
    const definition = entry.defs.find(function (item) {
      return item.indexOf("adj\t") === 0;
    });
    return definition ? definition.slice(4).replace(/\s+/g, " ").trim() : "";
  }

  function frequency(entry) {
    if (!Array.isArray(entry.tags)) return 0;
    const tag = entry.tags.find(function (item) { return item.indexOf("f:") === 0; });
    return tag ? Number(tag.slice(2)) : 0;
  }

  function isRightDay(word, dayIndex) {
    const prefix = DAY_PREFIXES[dayIndex];
    if (dayIndex === 2) return word.indexOf("t") === 0 && word.indexOf("th") !== 0;
    return word.indexOf(prefix) === 0;
  }

  function loadDailyWord(date) {
    const chosenDate = date || new Date();
    const dayIndex = chosenDate.getDay();
    const commonParams = {
      ml: "good",
      sp: DAY_PREFIXES[dayIndex] + "*",
      md: "dpf",
      max: "1000"
    };
    const discoveryParams = {
      sp: DAY_PREFIXES[dayIndex] + "*",
      topics: "delight,kindness,wonder,nature,magic,joy",
      md: "dpf",
      max: "1000"
    };

    function fetchWords(params) {
      const query = new URLSearchParams(params);
      return fetch(DATAMUSE_URL + "?" + query.toString()).then(function (response) {
        if (!response.ok) throw new Error("Datamuse returned " + response.status);
        return response.json();
      });
    }

    return Promise.all([fetchWords(commonParams), fetchWords(discoveryParams)])
      .then(function (resultSets) {
        const seen = new Set();
        const entries = resultSets[0].concat(resultSets[1]).filter(function (entry) {
          if (!entry || seen.has(entry.word)) return false;
          seen.add(entry.word);
          return true;
        });

        return entries;
      })
      .then(function (entries) {
        const choices = entries
          .filter(function (entry) {
            return entry &&
              typeof entry.word === "string" &&
              entry.word.length <= 20 &&
              entry.word.length >= 5 &&
              /^[a-z][a-z-]*$/.test(entry.word) &&
              isRightDay(entry.word, dayIndex) &&
              Array.isArray(entry.tags) &&
              entry.tags[0] === "adj" &&
              frequency(entry) >= 0.25 &&
              adjectiveDefinition(entry).length > 0 &&
              adjectiveDefinition(entry).length <= 180;
          })
          .filter(function (entry) { return !BLOCKED_WORDS.has(entry.word); })
          .slice(0, 36)
          .map(function (entry) {
            return [entry.word, adjectiveDefinition(entry)];
          });

        if (choices.length === 0) throw new Error("No defined adjectives returned");
        const selected = chooseWithoutRecentRepeats(choices, dayIndex);
        return makeWord(selected.choice, dayIndex, selected.index, choices.length, "Datamuse");
      })
      .catch(function (error) {
        console.warn("Using the offline daily-word list:", error);
        return getFallbackWord(chosenDate);
      });
  }

  window.KRYSTAL_DAILY_WORDS = {
    loadDailyWord: loadDailyWord,
    getFallbackWord: getFallbackWord
  };
})();
