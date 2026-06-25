import { useState } from 'react';
import { BookOpen, Award, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  category: 'Crypto' | 'Awareness' | 'Health';
  content: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const XAMAN_COURSE_LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Sovereign Keys vs Toxic Systems",
    duration: "5 min",
    category: "Crypto",
    content: [
      "Bij traditionele exchanges (zoals Binance of Coinbase) bezit je in feite niks. Je logt in met een e-mailadres en wachtwoord, en de exchange beheert de private keys. Als zij omvallen, is je vermogen weg ('Not your keys, not your crypto').",
      "Xaman is een non-custodial wallet. Dit betekent dat JIJ de absolute controle hebt. De 12 of 24 woorden (je geheime sleutel/seed phrase) worden cryptografisch versleuteld opgeslagen op jouw apparaat.",
      "Woorden zijn vibraties en creëren realiteit. In de cryptowereld is jouw seed phrase de ultieme manifestatie van jouw financiële soevereiniteit. Deel deze nooit, met niemand, in geen enkele applicatie."
    ],
    quiz: {
      question: "Waar worden jouw private keys opgeslagen als je Xaman gebruikt?",
      options: [
        "Veilig op de centrale servers van XRPL Labs.",
        "Nergens, die worden elke keer opnieuw gegenereerd als je inlogt.",
        "Lokaal op jouw eigen apparaat, volledig onder jouw beheer."
      ],
      correctIndex: 2,
      explanation: "Xaman is non-custodial. Jouw sleutels verlaten nooit je eigen apparaat. Jij bent de baas, weg van het toxische gecentraliseerde systeem."
    }
  },
  {
    id: 2,
    title: "The Cryptographic Handshake",
    duration: "6 min",
    category: "Crypto",
    content: [
      "Wanneer je inlogt op de OTT Terminal via Xaman, geef je de app geen toegang tot je geld of je sleutels. Er vindt een beveiligde OAuth2/PKCE handdruk plaats.",
      "De Terminal stuurt een verzoek (payload) naar de Xaman app. Jij opent de app, scant de QR-code of accepteer de push-notificatie, en ondertekent de transactie cryptografisch met je pincode of FaceID.",
      "De Terminal ontvangt alleen de cryptografisch geverifieerde bevestiging en jouw publieke r-adres. Dit is de meest veilige manier om met blockchain-ecosystemen te communiceren."
    ],
    quiz: {
      question: "Wat geef je vrij aan de OTT Terminal als je inlogt met Xaman?",
      options: [
        "Je private keys zodat de terminal transacties voor je kan doen.",
        "Alleen je publieke r-adres en een cryptografisch geverifieerde handdruk.",
        "Je Xaman inlogpincode en herstelwoorden."
      ],
      correctIndex: 1,
      explanation: "De app krijgt enkel je publieke r-adres te zien. Transacties onderteken je altijd zelf, handmatig, binnen de muren van de beveiligde Xaman app."
    }
  },
  {
    id: 3,
    title: "Ledger Objects & Trustlines",
    duration: "7 min",
    category: "Crypto",
    content: [
      "Op het XRP Ledger kunnen accounts niet zomaar ongevraagd vage tokens naar je toe sturen. Dit beschermt je tegen spam en malafide airdrops.",
      "Om een token zoals $OTT of $RLUSD te kunnen ontvangen, moet je expliciet een 'Trustline' openzetten. Dit is een on-chain contract waarmee je aangeeft: 'Ik vertrouw deze issuer en sta toe dat dit token in mijn wallet komt'.",
      "Elke trustline die je opent, reserveert tijdelijk 2 XRP op het netwerk. Zodra je de trustline weer sluit via de Trustline Manager, krijg je die 2 XRP direct weer terug in je actieve saldo."
    ],
    quiz: {
      question: "Waarom reserveert het XRPL netwerk 2 XRP per actieve trustline?",
      options: [
        "Als transactiekosten die je definitief kwijt bent aan de validators.",
        "Als on-chain reserveer-vrijwaring, die je volledig terugkrijgt zodra je de trustline sluit.",
        "Als winstuitkering voor het Xaman platform."
      ],
      correctIndex: 1,
      explanation: "Dit is een on-chain object reserve. Het voorkomt spam op de blockchain. Als je de trustline opschoont, claim je die 2 XRP direct weer terug!"
    }
  }
];

