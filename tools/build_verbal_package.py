import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

LEVELS = (
    ["Starter"] * 3
    + ["Foundation"] * 5
    + ["Core"] * 15
    + ["Skilled"] * 10
    + ["Advanced"] * 7
)

DIFFICULTY_BY_LEVEL = {
    "Starter": "Easy",
    "Foundation": "Easy",
    "Core": "Medium",
    "Skilled": "Hard",
    "Advanced": "Hard",
}

EXAM_TAGS = ["Graduate verbal readiness", "Admissions aptitude", "Scholarship screening", "Corporate hiring"]
STATUS_CYCLE = ["New", "Attempted", "Bookmarked", "New", "Mastered", "New", "Attempted", "New"]


def read_json(path):
    with (ROOT / path).open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path, data):
    full_path = ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with full_path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def slug_title(slug):
    return " ".join(part.capitalize() for part in slug.split("-"))


def option_set(correct, distractors, index):
    letters = ["A", "B", "C", "D"]
    insert_at = index % 4
    values = list(distractors[:3])
    values.insert(insert_at, correct)
    return [{"id": letter, "text": text} for letter, text in zip(letters, values)], letters[insert_at]


def why_other_options(options, correct_letter, reason):
    return {
        option["id"]: f"{option['text']} is a trap because {reason}."
        for option in options
        if option["id"] != correct_letter
    }


def study(
    simple,
    why,
    strategy,
    prompt,
    answer,
    explanation,
    traps,
    tip,
    nodes,
):
    return {
        "simpleMeaning": simple,
        "whyItMatters": why,
        "strategy": strategy,
        "solvedExample": {
            "prompt": prompt,
            "answer": answer,
            "explanation": explanation,
        },
        "commonTraps": traps,
        "tip": tip,
        "visual": {
            "ariaLabel": "Verbal skill learning flow",
            "nodes": nodes,
        },
    }


VERBAL_TOPICS = [
    {
        "id": "vocabulary-reasoning",
        "name": "Vocabulary Reasoning",
        "description": "Use context, tone, and clue words to infer precise word meaning.",
        "level": "Core",
        "progress": 34,
        "keywords": ["context vocabulary", "word meaning", "connotation", "clue words"],
        "study": study(
            "Vocabulary reasoning means finding a word's meaning from its sentence, tone, and surrounding clues.",
            "Aptitude tests often use familiar-looking words in precise contexts. Strong learners do not guess from memory alone; they prove meaning from the sentence.",
            [
                "Locate the target word and decide whether the sentence gives a definition, contrast, example, or cause.",
                "Replace the word with a plain meaning and test whether the sentence still makes sense.",
                "Check tone: positive, negative, neutral, formal, or cautious.",
                "Reject choices that are related to the topic but do not fit the exact context.",
            ],
            "The manager gave a candid report, admitting both the success and the delays.",
            "Candid means honest and direct.",
            "The clue is admitting both success and delays. That points to openness, not politeness or speed.",
            [
                "Choosing a word that matches the subject but not the sentence logic.",
                "Ignoring contrast words such as however, although, yet, and despite.",
                "Choosing the strongest word when the sentence needs a moderate one.",
            ],
            "Before reading the options, say the meaning in your own simple words.",
            [
                {"label": "Context Clue", "text": "Signal words and sentence tone"},
                {"label": "Plain Meaning", "text": "Your own simple replacement"},
                {"label": "Best Option", "text": "Closest meaning in context"},
            ],
        ),
    },
    {
        "id": "synonyms",
        "name": "Synonyms",
        "description": "Choose the nearest meaning, not merely a related word.",
        "level": "Core",
        "progress": 31,
        "keywords": ["synonym", "nearest meaning", "word precision", "degree"],
        "study": study(
            "A synonym question asks for the closest meaning of a word in standard use.",
            "High-quality synonym practice builds precision. Many wrong answers are connected to the word, but only one matches meaning, tone, and degree.",
            [
                "State the word's basic meaning.",
                "Check whether the word is positive, negative, or neutral.",
                "Compare degree: mild, strong, temporary, permanent, formal, or emotional.",
                "Choose the nearest meaning, not the most dramatic answer.",
            ],
            "Select the nearest synonym of concise.",
            "Brief.",
            "Concise means giving much meaning in few words. Brief is nearest; vague and simple do not capture precision.",
            [
                "Choosing a word from the same topic area but different meaning.",
                "Missing connotation, such as praise versus criticism.",
                "Confusing strong and mild meanings.",
            ],
            "Ask: could this option replace the word in a careful sentence without changing meaning?",
            [
                {"label": "Word", "text": "Target meaning"},
                {"label": "Tone", "text": "Positive, negative, or neutral"},
                {"label": "Nearest Match", "text": "Meaning plus degree"},
            ],
        ),
    },
    {
        "id": "antonyms",
        "name": "Antonyms",
        "description": "Identify the most accurate opposite by meaning and degree.",
        "level": "Core",
        "progress": 29,
        "keywords": ["antonym", "opposite meaning", "contrast", "degree"],
        "study": study(
            "An antonym is the word that most nearly means the opposite of the target word.",
            "Antonym questions test whether you understand the direction and strength of meaning. The best opposite is precise, not merely different.",
            [
                "Define the target word in plain language.",
                "Name the opposite idea before checking choices.",
                "Check degree: the opposite of mild is not always extreme.",
                "Avoid unrelated words that only feel negative or positive.",
            ],
            "Select the antonym of reluctant.",
            "Eager.",
            "Reluctant means unwilling or hesitant. Eager gives the opposite attitude.",
            [
                "Choosing a word with the same negative tone instead of the opposite meaning.",
                "Choosing an unrelated word because it sounds unfamiliar.",
                "Missing the degree of the word.",
            ],
            "Convert the target word into a short phrase, then reverse that phrase.",
            [
                {"label": "Target", "text": "Meaning direction"},
                {"label": "Reverse", "text": "Opposite idea"},
                {"label": "Best Antonym", "text": "Accurate opposite degree"},
            ],
        ),
    },
    {
        "id": "analogies",
        "name": "Analogies",
        "description": "Match relationships between word pairs with careful logic.",
        "level": "Core",
        "progress": 27,
        "keywords": ["analogy", "relationship", "pair logic", "semantic relation"],
        "study": study(
            "An analogy asks you to identify the relationship between two words and apply the same relationship to another pair.",
            "Analogies build flexible reasoning. They reward learners who name the relationship, not learners who only notice topic similarity.",
            [
                "Write a precise bridge sentence for the first pair.",
                "Check the direction of the relationship.",
                "Match the relationship type, not just the subject area.",
                "Reject pairs with reversed, weaker, or merely associated relationships.",
            ],
            "Thermometer : temperature :: barometer : ?",
            "Pressure.",
            "A thermometer measures temperature; a barometer measures pressure. The relationship is instrument to what it measures.",
            [
                "Matching topic instead of relationship.",
                "Reversing the order of the pair.",
                "Choosing a related object rather than the function.",
            ],
            "Use a bridge sentence: X is to Y as A is to B.",
            [
                {"label": "First Pair", "text": "Name the relationship"},
                {"label": "Direction", "text": "Keep order consistent"},
                {"label": "Matching Pair", "text": "Same logic, new words"},
            ],
        ),
    },
    {
        "id": "word-relationships",
        "name": "Word Relationships",
        "description": "Recognize category, function, part-whole, cause-effect, and degree relationships.",
        "level": "Core",
        "progress": 26,
        "keywords": ["word relationship", "category", "part whole", "cause effect", "function"],
        "study": study(
            "Word relationships describe how two words are logically connected.",
            "This topic supports analogies, reading comprehension, and sentence logic because precise relationships reduce guessing.",
            [
                "Ask whether one word is a type, part, tool, result, quality, location, or opposite of the other.",
                "Turn the relationship into a short sentence.",
                "Check whether the relationship works in both directions or only one direction.",
                "Separate real meaning from loose association.",
            ],
            "What is the relationship between catalyst and reaction?",
            "A catalyst starts or speeds a reaction.",
            "The relationship is cause or agent to process. A catalyst is not a part of the reaction and not merely a synonym.",
            [
                "Calling every related pair a synonym.",
                "Confusing category relationships with function relationships.",
                "Ignoring direction, such as tool-to-task versus task-to-tool.",
            ],
            "If you can write a clear bridge sentence, the relationship is usually under control.",
            [
                {"label": "Two Words", "text": "Identify both roles"},
                {"label": "Bridge Sentence", "text": "X does Y, X is part of Y, or X causes Y"},
                {"label": "Relationship Type", "text": "Choose the exact relation"},
            ],
        ),
    },
    {
        "id": "sentence-completion",
        "name": "Sentence Completion",
        "description": "Use grammar, clue words, and logic to choose the best missing word or phrase.",
        "level": "Core",
        "progress": 33,
        "keywords": ["sentence completion", "clue words", "contrast", "cause effect", "blank"],
        "study": study(
            "Sentence completion means filling a blank with the word or phrase that best fits the sentence's logic.",
            "The blank is rarely solved by vocabulary alone. The sentence usually gives signals such as contrast, cause, concession, or continuation.",
            [
                "Read the full sentence before looking at options.",
                "Mark clue words such as although, because, therefore, yet, and similarly.",
                "Predict the blank in simple words.",
                "Choose the option that fits both meaning and grammar.",
            ],
            "Although the proposal sounded ambitious, the committee found it ____ because each step had a clear budget and timeline.",
            "practical.",
            "Although signals contrast. Ambitious could sound unrealistic, but clear budget and timeline make it practical.",
            [
                "Ignoring contrast signals.",
                "Choosing a word that fits one phrase but not the whole sentence.",
                "Missing whether the blank needs a positive or negative word.",
            ],
            "Cover the options and predict the blank first.",
            [
                {"label": "Signal Word", "text": "Contrast, cause, or continuation"},
                {"label": "Prediction", "text": "Plain-language blank"},
                {"label": "Option Check", "text": "Meaning plus grammar"},
            ],
        ),
    },
    {
        "id": "sentence-correction",
        "name": "Sentence Correction",
        "description": "Improve grammar, clarity, concision, and sentence structure.",
        "level": "Core",
        "progress": 30,
        "keywords": ["sentence correction", "grammar", "clarity", "parallelism", "modifier"],
        "study": study(
            "Sentence correction asks you to choose the clearest and most grammatically accurate version of a sentence.",
            "Good correction practice improves precision in writing and helps learners notice errors that affect meaning.",
            [
                "Identify the core subject and verb.",
                "Check agreement, tense, pronoun reference, modifiers, comparisons, and parallel structure.",
                "Prefer clear and concise wording over wordy phrasing.",
                "Do not change the intended meaning unless the original is illogical.",
            ],
            "Incorrect: Running late, the report was submitted by Amina.",
            "Running late, Amina submitted the report.",
            "The original modifier makes it sound as if the report was running late. The corrected sentence attaches the modifier to Amina.",
            [
                "Choosing a grammatically correct option that changes meaning.",
                "Missing misplaced modifiers.",
                "Keeping wordiness because it sounds formal.",
            ],
            "Find the sentence's actor first; many correction errors hide in who is doing the action.",
            [
                {"label": "Core Sentence", "text": "Subject plus verb"},
                {"label": "Error Check", "text": "Agreement, modifier, tense, reference"},
                {"label": "Best Version", "text": "Correct, clear, concise"},
            ],
        ),
    },
    {
        "id": "sentence-meaning-and-logic",
        "name": "Sentence Meaning and Logic",
        "description": "Track how ideas connect inside a sentence or short statement.",
        "level": "Core",
        "progress": 28,
        "keywords": ["sentence logic", "meaning", "inference", "contrast", "cause effect"],
        "study": study(
            "Sentence meaning and logic is the skill of understanding how ideas in a sentence connect.",
            "Many verbal errors come from reading words correctly but missing the relationship between ideas. This topic builds control over implication, contrast, cause, and qualification.",
            [
                "Identify the main claim of the sentence.",
                "Mark relationship signals such as because, however, therefore, unless, and whereas.",
                "Separate what is stated from what is implied.",
                "Choose the option that preserves the exact logic without adding a new claim.",
            ],
            "Although the data are limited, they are consistent across three independent surveys.",
            "The sentence cautiously supports the data while admitting a limitation.",
            "Although introduces a limitation; consistent across surveys provides support. The logic is balanced, not dismissive.",
            [
                "Treating cautious support as complete rejection.",
                "Ignoring qualifying words such as some, most, often, may, and likely.",
                "Adding information that the sentence does not state.",
            ],
            "Translate the sentence into a one-line logic map before choosing.",
            [
                {"label": "Main Claim", "text": "What is being said"},
                {"label": "Signal", "text": "How ideas connect"},
                {"label": "Exact Meaning", "text": "No extra claim added"},
            ],
        ),
    },
]


