import { useState } from "react";
import { startStory } from "../../api/storyApi";
import { useStoryStore } from "../Store/StoryStore";

const BG = '/collage-abstract-background_53876-113040.avif'

const STEPS = [
  { id: "gender",  title: "Who are you?",          subtitle: "Choose your character's gender" },
  { id: "name",    title: "What is your name?",     subtitle: "Enter your character's name" },
  { id: "look",    title: "How do you look?",       subtitle: "Pick options or type your own" },
  { id: "outfit",  title: "What do you wear?",      subtitle: "Pick options or type your own" },
  { id: "style",   title: "Choose your art style",  subtitle: "How every scene will be painted" },
  { id: "story",   title: "What is your story?",    subtitle: "Pick a genre or write your own" },
];

const OPTS = {
  age:      ["Teen (16-18)", "Young adult (19-25)", "Adult (26-35)", "Mature (36-50)"],
  build:    ["Slim & slender", "Athletic & toned", "Muscular", "Petite", "Tall & lean", "Curvy", "Average"],
  faceShape:["Sharp angular", "Soft oval", "Round & gentle", "Square jaw", "Heart-shaped", "Diamond"],
  skinTone: ["Fair porcelain", "Light ivory", "Warm peach", "Golden tan", "Olive bronze", "Dark brown", "Deep ebony"],
  eyeColor: ["Electric blue", "Emerald green", "Silver grey", "Amber gold", "Deep violet", "Crimson red", "Jet black", "Heterochromia"],
  hairColor:["Raven black", "Platinum blonde", "Fiery red", "Chestnut brown", "Silver white", "Ocean blue", "Rose gold", "Midnight purple"],
  hairStyle:["Long & straight", "Short spiky", "Shoulder-length wavy", "Braided", "Undercut", "Messy bun", "Ponytail", "Wild & untamed"],
  unique:   ["Scar on left cheek", "Glowing tattoo", "Heterochromia eyes", "Wolf ears", "Eye patch", "Mechanical arm", "Burn mark", "Freckles"],
  outfit:   [
    "Black military coat with gold trim",
    "White school uniform",
    "Dark fantasy armour",
    "Cyberpunk hoodie with LED strips",
    "Samurai gi with clan crest",
    "Noble dress with silver embroidery",
    "Stealth assassin blacks",
    "Wizard robes with rune patterns",
  ],
  accessories: [
    "Crescent moon pendant",
    "Fingerless gloves",
    "Katana on back",
    "Magic staff",
    "Mechanical goggles",
    "Earring set",
    "Tattered scarf",
    "Shield with crest",
  ],
  story: [
    "A cyberpunk heist gone wrong — I am a hacker betrayed by my crew",
    "A dark fantasy kingdom where magic is forbidden and I am the last mage",
    "A post-apocalyptic wasteland where I must find my missing sibling",
    "A royal court full of political intrigue and I am the secret heir",
    "A samurai era Japan — I seek revenge against the clan that killed my master",
    "A space station mystery — the crew is disappearing one by one",
    "An enchanted academy where students wield elemental powers",
    "A pirate voyage to find a legendary lost island",
  ],
};

const ART_STYLES = [
  { id: "anime",          label: "Anime",          desc: "Japanese animation movie style",     icon: "⛩️" },
  { id: "semi-realistic", label: "Semi-Realistic",  desc: "Anime realism, natural proportions", icon: "🎨" },
  { id: "realistic",      label: "Realistic",       desc: "Cinematic photography, movie scene", icon: "📷" },
  { id: "cartoon",        label: "Cartoon",         desc: "Stylized, colorful, soft shapes",    icon: "🖍️" },
];