export function AcademyTab() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const handleOptionSelect = (index: number) => {
    if (quizChecked) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !selectedLesson) return;
    setQuizChecked(true);
    
    if (selectedOption === selectedLesson.quiz.correctIndex) {
      if (!completedLessons.includes(selectedLesson.id)) {
        setCompletedLessons([...completedLessons, selectedLesson.id]);
      }
    }
  };

  const handleNextLesson = () => {
    setSelectedOption(null);
    setQuizChecked(false);
    const nextId = selectedLesson ? selectedLesson.id + 1 : 1;
    const nextLesson = XAMAN_COURSE_LESSONS.find(l => l.id === nextId);
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    } else {
      setSelectedLesson(null); // Terug naar overzicht
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white font-sans">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-950 pb-6">
        <div>
          <h1 className="font-orbitron text-md font-black uppercase tracking-[0.2em]">OTT Sovereign Academy</h1>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Eradicating Systemic Ignorance • 589 Steps Ahead</p>
        </div>
        <div className="flex items-center space-x-4 bg-gray-950/40 border border-gray-950 px-4 py-2.5">
          <Layers className="w-4 h-4 text-[#2b82ff]" />
          <div className="text-left">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Voltooid Saldo</div>
            <div className="font-orbitron text-xs font-black">{completedLessons.length} / {XAMAN_COURSE_LESSONS.length} Intel Tracks</div>
          </div>
        </div>
      </div>

      {/* Monthly Dropping Strategy Ticker */}
      <div className="p-3 border border-gray-950 bg-gray-950/20 rounded-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-[#ff2079] animate-pulse" />
          <span>PROTOTYPE ENGINE ACTIVE: Elke maand worden er 5 nieuwe tracks toegevoegd (Inclusief The Hearth Book Chronicles).</span>
        </div>
      </div>

      {!selectedLesson ? (
        // OVERVIEW MODE
        <div className="space-y-6">
          <div>
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-[#2b82ff] mb-1">Actieve Cursus: Mastering Xaman Wallet</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Leer hoe cryptografische soevereiniteit in de praktijk werkt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {XAMAN_COURSE_LESSONS.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <div 
                  key={lesson.id}
                  className="border border-gray-950 bg-black p-6 flex flex-col justify-between space-y-6 hover:border-gray-800 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-mono tracking-widest uppercase">
                      <span className="px-2 py-0.5 bg-gray-950 border border-gray-900 text-gray-400">{lesson.category}</span>
                      <span className="text-gray-600">{lesson.duration}</span>
                    </div>
                    <h3 className="font-orbitron text-xs font-black uppercase tracking-wide text-white leading-tight">{lesson.title}</h3>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setSelectedOption(null);
                      setQuizChecked(false);
                    }}
                    className={`w-full py-2.5 font-orbitron text-[10px] font-black uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isCompleted 
                        ? 'bg-transparent border-green-950 text-green-400 hover:bg-green-950/10' 
                        : 'bg-white text-black border-white hover:bg-black hover:text-white'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Track Voltooid
                      </>
                    ) : (
                      <>
                        <span>Start Intel Track</span> <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ACTIVE LESSON IN-DEPTH VIEW
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Content Space */}
          <div className="xl:col-span-2 border border-gray-950 bg-black p-8 space-y-6">
            <button 
              onClick={() => setSelectedLesson(null)}
              className="text-[10px] font-mono text-gray-500 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
            >
              ⬅ Terug naar overzicht
            </button>
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#2b82ff] uppercase tracking-widest font-bold">Track 0{selectedLesson.id}</span>
              <h2 className="font-orbitron text-sm font-black uppercase tracking-wide text-white">{selectedLesson.title}</h2>
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-950 text-gray-300 text-xs font-sans leading-relaxed">
              {selectedLesson.content.map((paragraph, index) => (
                <p key={index} className="bg-gray-950/10 p-3 border-l-2 border-gray-900">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Quiz / Verification Space */}
          <div className="border border-gray-950 bg-black p-6 space-y-6 relative">
            <div className="absolute top-0 right-0 bg-[#ff2079] text-black font-orbitron font-black text-[9px] tracking-widest uppercase px-2 py-0.5">
              Knowledge Check
            </div>

            <div className="flex items-center space-x-2 text-white pt-2">
              <HelpCircle className="w-4 h-4 text-[#ff2079]" />
              <h3 className="font-orbitron text-xs font-black uppercase tracking-widest">Verify Intelligence</h3>
            </div>

            <p className="text-[11px] font-mono text-gray-400 leading-tight border-b border-gray-950 pb-4">
              {selectedLesson.quiz.question}
            </p>

            {/* Options List */}
            <div className="space-y-3">
              {selectedLesson.quiz.options.map((option, idx) => {
                let borderStyle = "border-gray-950 bg-gray-950/20";
                if (selectedOption === idx) borderStyle = "border-white bg-white/5";
                
                if (quizChecked) {
                  if (idx === selectedLesson.quiz.correctIndex) {
                    borderStyle = "border-green-500 bg-green-950/10 text-green-400";
                  } else if (selectedOption === idx) {
                    borderStyle = "border-red-500 bg-red-950/10 text-red-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={quizChecked}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 border text-xs font-mono transition-all rounded-sm flex items-start space-x-2 ${borderStyle} ${!quizChecked && 'hover:border-gray-700 cursor-pointer'}`}
                  >
                    <span className="font-bold shrink-0">{String.fromCharCode(65 + idx)}.</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Section */}
            {!quizChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="w-full bg-white text-black hover:bg-black hover:text-white border border-white font-orbitron text-xs font-black uppercase tracking-widest py-3 transition-all disabled:opacity-40 cursor-pointer"
              >
                Verifieer Antwoord
              </button>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 border border-gray-950 bg-gray-950/30 text-[10px] font-mono text-gray-400 leading-tight">
                  <div className="font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1">
                    {selectedOption === selectedLesson.quiz.correctIndex ? (
                      <span className="text-green-400">✓ Cryptografisch Correct</span>
                    ) : (
                      <span className="text-red-400">✗ Verificatie Mislukt</span>
                    )}
                  </div>
                  {selectedLesson.quiz.explanation}
                </div>
                <button
                  onClick={handleNextLesson}
                  className="w-full border border-[#2b82ff] bg-[#2b82ff] text-black hover:bg-black hover:text-[#2b82ff] font-orbitron text-xs font-black uppercase tracking-widest py-3 transition-all cursor-pointer"
                >
                  Volgende Track
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}