VOCABULARY_REASONING = [
    ("candid", "During the review, the supervisor was candid about the project's delays and successes.", "honest and direct", ["angry and impatient", "brief and incomplete", "formal and ceremonial"], "admitting both positive and negative details"),
    ("mitigate", "Planting trees along the road should mitigate the noise from traffic.", "make less severe", ["measure precisely", "create suddenly", "explain publicly"], "trees reduce the effect of noise"),
    ("tenuous", "The claim was rejected because its link to the evidence was tenuous.", "weak or uncertain", ["carefully proven", "deeply emotional", "widely admired"], "a claim rejected for weak support"),
    ("pragmatic", "Rather than choosing the most elegant design, the team chose a pragmatic one that could be built quickly.", "practical", ["decorative", "traditional", "expensive"], "built quickly points to usefulness"),
    ("ambivalent", "Maya was ambivalent about the promotion; it offered status but required constant travel.", "having mixed feelings", ["secretly proud", "clearly opposed", "carelessly informed"], "status is positive, travel is negative"),
    ("meticulous", "The editor was meticulous, checking every citation and comma before publication.", "extremely careful", ["unusually creative", "quick to decide", "openly critical"], "checking every small detail"),
    ("opaque", "The policy was written in such opaque language that even experienced staff asked for clarification.", "hard to understand", ["morally wrong", "financially costly", "easy to enforce"], "people asked for clarification"),
    ("succinct", "Her succinct summary covered the main evidence in two clear sentences.", "brief and clear", ["friendly and warm", "dramatic and loud", "uncertain and vague"], "two clear sentences"),
    ("resilient", "The small business proved resilient, reopening a week after the flood.", "able to recover", ["likely to expand", "hard to locate", "easy to replace"], "reopening after damage"),
    ("corroborate", "Two independent witnesses corroborated the driver's account of the accident.", "confirmed with supporting evidence", ["questioned aggressively", "ignored completely", "changed slightly"], "independent witnesses support the account"),
    ("inhibit", "Fear of criticism can inhibit students from asking useful questions.", "hold back", ["prepare", "reward", "simplify"], "fear prevents action"),
    ("anomalous", "The unusually high reading was treated as anomalous until the instrument could be checked.", "not typical", ["highly accurate", "easily predicted", "deeply useful"], "unusually high and needs checking"),
    ("lucid", "The professor's lucid explanation made a difficult theory easy to follow.", "clear", ["lengthy", "amusing", "strict"], "easy to follow"),
    ("prudent", "Keeping extra savings for emergencies is a prudent habit.", "wise and careful", ["bold and risky", "strictly required", "socially popular"], "emergencies require careful judgment"),
    ("volatile", "Because demand was volatile, the shop changed its inventory every week.", "changing unpredictably", ["steadily increasing", "carefully measured", "quietly hidden"], "inventory changes every week"),
    ("benign", "The doctor explained that the growth was benign and required only routine monitoring.", "not harmful", ["painful", "rare", "fast-growing"], "routine monitoring rather than urgent treatment"),
    ("austere", "The office was austere, with plain desks, white walls, and no decoration.", "simple and severe", ["bright and festive", "crowded and noisy", "old and broken"], "plain and undecorated"),
    ("fervent", "The candidate's fervent supporters knocked on doors even during heavy rain.", "deeply enthusiastic", ["quietly uncertain", "officially registered", "newly trained"], "supporters work despite rain"),
    ("skeptical", "The auditor remained skeptical until the company produced original receipts.", "doubtful", ["grateful", "careless", "silent"], "waiting for proof"),
    ("novel", "The committee welcomed the novel approach because no earlier plan had solved the problem.", "new and original", ["costly", "temporary", "familiar"], "no earlier plan had solved it"),
    ("impartial", "A fair contest requires judges who are impartial, not loyal to either side.", "unbiased", ["experienced", "strict", "popular"], "not loyal to either side"),
    ("concede", "After reviewing the data, the researcher had to concede that her first estimate was too low.", "admit reluctantly", ["calculate quickly", "repeat often", "hide carefully"], "had to admit after data"),
    ("plausible", "The explanation was plausible because it fit the facts, though it was not yet proven.", "reasonable or believable", ["certain", "simple", "popular"], "fits facts but not proven"),
    ("redundant", "The final paragraph was redundant because it repeated the same point made earlier.", "unnecessary because repeated", ["too technical", "emotionally strong", "grammatically incorrect"], "repeated same point"),
    ("discreet", "The counselor handled the matter discreetly, speaking to the student in private.", "carefully private", ["loudly", "slowly", "angrily"], "speaking in private"),
    ("deter", "Clear penalties may deter drivers from parking in emergency lanes.", "discourage", ["invite", "identify", "repair"], "penalties prevent behavior"),
    ("subtle", "The advertisement used subtle humor that some viewers noticed only after a second look.", "not obvious", ["unfair", "expensive", "careless"], "noticed only after a second look"),
    ("prolific", "The novelist was prolific, publishing three books and many essays in one year.", "producing a lot", ["widely disliked", "carefully trained", "newly famous"], "many works in one year"),
    ("scrutinize", "Before signing, Lina scrutinized every clause in the contract.", "examined closely", ["signed quickly", "summarized briefly", "copied neatly"], "every clause"),
    ("tentative", "The schedule is tentative and may change after the venue confirms availability.", "not final", ["late", "secret", "crowded"], "may change"),
    ("deplete", "A week of heavy use depleted the backup batteries.", "used up", ["protected", "tested", "delivered"], "heavy use reduces supply"),
    ("coherent", "The essay became coherent after the writer arranged the paragraphs in a logical order.", "logically connected", ["short", "emotional", "decorative"], "logical order"),
    ("sporadic", "Sporadic attendance made it difficult for the coach to build a stable team.", "irregular", ["excellent", "required", "public"], "attendance not stable"),
    ("viable", "The plan is viable only if the school can hire two trained instructors.", "workable", ["popular", "urgent", "generous"], "can work under a condition"),
    ("exemplary", "Her exemplary conduct made her a model for younger students.", "excellent and worthy of imitation", ["unusual but confusing", "strictly required", "quietly private"], "model for others"),
    ("obsolete", "The software became obsolete when newer systems could no longer read its files.", "outdated", ["illegal", "expensive", "unavailable"], "new systems no longer support it"),
    ("provisional", "The committee issued a provisional approval while it waited for safety documents.", "temporary until final confirmation", ["secret", "unpopular", "careless"], "while waiting for documents"),
    ("diligent", "A diligent researcher checks sources even when the first answer seems convincing.", "careful and hardworking", ["naturally talented", "openly doubtful", "quickly satisfied"], "checks sources"),
    ("frugal", "The frugal family repaired old furniture instead of buying new pieces.", "careful with money", ["wealthy", "generous", "fashionable"], "repairs instead of buying"),
    ("pervasive", "Mobile payment systems are now pervasive in many cities, appearing in buses, shops, and markets.", "widespread", ["profitable", "secure", "recent"], "appearing everywhere"),
]