function StepShell({ step, current, total, children }) {
  return (
    <div className="w-full">
      <div className="w-full h-1 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((current + 1) / total) * 100}%`, background: '#f5e0b5' }} />
      </div>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#f5e0b5' }}>
        Step {current + 1} of {total}
      </p>
      <h2 className="text-2xl font-bold mb-1" style={{ color: '#f5e0b5', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{step.title}</h2>
      <p className="text-sm mb-6" style={{ color: '#c4b08a', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{step.subtitle}</p>
      {children}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continue \u2192", disabled = false }) {
  return (
    <div className="flex gap-3 mt-6">
      <button onClick={onBack}
        className="flex-1 py-3 rounded-lg transition text-sm"
        style={{ border: '1px solid rgba(196,176,138,0.3)', color: '#c4b08a', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
        \u2190 Back
      </button>
      <button onClick={onNext} disabled={disabled}
        className="flex-1 font-semibold py-3 rounded-lg transition disabled:opacity-40"
        style={{ background: 'rgba(245,224,181,0.85)', color: '#3e2c14' }}>
        {nextLabel}
      </button>
    </div>
  );
}

function PickOrType({ label, value, onChange, options, placeholder, hint, multiline = false }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest" style={{ color: '#c4b08a' }}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = value === opt;
          return (
            <button key={opt} type="button" onClick={() => onChange(active ? "" : opt)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active ? 'border-[#f5e0b5] text-[#f5e0b5]' : ''}`}
              style={{ background: active ? 'rgba(245,224,181,0.15)' : 'rgba(30,20,12,0.5)', borderColor: active ? '#f5e0b5' : 'rgba(196,176,138,0.2)', color: active ? '#f5e0b5' : '#c4b08a' }}>
              {active ? '\u2713 ' : ''}{opt}
            </button>
          );
        })}
      </div>
      {multiline ? (
        <textarea rows={3} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none transition"
          style={{ background: 'rgba(30,20,12,0.5)', border: '1px solid rgba(196,176,138,0.2)', color: '#f5e0b5' }}
          placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none transition"
          style={{ background: 'rgba(30,20,12,0.5)', border: '1px solid rgba(196,176,138,0.2)', color: '#f5e0b5' }}
          placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      )}
      {hint && <p className="text-xs" style={{ color: 'rgba(196,176,138,0.6)' }}>{hint}</p>}
    </div>
  );
}

function GenderStep({ value, onChange, onNext }) {
  const options = [
    { id: "male",       icon: "\u2642",  label: "Male",       sub: "He / Him" },
    { id: "female",     icon: "\u2640",  label: "Female",     sub: "She / Her" },
    { id: "non-binary", icon: "\u26A7", label: "Non-Binary", sub: "They / Them" },
  ];
  return (
    <div className="space-y-3">
      {options.map(opt => (
        <button key={opt.id} onClick={() => { onChange(opt.id); setTimeout(onNext, 180); }}
          className="w-full flex items-center gap-5 px-6 py-4 rounded-xl border-2 transition-all text-left"
          style={{
            borderColor: value === opt.id ? '#f5e0b5' : 'rgba(196,176,138,0.2)',
            background: value === opt.id ? 'rgba(245,224,181,0.12)' : 'rgba(30,20,12,0.4)',
          }}>
          <span className="text-3xl leading-none">{opt.icon}</span>
          <div>
            <p className="font-semibold text-base" style={{ color: '#f5e0b5' }}>{opt.label}</p>
            <p className="text-xs" style={{ color: '#c4b08a' }}>{opt.sub}</p>
          </div>
          {value === opt.id && <span className="ml-auto" style={{ color: '#f5e0b5' }}>\u2713</span>}
        </button>
      ))}
    </div>
  );
}

function NameStep({ value, onChange, onBack, onNext }) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest" style={{ color: '#c4b08a' }}>Character Name</label>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {["Aren", "Seika", "Ryuuto", "Lyra", "Kael", "Nyx", "Zara", "Dain"].map(n => (
            <button key={n} type="button" onClick={() => onChange(n)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${value === n ? 'border-[#f5e0b5]' : ''}`}
              style={{ background: value === n ? 'rgba(245,224,181,0.15)' : 'rgba(30,20,12,0.5)', borderColor: value === n ? '#f5e0b5' : 'rgba(196,176,138,0.2)', color: value === n ? '#f5e0b5' : '#c4b08a' }}>
              {value === n ? '\u2713 ' : ''}{n}
            </button>
          ))}
        </div>
        <input autoFocus className="w-full rounded-lg px-4 py-3 text-lg focus:outline-none transition"
          style={{ background: 'rgba(30,20,12,0.5)', border: '1px solid rgba(196,176,138,0.2)', color: '#f5e0b5' }}
          placeholder="Or type your own name\u2026"
          value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && value.trim() && onNext()} />
        <p className="text-xs" style={{ color: 'rgba(196,176,138,0.6)' }}>Pick a suggestion or type anything \u2014 press Enter to continue</p>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!value.trim()} />
    </>
  );
}

function LookStep({ profile, onChange, onBack, onNext }) {
  return (
    <>
      <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">
        <PickOrType label="Age" value={profile.age} onChange={v => onChange("age", v)} options={OPTS.age} placeholder="Or type: e.g. 17, early 20s\u2026" />
        <PickOrType label="Height & Build" value={profile.build} onChange={v => onChange("build", v)} options={OPTS.build} placeholder="Or type: e.g. tall and athletic\u2026" />
        <PickOrType label="Face Shape" value={profile.faceShape} onChange={v => onChange("faceShape", v)} options={OPTS.faceShape} placeholder="Or type: e.g. strong jawline\u2026" />
        <PickOrType label="Skin Tone" value={profile.skinTone} onChange={v => onChange("skinTone", v)} options={OPTS.skinTone} placeholder="Or type: e.g. light olive\u2026" />
        <PickOrType label="Eye Color" value={profile.eyeColor} onChange={v => onChange("eyeColor", v)} options={OPTS.eyeColor} placeholder="Or type: e.g. glowing amber\u2026" />
        <PickOrType label="Hair Color" value={profile.hairColor} onChange={v => onChange("hairColor", v)} options={OPTS.hairColor} placeholder="Or type: e.g. dark teal tips\u2026" />
        <PickOrType label="Hair Style" value={profile.hairStyle} onChange={v => onChange("hairStyle", v)} options={OPTS.hairStyle} placeholder="Or type: e.g. half-up with loose strands\u2026" />
        <PickOrType label="Unique Features" value={profile.uniqueFeatures} onChange={v => onChange("uniqueFeatures", v)} options={OPTS.unique} placeholder="Or type: e.g. glowing runes on arms\u2026" hint="These traits are locked into every scene image" />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </>
  );
}

function OutfitStep({ profile, onChange, onBack, onNext }) {
  return (
    <>
      <div className="space-y-5">
        <PickOrType label="Main Outfit" value={profile.outfit} onChange={v => onChange("outfit", v)} options={OPTS.outfit} placeholder="Or type your own outfit description\u2026" hint="Appears in every scene image \u2014 be specific" />
        <PickOrType label="Accessories" value={profile.accessories} onChange={v => onChange("accessories", v)} options={OPTS.accessories} placeholder="Or type: e.g. twin daggers at belt\u2026" />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </>
  );
}

function StyleStep({ value, onChange, onBack, onNext }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {ART_STYLES.map(s => (
          <button key={s.id} onClick={() => onChange(s.id)}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left"
            style={{
              borderColor: value === s.id ? '#f5e0b5' : 'rgba(196,176,138,0.2)',
              background: value === s.id ? 'rgba(245,224,181,0.12)' : 'rgba(30,20,12,0.4)',
            }}>
            <span className="text-2xl">{s.icon}</span>
            <p className="font-semibold text-sm" style={{ color: value === s.id ? '#f5e0b5' : '#c4b08a' }}>{s.label}</p>
            <p className="text-xs" style={{ color: 'rgba(196,176,138,0.6)' }}>{s.desc}</p>
            {value === s.id && <span className="text-xs mt-1" style={{ color: '#f5e0b5' }}>\u2713 Selected</span>}
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!value} />
    </>
  );
}

function StoryStep({ profile, storyPrompt, onChangeStory, onBack, onSubmit, isLoading }) {
  return (
    <>
      <div className="rounded-xl p-3 mb-5" style={{ background: 'rgba(30,20,12,0.4)', border: '1px solid rgba(196,176,138,0.15)' }}>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c4b08a' }}>Your character</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            profile.gender && `${profile.gender === "female" ? "\u2640" : profile.gender === "male" ? "\u2642" : "\u26A7"} ${profile.gender}`,
            profile.name,
            profile.artStyle,
            profile.eyeColor && `${profile.eyeColor} eyes`,
            profile.hairColor && `${profile.hairColor} hair`,
            profile.outfit && profile.outfit.split(" ").slice(0, 4).join(" ") + "\u2026",
          ].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full border"
              style={{ background: 'rgba(245,224,181,0.1)', borderColor: 'rgba(245,224,181,0.2)', color: '#f5e0b5' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest" style={{ color: '#c4b08a' }}>Story World</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {OPTS.story.map(s => (
            <button key={s} type="button" onClick={() => onChangeStory(storyPrompt === s ? "" : s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left ${storyPrompt === s ? 'border-[#f5e0b5]' : ''}`}
              style={{ background: storyPrompt === s ? 'rgba(245,224,181,0.15)' : 'rgba(30,20,12,0.5)', borderColor: storyPrompt === s ? '#f5e0b5' : 'rgba(196,176,138,0.2)', color: storyPrompt === s ? '#f5e0b5' : '#c4b08a' }}>
              {storyPrompt === s ? '\u2713 ' : ''}{s.split("\u2014")[0].trim()}
            </button>
          ))}
        </div>

        <textarea className="w-full h-24 rounded-lg px-3 py-2.5 resize-none focus:outline-none text-sm transition"
          style={{ background: 'rgba(30,20,12,0.5)', border: '1px solid rgba(196,176,138,0.2)', color: '#f5e0b5' }}
          placeholder="Or write your own story world \u2014 the more detail, the better\u2026"
          value={storyPrompt} onChange={e => onChangeStory(e.target.value)} />
        <p className="text-xs" style={{ color: 'rgba(196,176,138,0.6)' }}>Pick a genre above or type anything. You become the hero.</p>
      </div>

      <NavButtons onBack={onBack} onNext={onSubmit} nextLabel={isLoading ? "Crafting your story..." : "Begin Adventure \u2192"} disabled={!storyPrompt.trim() || isLoading} />
    </>
  );
}

export default function PromptInput() {
  const [step, setStep] = useState(0);
  const [storyPrompt, setStoryPrompt] = useState("");
  const [profile, setProfile] = useState({
    name: "", gender: "", age: "", build: "", faceShape: "", skinTone: "",
    eyeColor: "", hairColor: "", hairStyle: "", uniqueFeatures: "",
    outfit: "", accessories: "", artStyle: "anime",
  });

  const { setStory, setLoading, isLoading, setCharacterProfile } = useStoryStore();

  const updateProfile = (key, val) => setProfile(p => ({ ...p, [key]: val }));
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!storyPrompt.trim() || !profile.name.trim()) return;
    setCharacterProfile(profile);
    setLoading(true);
    try {
      const data = await startStory(storyPrompt, profile.name, profile);
      setStory(data);
    } catch {
      alert("Error starting story. Check backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      <img src={BG} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
      <div className="relative z-10 max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#f5e0b5', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Story Forge AI</h1>
          <p className="text-sm mt-1" style={{ color: '#c4b08a', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Build your character. Enter the story.</p>
        </div>

        <div className="p-6" style={{ background: 'rgba(30,20,12,0.35)', borderRadius: '16px', backdropFilter: 'none' }}>
          <StepShell step={STEPS[step]} current={step} total={STEPS.length}>

            {step === 0 && (
              <GenderStep value={profile.gender} onChange={v => updateProfile("gender", v)} onNext={next} />
            )}
            {step === 1 && (
              <NameStep value={profile.name} onChange={v => updateProfile("name", v)} onBack={back} onNext={next} />
            )}
            {step === 2 && (
              <LookStep profile={profile} onChange={updateProfile} onBack={back} onNext={next} />
            )}
            {step === 3 && (
              <OutfitStep profile={profile} onChange={updateProfile} onBack={back} onNext={next} />
            )}
            {step === 4 && (
              <StyleStep value={profile.artStyle} onChange={v => updateProfile("artStyle", v)} onBack={back} onNext={next} />
            )}
            {step === 5 && (
              <StoryStep profile={profile} storyPrompt={storyPrompt} onChangeStory={setStoryPrompt} onBack={back} onSubmit={handleSubmit} isLoading={isLoading} />
            )}

          </StepShell>
        </div>
      </div>
    </div>
  );
}