SYNONYMS = [
    ("abate", "decrease", ["announce", "decorate", "divide"], "degree of reduction"),
    ("benevolent", "kind", ["wealthy", "careful", "ordinary"], "positive intention"),
    ("concise", "brief", ["vague", "polite", "complex"], "few words with clarity"),
    ("diligent", "hardworking", ["lucky", "famous", "curious"], "sustained effort"),
    ("elated", "joyful", ["tired", "confused", "careful"], "strong happiness"),
    ("feasible", "possible", ["familiar", "profitable", "urgent"], "can be done"),
    ("genuine", "authentic", ["generous", "modern", "careful"], "real not fake"),
    ("hostile", "unfriendly", ["hidden", "formal", "weak"], "negative attitude"),
    ("imminent", "about to happen", ["important", "distant", "unusual"], "near in time"),
    ("judicious", "wise", ["legal", "quick", "strict"], "good judgment"),
    ("kinship", "relationship", ["journey", "argument", "payment"], "connection"),
    ("lavish", "extravagant", ["simple", "angry", "doubtful"], "excessive richness"),
    ("meager", "small", ["bitter", "bright", "recent"], "insufficient amount"),
    ("notable", "remarkable", ["careful", "ordinary", "private"], "worthy of notice"),
    ("obscure", "unclear", ["ancient", "minor", "silent"], "hard to understand"),
    ("persistent", "continuing", ["careless", "popular", "formal"], "keeps going"),
    ("quell", "calm", ["praise", "delay", "repeat"], "reduce disturbance"),
    ("robust", "strong", ["distant", "secret", "polite"], "strength and health"),
    ("scarce", "limited", ["dirty", "fragile", "sharp"], "not enough"),
    ("tranquil", "peaceful", ["ordinary", "wealthy", "exact"], "calmness"),
    ("unanimous", "in complete agreement", ["partly hidden", "newly started", "strongly worded"], "all agree"),
    ("vigilant", "watchful", ["creative", "hopeful", "wealthy"], "alert attention"),
    ("wary", "cautious", ["angry", "generous", "rapid"], "careful because of risk"),
    ("yield", "give way", ["argue", "measure", "decorate"], "stop resisting"),
    ("zealous", "enthusiastic", ["factual", "ordinary", "silent"], "strong commitment"),
    ("astute", "shrewd", ["cheerful", "ancient", "grateful"], "sharp judgment"),
    ("bolster", "support", ["confuse", "reduce", "describe"], "make stronger"),
    ("censure", "criticize", ["celebrate", "borrow", "repair"], "formal disapproval"),
    ("defer", "postpone", ["explain", "approve", "discover"], "delay action"),
    ("erode", "wear away", ["grow", "copy", "store"], "gradual loss"),
    ("fortify", "strengthen", ["soften", "divide", "ignore"], "make stronger"),
    ("grievance", "complaint", ["reward", "habit", "journey"], "stated wrong"),
    ("hinder", "obstruct", ["invite", "clarify", "reward"], "block progress"),
    ("inquisitive", "curious", ["silent", "loyal", "wealthy"], "wants to know"),
    ("lenient", "merciful", ["strict", "careless", "distant"], "not harsh"),
    ("mundane", "ordinary", ["sacred", "furious", "complex"], "everyday"),
    ("nuance", "subtle difference", ["complete error", "public event", "written rule"], "fine distinction"),
    ("revere", "honor deeply", ["question briefly", "copy exactly", "delay calmly"], "deep respect"),
    ("stagnant", "not developing", ["beautiful", "generous", "fragile"], "lack of progress"),
    ("undermine", "weaken", ["announce", "protect", "measure"], "damage support"),
]

ANTONYMS = [
    ("abundant", "scarce", ["large", "varied", "useful"], "amount"),
    ("accept", "reject", ["receive", "notice", "explain"], "approval"),
    ("accurate", "incorrect", ["brief", "formal", "direct"], "truth"),
    ("advance", "retreat", ["improve", "deliver", "announce"], "movement"),
    ("artificial", "natural", ["careful", "public", "solid"], "origin"),
    ("bold", "timid", ["bright", "polite", "rapid"], "confidence"),
    ("chaotic", "orderly", ["costly", "narrow", "quiet"], "organization"),
    ("conceal", "reveal", ["protect", "store", "compare"], "visibility"),
    ("constant", "variable", ["minor", "simple", "empty"], "change"),
    ("constructive", "harmful", ["technical", "brief", "familiar"], "effect"),
    ("deficient", "sufficient", ["recent", "ordinary", "careful"], "adequacy"),
    ("expand", "shrink", ["open", "repeat", "collect"], "size"),
    ("fragile", "sturdy", ["silent", "modern", "polite"], "strength"),
    ("generous", "stingy", ["popular", "bright", "exact"], "giving"),
    ("gloomy", "cheerful", ["formal", "remote", "careful"], "mood"),
    ("gradual", "sudden", ["public", "useful", "legal"], "speed"),
    ("hostile", "friendly", ["careful", "young", "skilled"], "attitude"),
    ("include", "exclude", ["count", "describe", "borrow"], "membership"),
    ("inferior", "superior", ["nearby", "frequent", "minor"], "quality"),
    ("lavish", "plain", ["angry", "late", "sharp"], "richness"),
    ("literal", "figurative", ["formal", "accurate", "recent"], "meaning type"),
    ("major", "minor", ["public", "separate", "honest"], "importance"),
    ("naive", "worldly", ["new", "quiet", "patient"], "experience"),
    ("optimistic", "pessimistic", ["formal", "careful", "private"], "expectation"),
    ("permanent", "temporary", ["important", "visible", "clean"], "duration"),
    ("precise", "vague", ["brief", "strict", "serious"], "clarity"),
    ("public", "private", ["legal", "simple", "active"], "access"),
    ("rapid", "slow", ["weak", "rough", "ordinary"], "speed"),
    ("rigid", "flexible", ["strong", "bright", "careful"], "adaptability"),
    ("scarce", "plentiful", ["distant", "formal", "empty"], "amount"),
    ("shallow", "deep", ["wide", "clean", "quiet"], "depth"),
    ("stable", "unstable", ["known", "useful", "gentle"], "steadiness"),
    ("subtle", "obvious", ["rare", "polite", "complex"], "visibility"),
    ("transparent", "opaque", ["modern", "legal", "rapid"], "clarity"),
    ("trivial", "important", ["light", "recent", "familiar"], "significance"),
    ("unify", "divide", ["repeat", "measure", "repair"], "togetherness"),
    ("valid", "invalid", ["new", "strict", "formal"], "soundness"),
    ("volatile", "steady", ["large", "weak", "useful"], "change"),
    ("willing", "reluctant", ["calm", "public", "young"], "readiness"),
    ("zealous", "apathetic", ["careful", "silent", "ordinary"], "interest"),
]

ANALOGIES = [
    ("thermometer", "temperature", "barometer : pressure", ["compass : paper", "clock : metal", "ruler : classroom"], "instrument to what it measures"),
    ("author", "novel", "composer : symphony", ["doctor : illness", "judge : law", "teacher : lesson"], "creator to created work"),
    ("seed", "tree", "spark : fire", ["page : book", "map : road", "cloud : raincoat"], "small origin to developed result"),
    ("doctor", "patient", "lawyer : client", ["pilot : engine", "artist : paint", "chef : kitchen"], "professional to served person"),
    ("oasis", "desert", "island : ocean", ["bridge : river", "window : wall", "train : station"], "place of relief or land within larger surrounding area"),
    ("scribe", "write", "translator : interpret", ["painter : frame", "driver : road", "student : desk"], "person to primary action"),
    ("shield", "protect", "filter : remove", ["lamp : darkness", "book : shelf", "shoe : walking"], "object to function"),
    ("fragment", "whole", "chapter : book", ["garden : flower", "teacher : school", "ticket : travel"], "part to whole"),
    ("apology", "remorse", "smile : amusement", ["law : justice", "rain : cloud", "clock : time"], "expression to feeling"),
    ("map", "navigate", "recipe : cook", ["mirror : glass", "pencil : erase", "door : enter"], "guide to activity"),
    ("archive", "records", "museum : artifacts", ["market : prices", "library : silence", "school : exams"], "place where items are preserved"),
    ("debate", "argument", "concert : music", ["journey : luggage", "garden : soil", "storm : umbrella"], "event to main content"),
    ("cautious", "reckless", "generous : stingy", ["rapid : fast", "ancient : old", "bright : luminous"], "opposites"),
    ("editor", "manuscript", "mechanic : engine", ["judge : verdict", "farmer : harvest", "actor : stage"], "person who improves or fixes object"),
    ("forecast", "weather", "diagnosis : illness", ["contract : paper", "question : answer", "speech : audience"], "expert judgment about condition"),
    ("murmur", "sound", "glimmer : light", ["river : water", "flame : heat", "stone : weight"], "faint form of a thing"),
    ("exile", "country", "eviction : home", ["arrival : station", "lesson : class", "gift : party"], "forced removal from place"),
    ("transparent", "see", "audible : hear", ["fragile : hold", "distant : travel", "formal : write"], "quality that allows perception"),
    ("mentor", "guidance", "sponsor : support", ["critic : silence", "guest : invitation", "artist : gallery"], "person to help provided"),
    ("drought", "water", "famine : food", ["storm : wind", "winter : cold", "traffic : road"], "shortage of needed resource"),
    ("library", "books", "apiary : bees", ["harbor : ships", "orchard : tools", "kitchen : meals"], "place associated with collection or keeping"),
    ("microscope", "small", "telescope : distant", ["camera : loud", "knife : heavy", "mirror : hidden"], "instrument helps view hard-to-see quality"),
    ("rehearsal", "performance", "draft : essay", ["receipt : purchase", "poster : event", "ticket : seat"], "preparatory version to final product"),
    ("brittle", "break", "flammable : burn", ["silent : speak", "ancient : age", "damp : dry"], "quality indicating likely action"),
    ("committee", "members", "constellation : stars", ["river : banks", "forest : path", "window : glass"], "group made of parts"),
    ("remedy", "illness", "solution : problem", ["question : answer", "paint : canvas", "rule : game"], "thing that resolves condition"),
    ("archive", "preserve", "alarm : warn", ["blanket : fold", "basket : carry", "poster : decorate"], "object/system to purpose"),
    ("captain", "crew", "conductor : orchestra", ["author : reader", "doctor : nurse", "guest : host"], "leader to group led"),
    ("opaque", "clarity", "miserly : generosity", ["rapid : speed", "ancient : age", "narrow : width"], "lacking named quality"),
    ("scaffold", "building", "outline : essay", ["lamp : table", "river : bridge", "frame : picture"], "supporting structure for creation"),
    ("evidence", "claim", "foundation : building", ["door : hallway", "paint : wall", "shadow : light"], "supporting base"),
    ("harvest", "crop", "catch : fish", ["book : page", "storm : rain", "trial : verdict"], "result of gathering activity"),
    ("quarantine", "disease", "firewall : intrusion", ["umbrella : weather", "ladder : height", "window : view"], "barrier against threat"),
    ("index", "locate", "glossary : define", ["cover : decorate", "margin : write", "chapter : divide"], "reference tool to function"),
    ("auditor", "accounts", "proofreader : text", ["surgeon : patient", "driver : route", "pilot : airport"], "checker to material checked"),
    ("prototype", "product", "sketch : painting", ["ticket : journey", "recipe : meal", "shadow : object"], "early model to final version"),
    ("antidote", "poison", "counterargument : claim", ["medicine : doctor", "signal : road", "memory : event"], "thing that neutralizes"),
    ("chorus", "singers", "fleet : ships", ["market : buyers", "school : teachers", "book : chapters"], "organized group of similar members"),
    ("thermostat", "temperature", "governor : speed", ["compass : north", "camera : image", "ruler : length"], "device that regulates"),
    ("premise", "conclusion", "clue : inference", ["question : topic", "rule : game", "tone : voice"], "information leading to a result"),
]

WORD_RELATIONSHIPS = [
    ("scalpel", "surgeon", "tool user", "A scalpel is a tool used by a surgeon."),
    ("chapter", "book", "part whole", "A chapter is a part of a book."),
    ("orchard", "trees", "place collection", "An orchard is a place containing trees."),
    ("drought", "crop failure", "cause effect", "A drought can cause crop failure."),
    ("apprentice", "master", "learner teacher", "An apprentice learns from a master."),
    ("thermometer", "temperature", "instrument measurement", "A thermometer measures temperature."),
    ("synonym", "meaning", "same meaning", "A synonym has a similar meaning."),
    ("antidote", "poison", "remedy problem", "An antidote works against poison."),
    ("outline", "essay", "plan product", "An outline plans an essay."),
    ("budget", "spending", "control target", "A budget controls spending."),
    ("seed", "plant", "origin result", "A seed can grow into a plant."),
    ("archive", "records", "storage content", "An archive stores records."),
    ("mentor", "guidance", "provider service", "A mentor provides guidance."),
    ("verdict", "trial", "result process", "A verdict is the result of a trial."),
    ("insulator", "heat", "barrier force", "An insulator slows heat transfer."),
    ("index", "book", "reference location", "An index helps locate material in a book."),
    ("habitat", "species", "environment organism", "A habitat is an environment for a species."),
    ("catalyst", "reaction", "agent process", "A catalyst speeds a reaction."),
    ("symptom", "illness", "sign condition", "A symptom is a sign of illness."),
    ("passport", "travel", "document permission", "A passport permits or supports travel."),
    ("conductor", "orchestra", "leader group", "A conductor leads an orchestra."),
    ("harbor", "ships", "shelter object", "A harbor shelters ships."),
    ("predicate", "sentence", "grammatical part", "A predicate is a grammatical part of a sentence."),
    ("compass", "direction", "tool guidance", "A compass gives directional guidance."),
    ("receipt", "purchase", "record event", "A receipt records a purchase."),
    ("caption", "image", "label object", "A caption labels an image."),
    ("foundation", "building", "support structure", "A foundation supports a building."),
    ("antonym", "opposite", "word relation", "An antonym expresses opposite meaning."),
    ("filter", "impurities", "removal target", "A filter removes impurities."),
    ("lease", "property", "agreement object", "A lease is an agreement about property."),
    ("diagnosis", "illness", "identification condition", "A diagnosis identifies an illness."),
    ("rehearsal", "performance", "practice event", "A rehearsal prepares for a performance."),
    ("summary", "article", "condensed version", "A summary condenses an article."),
    ("ingredient", "recipe", "component plan", "An ingredient is a component named in a recipe."),
    ("alloy", "metals", "mixture materials", "An alloy is a mixture of metals."),
    ("camouflage", "visibility", "reduction quality", "Camouflage reduces visibility."),
    ("warranty", "product", "protection object", "A warranty protects a product buyer."),
    ("hypothesis", "experiment", "idea test", "A hypothesis is tested by an experiment."),
    ("currency", "exchange", "medium activity", "Currency is a medium of exchange."),
    ("boundary", "area", "limit space", "A boundary limits an area."),
]

SENTENCE_COMPLETION = [
    ("Although the policy seemed strict at first, its clear exceptions made it ____ in practice.", "flexible", ["careless", "hostile", "obsolete"], "although signals contrast"),
    ("The witness gave a ____ account, including details that matched the security footage.", "credible", ["fanciful", "vague", "hasty"], "matching evidence supports belief"),
    ("Because the instructions were ____, several teams completed the task in different ways.", "ambiguous", ["generous", "accurate", "brief"], "different interpretations point to unclear wording"),
    ("The committee rejected the plan not because it was bold, but because it was financially ____.", "unviable", ["popular", "modest", "transparent"], "financial reason blocks workability"),
    ("The speaker's tone was ____; she praised the idea while warning about its risks.", "measured", ["furious", "careless", "secretive"], "balanced praise and caution"),
    ("The new evidence did not prove the theory, but it made the theory more ____.", "plausible", ["decorative", "ancient", "private"], "not proven but more believable"),
    ("To avoid confusion, the manual replaced technical jargon with ____ language.", "plain", ["ornate", "hostile", "fragile"], "avoid confusion"),
    ("The delay was minor; therefore, canceling the entire event seemed ____.", "excessive", ["helpful", "routine", "patient"], "small cause, large response"),
    ("Rather than making a sudden decision, the board took a ____ approach and requested more data.", "cautious", ["reckless", "lavish", "bitter"], "requested more data"),
    ("The scientist welcomed criticism because it helped ____ the experiment's design.", "refine", ["conceal", "weaken", "imitate"], "criticism improves design"),
    ("The report was praised for being ____: it included only the facts needed to decide.", "concise", ["evasive", "redundant", "chaotic"], "only needed facts"),
    ("Despite the team's enthusiasm, the schedule remained ____ because the venue had not confirmed the date.", "tentative", ["permanent", "generous", "hostile"], "not confirmed"),
    ("The apology sounded ____ because it blamed the audience rather than accepting responsibility.", "insincere", ["careful", "brief", "formal"], "blame undermines apology"),
    ("The mayor's claim was difficult to accept because it rested on ____ evidence.", "scant", ["abundant", "official", "recent"], "difficult to accept due to little evidence"),
    ("The design was not flashy, but it was ____; users could complete tasks with few errors.", "effective", ["fragile", "decorative", "ambiguous"], "worked well"),
    ("The instructions were ____ enough for beginners, yet detailed enough for advanced users.", "accessible", ["secret", "hostile", "irrelevant"], "beginners can use them"),
    ("A single complaint should not ____ the value of a program that has helped hundreds.", "undermine", ["advertise", "measure", "repeat"], "one complaint should not weaken value"),
    ("The judge remained ____ until both sides had presented evidence.", "impartial", ["impatient", "famous", "silent"], "waited for both sides"),
    ("The medicine reduced the symptoms but did not ____ the underlying condition.", "cure", ["describe", "delay", "record"], "symptoms reduced but condition remains"),
    ("The passage begins with praise, then shifts to a ____ of the policy's hidden costs.", "critique", ["celebration", "summary", "prediction"], "shift from praise to costs"),
    ("Because the data came from only twelve people, the conclusion should be treated as ____.", "provisional", ["certain", "irrelevant", "hostile"], "small sample means temporary caution"),
    ("The teacher used a diagram to make the abstract idea more ____.", "concrete", ["remote", "expensive", "formal"], "diagram makes idea easier to grasp"),
    ("The plan was ____: every step depended on equipment the school did not own.", "impractical", ["lucid", "familiar", "generous"], "equipment unavailable"),
    ("The writer's argument was ____ because the conclusion did not follow from the evidence.", "flawed", ["popular", "brief", "vivid"], "logic problem"),
    ("The city chose buses over trains as a more ____ solution for narrow streets.", "practical", ["ornamental", "skeptical", "fragmented"], "fits real constraint"),
    ("The first draft was ____; ideas appeared in no clear order.", "disorganized", ["concise", "reliable", "neutral"], "no clear order"),
    ("The candidate's answer was ____; it avoided the question and repeated a slogan.", "evasive", ["precise", "candid", "balanced"], "avoided question"),
    ("The old rule became ____ after online registration replaced paper forms.", "obsolete", ["urgent", "strict", "useful"], "new system made old rule unnecessary"),
    ("The expert's warning was ____ by later test results that showed the same risk.", "corroborated", ["ignored", "weakened", "decorated"], "later results support warning"),
    ("The museum used soft lighting to ____ damage to the fragile documents.", "minimize", ["advertise", "imitate", "increase"], "protect fragile items"),
    ("The manager's feedback was ____: firm about the error but respectful toward the employee.", "constructive", ["vindictive", "random", "opaque"], "helps improve without attack"),
    ("The two proposals were not identical, but their goals were ____.", "compatible", ["hostile", "illegal", "temporary"], "can work together"),
    ("The writer added examples to make the claim less ____.", "abstract", ["accurate", "public", "cheerful"], "examples make it concrete"),
    ("The argument seems persuasive only if one accepts its ____ assumption about consumer behavior.", "implicit", ["decorative", "literal", "mechanical"], "hidden assumption"),
    ("The policy was intended to be fair, but in practice it produced ____ results for small schools.", "uneven", ["identical", "minor", "private"], "different impact across groups"),
    ("The poet's language is ____; a single image suggests several meanings.", "layered", ["literal", "careless", "temporary"], "multiple meanings"),
    ("The committee asked for an independent review to avoid even the appearance of ____.", "bias", ["clarity", "patience", "brevity"], "independent review prevents unfairness"),
    ("The explanation was technically accurate but too ____ for younger students.", "dense", ["friendly", "brief", "visible"], "hard because packed with information"),
    ("The new rule will ____ only if students understand why it exists.", "succeed", ["vanish", "divide", "confuse"], "understanding supports success"),
    ("The writer uses the final paragraph to ____ the earlier claim, not to introduce a new topic.", "reinforce", ["contradict", "abandon", "conceal"], "supports earlier claim"),
]

SENTENCE_CORRECTION = [
    ("Running to the bus, the backpack fell from Omar's shoulder.", "Running to the bus, Omar dropped the backpack from his shoulder.", ["Running to the bus, the backpack was dropped by Omar's shoulder.", "The backpack, running to the bus, fell from Omar's shoulder.", "Omar's shoulder dropped the backpack running to the bus."], "misplaced modifier"),
    ("Neither the teacher nor the students was ready for the early dismissal.", "Neither the teacher nor the students were ready for the early dismissal.", ["Neither the teacher nor the students is ready for the early dismissal.", "Neither the teacher nor the students has ready for the early dismissal.", "Neither the teacher or the students were ready for the early dismissal."], "nearer subject agreement"),
    ("The report is more clearer than the first draft.", "The report is clearer than the first draft.", ["The report is more clear than the first draft is more.", "The report is most clearer than the first draft.", "The report clear more than the first draft."], "double comparison"),
    ("Amina wanted to revise the essay, improving the evidence, and that the conclusion should be shorter.", "Amina wanted to revise the essay, improve the evidence, and shorten the conclusion.", ["Amina wanted revising the essay, improving evidence, and the conclusion shorter.", "Amina wanted to revise the essay, evidence improving, and conclusion to shorten.", "Amina wanted revision of the essay, improving evidence, and that the conclusion short."], "parallel structure"),
    ("The committee reviewed the proposal, it approved the budget.", "The committee reviewed the proposal and approved the budget.", ["The committee reviewed the proposal, approving, it the budget.", "The committee reviewed the proposal it approved the budget.", "The committee, reviewing the proposal, the budget approved."], "comma splice"),
    ("Because the road was flooded, so the school delayed opening.", "Because the road was flooded, the school delayed opening.", ["The road was flooded, because so the school delayed opening.", "Because the road was flooded so delayed the school opening.", "The school delayed opening, because so the road was flooded."], "double connector"),
    ("The data shows that attendance has improved.", "The data show that attendance has improved.", ["The data showing that attendance has improved.", "The data has shown that attendance have improved.", "The data shows attendance have improved."], "plural data agreement"),
    ("Each of the answers have a short explanation.", "Each of the answers has a short explanation.", ["Each of the answers having a short explanation.", "Each answers have a short explanation.", "Each of the answer have short explanations."], "singular each"),
    ("The new policy affects students differently than teachers.", "The new policy affects students differently from teachers.", ["The new policy effects students differently from teachers.", "The new policy affects students different from teachers.", "The new policy affecting students differently from teachers."], "word choice and idiom"),
    ("She is responsible to manage the records.", "She is responsible for managing the records.", ["She is responsible of managing the records.", "She is responsible manage the records.", "She is responsible at managing the records."], "correct preposition"),
    ("The reason the team lost was because it ignored the safety rules.", "The team lost because it ignored the safety rules.", ["The reason the team lost because it ignored safety rules.", "The team's loss was because of ignoring of safety rules.", "The reason why the team lost was due to because of safety rules."], "wordiness"),
    ("Less students attended the review session this week.", "Fewer students attended the review session this week.", ["Few students attended less review session this week.", "Lesser students attended the review session this week.", "Less student attended the review session this week."], "count noun"),
    ("The principal, along with two teachers, are visiting the classroom.", "The principal, along with two teachers, is visiting the classroom.", ["The principal, along with two teachers, were visiting the classroom.", "The principal along with two teachers are visit the classroom.", "The principal, along with two teachers, have visited the classroom."], "interrupting phrase agreement"),
    ("The instructions were written clearly, logically, and with detail.", "The instructions were written clearly, logically, and thoroughly.", ["The instructions were written clear, logical, and with detail.", "The instructions were written clearly, logic, and detail.", "The instructions were written clearly, logically, and detailed them."], "parallel adverbs"),
    ("After reviewing the file, the error was obvious to Sara.", "After reviewing the file, Sara found the error obvious.", ["After reviewing the file, the error found Sara obvious.", "The error after reviewing the file was obvious to Sara.", "After the file reviewed, Sara was obvious to the error."], "dangling modifier"),
    ("The book, which has many diagrams and it explains each step.", "The book has many diagrams and explains each step.", ["The book, which has many diagrams, and it explains each step.", "The book has many diagrams, it explains each step.", "The book having many diagrams and explains each step."], "fragment"),
    ("The solution was different to the one proposed yesterday.", "The solution was different from the one proposed yesterday.", ["The solution was different than to the one proposed yesterday.", "The solution was different as the one proposed yesterday.", "The solution was differently from the one proposed yesterday."], "idiom"),
    ("The teacher asked everyone to submit their notebook.", "The teacher asked all students to submit their notebooks.", ["The teacher asked everyone to submit their notebooks.", "The teacher asked all student to submit his notebooks.", "The teacher asked everyone submit their notebook."], "number clarity"),
    ("The lecture was interesting, informative, and it challenged assumptions.", "The lecture was interesting, informative, and challenging.", ["The lecture was interesting, informative, and it was challenge assumptions.", "The lecture was interesting, information, and challenging.", "The lecture interested, informed, and it challenged assumptions."], "parallel adjectives"),
    ("If the school had announced earlier, students will plan better.", "If the school had announced earlier, students would have planned better.", ["If the school announced earlier, students would had planned better.", "If the school has announced earlier, students will have planned better.", "If the school had announced earlier, students will have planned better."], "conditional tense"),
    ("The article compares online classes with traditional classrooms.", "The article compares online classes with traditional classes.", ["The article compares online classes with traditional classrooms.", "The article compares online classes to classrooms traditionally.", "The article compares online and traditional classrooms with classes."], "parallel comparison"),
    ("A number of students is waiting outside.", "A number of students are waiting outside.", ["A number of students was waiting outside.", "A number of student are waiting outside.", "A number students is waiting outside."], "quantity expression"),
    ("The evidence not only supports the claim but also it explains the cause.", "The evidence not only supports the claim but also explains the cause.", ["The evidence not only supports the claim but also explaining the cause.", "The evidence supports not only the claim but also it explains the cause.", "The evidence not supports only the claim but also explains the cause."], "not only but also parallelism"),
    ("The manager spoke to Farah and I about the schedule.", "The manager spoke to Farah and me about the schedule.", ["The manager spoke to Farah and myself about the schedule.", "The manager spoke to Farah and I about the schedule.", "The manager spoke with Farah and I to the schedule."], "object pronoun"),
    ("The rules are intended to both protect students and improving fairness.", "The rules are intended both to protect students and to improve fairness.", ["The rules are intended both protecting students and to improve fairness.", "The rules are intended to both protect students and improving fairness.", "The rules are both intended to protect students and improving fairness."], "parallel infinitives"),
    ("The experiment was repeated to verify that the results were not a coincidence.", "The experiment was repeated to verify that the results were not coincidental.", ["The experiment was repeated for verification of the results not being a coincidence.", "The experiment repeated to verify the results were not a coincidence.", "The experiment was repeating to verify that results not coincidence."], "concise wording"),
    ("The student who studied the notes carefully, she answered quickly.", "The student who studied the notes carefully answered quickly.", ["The student who studied the notes carefully, answered she quickly.", "The student studied the notes carefully, she answered quickly.", "The student who studied the notes, carefully she answered quickly."], "unnecessary pronoun"),
    ("The findings are based off surveys from three schools.", "The findings are based on surveys from three schools.", ["The findings are based of surveys from three schools.", "The findings are based by surveys from three schools.", "The findings are based surveys on three schools."], "standard idiom"),
    ("The principal said that every student should bring their own calculator.", "The principal said that all students should bring their own calculators.", ["The principal said that every student should bring their own calculator.", "The principal said every students should bring their calculator.", "The principal said that all students should brings their own calculators."], "pronoun and number clarity"),
    ("The essay is strong because of its evidence, organization, and it is concise.", "The essay is strong because of its evidence, organization, and concision.", ["The essay is strong because of evidence, organizing, and it is concise.", "The essay is strong because its evidence, organization, and it is concise.", "The essay is strong because of its evidence, organized, and concise."], "parallel nouns"),
    ("By improving the lighting, accidents in the hallway were reduced by the staff.", "By improving the lighting, the staff reduced accidents in the hallway.", ["By improving the lighting, accidents reduced the staff in the hallway.", "The hallway accidents, by improving lighting, were reduced by staff.", "By improving the lighting, reduced accidents were the staff."], "clear actor"),
    ("The committee's decision was final, however many members remained uneasy.", "The committee's decision was final; however, many members remained uneasy.", ["The committee's decision was final however many members remained uneasy.", "The committee's decision was final, however, and many members remained uneasy.", "The committee's decision final; however many members remaining uneasy."], "punctuating conjunctive adverb"),
    ("The graph indicates that sales rose faster in June than May.", "The graph indicates that sales rose faster in June than in May.", ["The graph indicates that sales rose faster in June than May did.", "The graph indicates sales rose faster in June then in May.", "The graph indicates that sales rose faster June than in May."], "complete comparison"),
    ("Having finished the assignment, the television was turned on by Bilal.", "Having finished the assignment, Bilal turned on the television.", ["Having finished the assignment, the television turned on by Bilal.", "The television, having finished the assignment, was turned on by Bilal.", "Having finished, the assignment turned on the television by Bilal."], "dangling modifier"),
    ("The revised paragraph is clearer, shorter, and it has more focus.", "The revised paragraph is clearer, shorter, and more focused.", ["The revised paragraph is clearer, shorter, and it has focus more.", "The revised paragraph is clear, shorter, and more focus.", "The revised paragraph is clearer, short, and focused more."], "parallel adjectives"),
    ("The survey asked students about their habits, preferences, and how often they study.", "The survey asked students about their habits, preferences, and study frequency.", ["The survey asked students about habits, preferences, and how often studying.", "The survey asked about students their habits, preferences, and how often they study.", "The survey asked students about their habits, prefer, and study frequency."], "parallel noun phrase"),
    ("The teacher explained the rule so that the class understands it yesterday.", "The teacher explained the rule yesterday so that the class would understand it.", ["The teacher explained the rule yesterday so that the class understands it.", "The teacher explains the rule yesterday so the class would understand it.", "The teacher explained yesterday the rule so that class understands it."], "sequence of tense"),
    ("The company reduced waste by recycling paper and to reuse packaging.", "The company reduced waste by recycling paper and reusing packaging.", ["The company reduced waste by recycling paper and to reuse packaging.", "The company reduced waste to recycle paper and reusing packaging.", "The company reduced waste by paper recycling and to reuse packaging."], "parallel gerunds"),
    ("Students should choose courses that are challenging, useful, and interest them.", "Students should choose courses that are challenging, useful, and interesting.", ["Students should choose courses challenging, useful, and interest them.", "Students should choose courses that challenge, useful, and interesting.", "Students should choose courses that are challenging, usefully, and interesting."], "parallel descriptors"),
    ("The report, along with its charts, explain the trend clearly.", "The report, along with its charts, explains the trend clearly.", ["The report, along with its charts, explaining the trend clearly.", "The report, along with its charts, explain the trend clearly.", "The report and its charts explains the trend clearly."], "subject verb agreement"),
]

SENTENCE_LOGIC = [
    ("Although the trial was small, its results were consistent with two earlier studies.", "The results offer cautious support, not final proof.", ["The trial disproved the earlier studies.", "The earlier studies were unrelated to the trial.", "The results are useless because the trial was small."], "concession plus support"),
    ("The plan is inexpensive, but it requires equipment the school does not own.", "Low cost alone does not make the plan practical.", ["The plan is too expensive for the school.", "The school already owns all required equipment.", "The plan has no advantage."], "contrast between cost and feasibility"),
    ("The product sold well after the price was reduced; however, advertising also increased that week.", "The price cut may not be the only cause of higher sales.", ["Advertising certainly caused all sales.", "The price reduction had no possible effect.", "Sales fell after advertising increased."], "alternate cause"),
    ("The rule applies to most applicants, except those with prior certification.", "Certified applicants may be treated differently.", ["All applicants must follow exactly the same process.", "Prior certification prevents application.", "The rule applies only to certified applicants."], "exception logic"),
    ("The article praises the program's goals while questioning its methods.", "The article is balanced: supportive of aims but critical of approach.", ["The article rejects the program completely.", "The article discusses only methods.", "The article gives no opinion."], "mixed evaluation"),
    ("The committee delayed the vote because several cost estimates were missing.", "The delay was caused by incomplete financial information.", ["The committee rejected the project.", "The vote was delayed because members disliked the idea.", "The cost estimates were unnecessary."], "cause signal"),
    ("Unless the data are verified, the conclusion should remain tentative.", "Verification is needed before treating the conclusion as firm.", ["The conclusion is already certain.", "The data have been verified.", "Tentative conclusions are always wrong."], "unless condition"),
    ("The speaker cites an expert, but she also provides direct evidence.", "The argument does not rely only on authority.", ["The speaker avoids evidence.", "The expert contradicts the evidence.", "The speaker rejects expert opinion."], "support type"),
    ("The school improved attendance after changing bus routes, though a new reward program began at the same time.", "The bus change may have helped, but another factor could also explain the improvement.", ["The bus routes cannot affect attendance.", "The reward program started after attendance fell.", "Attendance did not change."], "competing explanation"),
    ("The writer says the policy is simple to state but difficult to enforce.", "The policy's wording and practical application differ.", ["The policy is impossible to understand.", "The policy has already been enforced easily.", "The writer supports the policy without qualification."], "contrast between theory and practice"),
    ("Because the sample included only urban schools, the findings may not apply to rural schools.", "The limitation concerns whether the results generalize.", ["Urban schools were excluded.", "Rural schools produced the same results.", "The findings are mathematically impossible."], "scope limitation"),
    ("The new app saves time for experienced users, whereas beginners often need extra guidance.", "The app's benefit depends on user experience.", ["Beginners save the most time.", "Experienced users need more guidance.", "The app has no value."], "whereas contrast"),
    ("The author calls the evidence suggestive rather than conclusive.", "The evidence points in a direction but does not prove the claim.", ["The evidence proves the claim completely.", "The evidence is irrelevant.", "The author refuses to discuss evidence."], "degree of support"),
    ("The project failed not from lack of effort but from poor coordination.", "Effort was present; organization was the problem.", ["The team did not work hard.", "Coordination was excellent.", "The project succeeded despite effort."], "not X but Y structure"),
    ("The graph shows a rise in membership after the fee was lowered, but it does not show why people joined.", "The graph shows a pattern, not a confirmed cause.", ["The fee reduction definitely caused all new memberships.", "Membership declined after the fee changed.", "The graph explains every member's reason."], "correlation versus cause"),
    ("The writer grants that the rule is unpopular, yet argues that it prevents unfair exceptions.", "The writer sees a drawback but defends the rule's purpose.", ["The writer says popularity is the only issue.", "The writer opposes the rule because it is unfair.", "The writer ignores exceptions."], "concession and defense"),
    ("If the files were submitted on time, the delay must have occurred during review.", "On-time submission shifts attention to the review stage.", ["The files were submitted late.", "There was no delay.", "The review stage finished early."], "conditional inference"),
    ("The proposal reduces paper use, so it may lower printing costs as well.", "Lower paper use is presented as a possible reason for lower costs.", ["Printing costs must increase.", "The proposal has no environmental effect.", "Paper use and printing costs are unrelated in the sentence."], "cause-effect possibility"),
    ("The passage describes the method before evaluating the results.", "The order moves from procedure to judgment.", ["The passage evaluates results before explaining the method.", "The passage contains no evaluation.", "The method is rejected before being described."], "structure recognition"),
    ("The statement says the medicine relieved symptoms, not that it cured the disease.", "Symptom relief should not be confused with cure.", ["The disease was cured.", "The medicine had no effect.", "The symptoms became worse."], "distinction between effect and cure"),
    ("Although the budget increased, the number of completed projects fell.", "More money did not correspond to more completed projects.", ["The budget fell with completed projects.", "Completed projects increased because of money.", "The budget caused every project to succeed."], "unexpected contrast"),
    ("The author uses the example to illustrate the rule, not to prove that the rule has no exceptions.", "An example clarifies the rule without making it universal.", ["The example disproves the rule.", "The rule has no possible exceptions.", "The example is unrelated to the rule."], "example function"),
    ("The notice says applications received after Friday may be reviewed later.", "Late applications are not automatically rejected, but review may be delayed.", ["Late applications cannot be submitted.", "All applications are reviewed at the same time.", "Friday applications are always rejected."], "modal wording"),
    ("The team chose the slower method because it produced fewer errors.", "Accuracy was valued over speed.", ["The slower method produced more errors.", "The team cared only about speed.", "The faster method was unavailable."], "tradeoff logic"),
    ("The study found a link between sleep and memory, but it did not control for stress.", "Stress could be a confounding factor.", ["Stress was controlled carefully.", "Sleep has no possible link to memory.", "The study measured only stress."], "missing control"),
    ("The sentence says the change is likely, not guaranteed.", "The claim is probabilistic rather than certain.", ["The change cannot happen.", "The change is guaranteed.", "The sentence gives no prediction."], "qualification"),
    ("The teacher praised the answer's originality while noting that it needed stronger evidence.", "The answer had a strength and a weakness.", ["The teacher found nothing valuable in the answer.", "The answer needed no evidence.", "Originality was criticized."], "mixed feedback"),
    ("The city postponed construction until traffic studies were complete.", "The studies are a condition for moving forward.", ["Construction began before studies were complete.", "Traffic studies were canceled.", "The city permanently rejected construction."], "until condition"),
    ("The reviewer says the book is accessible to beginners without being simplistic.", "The book is easy to understand but not shallow.", ["The book is too simple to be useful.", "Only experts can understand the book.", "The reviewer criticizes its accessibility."], "positive qualification"),
    ("The policy treats equal scores equally; it does not guarantee equal outcomes.", "The policy concerns process, not final results.", ["The policy promises everyone the same result.", "Equal scores are treated differently.", "The policy ignores scores."], "process-result distinction"),
    ("The writer mentions the failed pilot program to caution against expanding too quickly.", "The example is used as a warning.", ["The failed pilot proves expansion is impossible.", "The writer wants immediate expansion.", "The pilot program succeeded fully."], "example as warning"),
    ("The phrase 'at least' means the actual number could be higher.", "The stated number is a minimum.", ["The stated number is a maximum.", "The actual number must be lower.", "The phrase gives an exact total."], "quantifier meaning"),
    ("The manager accepted the recommendation only after the risks were reduced.", "Risk reduction was necessary for acceptance.", ["The manager accepted before risks changed.", "The recommendation had no risks.", "Risk reduction caused rejection."], "sequence and condition"),
    ("The passage contrasts short-term savings with long-term costs.", "An option may look cheap now but expensive later.", ["Short-term and long-term costs are identical.", "The passage discusses only savings.", "Long-term costs are lower because of savings."], "time contrast"),
    ("The claim depends on the survey representing the whole student body.", "If the survey is not representative, the claim weakens.", ["The survey must include only top students.", "Representation is irrelevant to survey claims.", "The whole student body answered the survey."], "representativeness"),
    ("The sentence says the rule is rarely enforced, not that it has been removed.", "A rule can exist even if enforcement is uncommon.", ["The rule no longer exists.", "The rule is enforced every day.", "The sentence says enforcement is impossible."], "existence versus enforcement"),
    ("The author says the evidence is consistent with the claim, but also consistent with another explanation.", "The evidence does not uniquely prove the claim.", ["The evidence contradicts every explanation.", "Only the author's claim fits the evidence.", "No explanation fits the evidence."], "multiple explanations"),
    ("The phrase 'despite the cost' signals that cost is a drawback, not the reason for support.", "Support is given even though cost is a disadvantage.", ["Cost is the main reason for support.", "There is no cost issue.", "The speaker opposes the plan only because of cost."], "despite signal"),
    ("The data show improvement among participants who completed the course, but not among those who left early.", "Completion may be important to the improvement.", ["Leaving early caused greater improvement.", "All participants improved equally.", "Course completion was unrelated in the sentence."], "comparison group"),
    ("The statement says the plan is necessary, not sufficient.", "The plan is required but may not solve the problem alone.", ["The plan alone guarantees success.", "The plan is unnecessary.", "The plan prevents every solution."], "necessary versus sufficient"),
]


def make_vocab_question(entry, index):
    word, sentence, correct, distractors, clue = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "vocabulary-reasoning",
        index,
        "Vocabulary Reasoning",
        f"In the sentence, what is the closest meaning of \"{word}\"?\n\n{sentence}",
        options,
        correct_letter,
        f"Here, {word} means {correct}.",
        [
            ("Find the clue", f"The key clue is {clue}."),
            ("Predict the meaning", f"Before reading options, replace {word} with a simple phrase."),
            ("Choose the closest fit", f"{correct} keeps the sentence's logic and tone intact."),
        ],
        f"{correct} is the best meaning of {word} in this context.",
        why_other_options(options, correct_letter, "it does not fit the sentence clue or tone"),
        "Choosing a related idea instead of the meaning required by the sentence.",
        "Contextual word meaning",
        "Learner infers precise meaning from sentence clues.",
        "Related but not contextually correct",
        [word, correct, clue, "context clue"],
    )


def make_synonym_question(entry, index):
    word, correct, distractors, nuance = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "synonyms",
        index,
        "Synonyms",
        f"Choose the nearest synonym of \"{word}\" in careful academic use.",
        options,
        correct_letter,
        f"The nearest synonym of {word} is {correct}.",
        [
            ("Define the target", f"{word} is best understood through {nuance}."),
            ("Check tone and degree", "The correct answer must match meaning and strength, not just topic."),
            ("Test replacement", f"{correct} can replace {word} with the least change in meaning."),
        ],
        f"{correct} matches the central meaning of {word}.",
        why_other_options(options, correct_letter, "it is either related, opposite, or different in degree"),
        "Choosing a word that feels connected but is not the nearest meaning.",
        "Nearest-meaning synonym",
        "Learner selects the closest synonym while preserving tone and degree.",
        "Related but not nearest meaning",
        [word, correct, nuance, "synonym"],
    )


def make_antonym_question(entry, index):
    word, correct, distractors, dimension = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "antonyms",
        index,
        "Antonyms",
        f"Choose the most accurate antonym of \"{word}\".",
        options,
        correct_letter,
        f"The best antonym of {word} is {correct}.",
        [
            ("Define the word", f"{word} is being tested on the dimension of {dimension}."),
            ("Reverse the meaning", f"The opposite direction points to {correct}."),
            ("Avoid unrelated contrast", "The wrong options may differ from the word without being true opposites."),
        ],
        f"{correct} reverses the meaning of {word} most directly.",
        why_other_options(options, correct_letter, "it does not reverse the target meaning on the tested dimension"),
        "Choosing a different-sounding word instead of a true opposite.",
        "Precise opposite meaning",
        "Learner identifies the exact opposite by meaning and degree.",
        "Different but not opposite",
        [word, correct, dimension, "antonym"],
    )


def make_analogy_question(entry, index):
    left, right, correct, distractors, relationship = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "analogies",
        index,
        "Analogies",
        f"Which pair shows the same relationship as {left} : {right}?",
        options,
        correct_letter,
        f"The relationship is {relationship}.",
        [
            ("Name the bridge", f"{left} : {right} shows {relationship}."),
            ("Keep direction", "The order of the pair must stay consistent."),
            ("Match relationship", f"{correct} repeats the same relationship, not just a similar topic."),
        ],
        f"{correct} is correct because it preserves the relationship: {relationship}.",
        why_other_options(options, correct_letter, "it changes the relationship type or reverses the direction"),
        "Matching topic similarity instead of the exact relationship.",
        "Analogy relationship matching",
        "Learner names and transfers a word-pair relationship.",
        "Topic association trap",
        [left, right, correct, relationship, "analogy"],
    )


def make_relationship_question(entry, index):
    left, right, correct, explanation = entry
    distractors = ["synonym relationship", "opposite relationship", "unrelated association", "part whole relationship", "cause effect relationship"]
    distractors = [item for item in distractors if item != correct][:3]
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "word-relationships",
        index,
        "Word Relationships",
        f"What relationship best describes \"{left}\" and \"{right}\"?",
        options,
        correct_letter,
        explanation,
        [
            ("Identify both roles", f"Ask what role {left} plays in relation to {right}."),
            ("Write a bridge sentence", explanation),
            ("Classify the relation", f"The best label is {correct}."),
        ],
        explanation,
        why_other_options(options, correct_letter, "it labels a different kind of relationship"),
        "Calling two related words synonyms when the relationship is more specific.",
        "Word relationship classification",
        "Learner classifies semantic relationships accurately.",
        "Loose association trap",
        [left, right, correct, "word relationship"],
    )


def make_completion_question(entry, index):
    sentence, correct, distractors, clue = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "sentence-completion",
        index,
        "Sentence Completion",
        f"Choose the word or phrase that best completes the sentence.\n\n{sentence}",
        options,
        correct_letter,
        f"The clue points to {correct}.",
        [
            ("Read the signal", f"The sentence clue is {clue}."),
            ("Predict the blank", f"The blank needs a word close to {correct}."),
            ("Check grammar and logic", f"{correct} fits both the sentence structure and meaning."),
        ],
        f"{correct} completes the sentence because it follows the clue: {clue}.",
        why_other_options(options, correct_letter, "it conflicts with the clue or sentence logic"),
        "Choosing a word that fits one nearby phrase but not the full sentence.",
        "Sentence clue recognition",
        "Learner uses signal words and context to complete a sentence.",
        "Local fit but global logic error",
        [correct, clue, "sentence completion", "clue word"],
    )


def make_correction_question(entry, index):
    flawed, correct, distractors, issue = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "sentence-correction",
        index,
        "Sentence Correction",
        f"Choose the best corrected version of the sentence.\n\n{flawed}",
        options,
        correct_letter,
        f"The best correction fixes {issue}.",
        [
            ("Find the error", f"The original sentence has a problem with {issue}."),
            ("Protect the meaning", "The correction should fix the error without changing the intended idea."),
            ("Prefer clarity", f"The correct option is clear, grammatical, and concise: {correct}"),
        ],
        f"{correct} is best because it corrects {issue} while preserving meaning.",
        why_other_options(options, correct_letter, "it keeps the original error, creates a new error, or changes the meaning"),
        "Choosing a formal-sounding option that still contains the sentence error.",
        "Grammar and clarity correction",
        "Learner identifies and fixes a specific sentence error.",
        f"{issue} trap",
        [issue, "sentence correction", "grammar", "clarity"],
    )


def make_logic_question(entry, index):
    prompt, correct, distractors, relation = entry
    options, correct_letter = option_set(correct, distractors, index)
    return base_question(
        "sentence-meaning-and-logic",
        index,
        "Sentence Meaning and Logic",
        f"Which option best captures the logic of the sentence?\n\n{prompt}",
        options,
        correct_letter,
        f"The sentence uses {relation}.",
        [
            ("Find the main idea", "State what the sentence actually claims."),
            ("Name the relation", f"The key relationship is {relation}."),
            ("Avoid adding claims", "The correct option preserves the logic without exaggeration."),
        ],
        f"{correct} best preserves the sentence logic.",
        why_other_options(options, correct_letter, "it exaggerates, reverses, or adds to the original logic"),
        "Reading a qualified sentence as if it made an absolute claim.",
        "Sentence logic mapping",
        "Learner preserves exact meaning and relationship between ideas.",
        "Overstatement or reversal",
        [relation, "sentence logic", "meaning", "inference"],
    )


def base_question(
    topic_id,
    index,
    question_type,
    question_text,
    options,
    correct_letter,
    short_explanation,
    steps,
    correct_explanation,
    other_explanations,
    common_mistake,
    skill_focus,
    learning_outcome,
    trap_type,
    keywords,
):
    level = LEVELS[index]
    return {
        "id": f"vs-{topic_id}-{index + 1:03d}",
        "skillCategory": "verbal-skills",
        "skill": "core-verbal-reasoning",
        "topic": topic_id,
        "subTopic": topic_id,
        "level": level,
        "difficulty": DIFFICULTY_BY_LEVEL[level],
        "questionType": question_type,
        "questionText": question_text,
        "options": options,
        "correctAnswer": correct_letter,
        "shortExplanation": short_explanation,
        "fullExplanation": {
            "steps": [{"title": title, "text": text} for title, text in steps],
            "correctAnswer": correct_explanation,
            "whyOtherOptionsAreWrong": other_explanations,
        },
        "commonMistake": common_mistake,
        "similarQuestionIds": [],
        "learnMoreUrl": f"skills/verbal-skills/{topic_id}/",
        "examTags": EXAM_TAGS,
        "status": STATUS_CYCLE[index % len(STATUS_CYCLE)],
        "keywords": list(dict.fromkeys([*keywords, "verbal skills", topic_id.replace("-", " ")])),
        "skillFocus": skill_focus,
        "learningOutcome": learning_outcome,
        "trapType": trap_type,
    }


def build_questions():
    factories = {
        "vocabulary-reasoning": (VOCABULARY_REASONING, make_vocab_question),
        "synonyms": (SYNONYMS, make_synonym_question),
        "antonyms": (ANTONYMS, make_antonym_question),
        "analogies": (ANALOGIES, make_analogy_question),
        "word-relationships": (WORD_RELATIONSHIPS, make_relationship_question),
        "sentence-completion": (SENTENCE_COMPLETION, make_completion_question),
        "sentence-correction": (SENTENCE_CORRECTION, make_correction_question),
        "sentence-meaning-and-logic": (SENTENCE_LOGIC, make_logic_question),
    }
    questions = []
    for topic in VERBAL_TOPICS:
        entries, factory = factories[topic["id"]]
        if len(entries) != 40:
            raise ValueError(f"{topic['id']} has {len(entries)} entries, expected 40")
        topic_questions = [factory(entry, index) for index, entry in enumerate(entries)]
        ids = [question["id"] for question in topic_questions]
        for index, question in enumerate(topic_questions):
            question["similarQuestionIds"] = [
                ids[(index + 1) % len(ids)],
                ids[(index + 2) % len(ids)],
                ids[(index + 5) % len(ids)],
            ]
        questions.extend(topic_questions)
    return questions


def update_skills():
    data = read_json("data/skills.json")
    for category in data["categories"]:
        if category["id"] == "verbal-skills":
            category.update(
                {
                    "description": "Build vocabulary precision, word relationships, sentence logic, grammar accuracy, and verbal reasoning under exam-style pressure.",
                    "level": "Core",
                    "progress": 36,
                    "url": "skills/verbal-skills/",
                    "practiceUrl": "practice/?skillCategory=verbal-skills",
                    "recommendedNextTopic": "Vocabulary Reasoning",
                }
            )

    verbal_skill = {
        "id": "core-verbal-reasoning",
        "categoryId": "verbal-skills",
        "slug": "core-verbal-reasoning",
        "name": "Core Verbal Reasoning",
        "description": "A professional verbal skills path covering vocabulary, synonyms, antonyms, analogies, word relationships, sentence completion, correction, and meaning logic.",
        "level": "Core",
        "progress": 36,
        "url": "skills/verbal-skills/",
        "practiceUrl": "practice/?skillCategory=verbal-skills",
    }
    data["skills"] = [skill for skill in data["skills"] if skill["id"] != verbal_skill["id"]]
    data["skills"].insert(0, verbal_skill)
    write_json("data/skills.json", data)


def update_topics():
    data = read_json("data/topics.json")
    verbal_ids = {topic["id"] for topic in VERBAL_TOPICS}
    data["topics"] = [topic for topic in data["topics"] if topic.get("id") not in verbal_ids]
    verbal_topics = []
    for index, topic in enumerate(VERBAL_TOPICS):
        topic_id = topic["id"]
        url = f"skills/verbal-skills/{topic_id}/"
        practice_url = f"practice/verbal-skills/{topic_id}/"
        next_url = f"skills/verbal-skills/{VERBAL_TOPICS[(index + 1) % len(VERBAL_TOPICS)]['id']}/"
        item = {
            "id": topic_id,
            "slug": topic_id,
            "skillCategory": "verbal-skills",
            "skill": "core-verbal-reasoning",
            "name": topic["name"],
            "description": topic["description"],
            "level": topic["level"],
            "progress": topic["progress"],
            "url": url,
            "practiceUrl": practice_url,
            "nextTopicUrl": next_url,
            "recommendedSubTopic": topic["name"],
            "keywords": topic["keywords"],
            "study": topic["study"],
            "subTopics": [
                {
                    "id": topic_id,
                    "slug": topic_id,
                    "name": topic["name"],
                    "description": topic["description"],
                    "level": topic["level"],
                    "progress": topic["progress"],
                    "url": url,
                    "keywords": topic["keywords"],
                    "study": topic["study"],
                }
            ],
        }
        verbal_topics.append(item)

    insert_at = 0
    data["topics"][insert_at:insert_at] = verbal_topics
    write_json("data/topics.json", data)


def update_question_imports():
    data = read_json("data/questions.json")
    import_path = "data/questions/verbal-skills.json"
    imports = data.get("imports", [])
    if import_path not in imports:
        imports.append(import_path)
    data["imports"] = imports
    write_json("data/questions.json", data)


def update_progress():
    data = read_json("data/progress-sample.json")
    verbal_items = [
        {
            "id": "vocabulary-reasoning",
            "name": "Vocabulary Reasoning",
            "progress": 34,
            "accuracy": 68,
            "speed": "Normal",
            "mistakes": 12,
            "level": "Core",
            "repairUrl": "skills/verbal-skills/vocabulary-reasoning/",
            "practiceUrl": "practice/verbal-skills/vocabulary-reasoning/",
        },
        {
            "id": "sentence-correction",
            "name": "Sentence Correction",
            "progress": 30,
            "accuracy": 64,
            "speed": "Careful",
            "mistakes": 15,
            "level": "Core",
            "repairUrl": "skills/verbal-skills/sentence-correction/",
            "practiceUrl": "practice/verbal-skills/sentence-correction/",
        },
    ]
    existing = {item["id"]: item for item in data.get("skills", [])}
    for item in verbal_items:
        existing[item["id"]] = item
    data["skills"] = list(existing.values())
    data["strongSkills"] = list(dict.fromkeys([*data.get("strongSkills", []), "Context Clues", "Nearest Meaning"]))
    data["weakSkills"] = list(dict.fromkeys([*data.get("weakSkills", []), "Sentence Correction", "Advanced Antonyms"]))
    data["completedTopics"] = list(dict.fromkeys([*data.get("completedTopics", []), "Synonyms Starter Set"]))
    data["mistakeTypes"] = [
        *data.get("mistakeTypes", []),
        {"label": "Chose related but not closest meaning", "count": 5},
        {"label": "Ignored sentence contrast signal", "count": 4},
    ]
    data["badges"] = list(dict.fromkeys([*data.get("badges", []), "Verbal Builder"]))
    data["nextStep"] = {
        "label": "Practice 5 Core vocabulary reasoning questions",
        "description": "Verbal Skills is ready for focused practice. The next repair target is context-based vocabulary reasoning.",
        "url": "practice/verbal-skills/vocabulary-reasoning/?level=Core",
    }
    write_json("data/progress-sample.json", data)


def html_page(title, description, loading):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/al-hayat-aptitude-skills-hub/">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="./">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  <a class="skip-link" href="#app">Skip to content</a>
  <header class="site-header" data-site-header>
    <div class="header-inner">
      <a class="brand" href="./" aria-label="Al-Hayat Aptitude Skills Hub home"><span class="brand-mark" aria-hidden="true">AH</span><span class="brand-text">Al-Hayat <strong>Aptitude Skills Hub</strong></span></a>
      <form class="header-search" role="search" data-header-search><label class="sr-only" for="header-search-input">Search skills, topics, questions</label><input id="header-search-input" name="q" type="search" placeholder="Search skills, topics, questions..." autocomplete="off"><button type="submit">Search</button></form>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>Menu</button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-site-nav><a href="./">Home</a><a href="skills/">Skills</a><a href="practice/">Practice</a><a href="mock-tests/">Mock Tests</a><a href="progress/">Progress</a><a href="resources/">Resources</a><a href="search/">Search</a><a class="login-link" href="#login">Login</a></nav>
    </div>
  </header>
  <main id="app" tabindex="-1"><section class="loading-state" aria-live="polite">{loading}</section></main>
  <footer class="site-footer"><div><strong>Al-Hayat Aptitude Skills Hub</strong><p>Skill-based aptitude learning for admissions, scholarships, hiring, and cognitive assessment preparation.</p></div><nav aria-label="Footer navigation"><a href="skills/">Skills</a><a href="practice/">Practice</a><a href="progress/">Progress</a><a href="resources/">Resources</a></nav></footer>
  <script type="module" src="assets/js/app.js"></script>
</body>
</html>
"""


def create_routes():
    skill_dir = ROOT / "skills" / "verbal-skills"
    skill_dir.mkdir(parents=True, exist_ok=True)
    (skill_dir / "index.html").write_text(
        html_page(
            "Verbal Skills | Al-Hayat Aptitude Skills Hub",
            "Study vocabulary, synonyms, antonyms, analogies, word relationships, sentence completion, correction, and sentence logic.",
            "Loading Verbal Skills...",
        ),
        encoding="utf-8",
    )

    practice_skill_dir = ROOT / "practice" / "verbal-skills"
    practice_skill_dir.mkdir(parents=True, exist_ok=True)
    for topic in VERBAL_TOPICS:
        topic_dir = skill_dir / topic["id"]
        topic_dir.mkdir(parents=True, exist_ok=True)
        (topic_dir / "index.html").write_text(
            html_page(
                f"{topic['name']} | Al-Hayat Aptitude Skills Hub",
                topic["description"],
                f"Loading {topic['name']}...",
            ),
            encoding="utf-8",
        )
        practice_dir = practice_skill_dir / topic["id"]
        practice_dir.mkdir(parents=True, exist_ok=True)
        (practice_dir / "index.html").write_text(
            html_page(
                f"Practice {topic['name']} | Al-Hayat Aptitude Skills Hub",
                f"Practice original {topic['name']} questions with explanations and learning links.",
                f"Loading {topic['name']} practice...",
            ),
            encoding="utf-8",
        )


def main():
    questions = build_questions()
    if len(questions) != 320:
        raise ValueError(f"Expected 320 questions, got {len(questions)}")
    update_skills()
    update_topics()
    update_question_imports()
    update_progress()
    write_json(
        "data/questions/verbal-skills.json",
        {
            "schemaVersion": 1,
            "description": "Original Verbal Skills question pack for Al-Hayat Aptitude Skills Hub.",
            "questions": questions,
        },
    )
    create_routes()
    print("Built Verbal Skills package with 8 topics and 320 questions.")


if __name__ == "__main__":
    main()
