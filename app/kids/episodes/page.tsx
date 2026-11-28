"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import KidsSubNavBar from "../../components/KidsSubNavBar";
import {
  Play,
  Lock,
  Info,
  Youtube,
  Award,
  Star,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";

type KidLanguage = "en" | "ha" | "ig" | "yo";

interface LocalizedText {
  en: string;
  ha: string;
  ig: string;
  yo: string;
}

interface QuizQuestion {
  id: string;
  question: LocalizedText;
  options: {
    en: string[];
    ha: string[];
    ig: string[];
    yo: string[];
  };
  correctOptionIndex: number;
  explanation: LocalizedText;
}

interface Episode {
  id: number;
  episodeNumber: number;
  title: LocalizedText;
  desc: LocalizedText;
  topic: LocalizedText;
  thumbnail: string;
  status: "available" | "coming-soon" | "locked";
  badge: string;
  youtubeId: string;
  questions: QuizQuestion[];
}

const EPISODES: Episode[] = [
  {
    id: 1,
    episodeNumber: 1,
    title: {
      en: "Quest for A, B, C",
      ha: "Neman Haruffan A, B, C",
      ig: "Ichota Mkpuruokwu A, B, C",
      yo: "Iwadi Alifabeeti A, B, D",
    },
    desc: {
      en: "Join our heroes as they explore a magical orchard to find the first letters of the alphabet.",
      ha: "Kalli jarumanmu yayin da suke binciken gonar sihiri don nemo haruffan farko.",
      ig: "Soro ndi dike anyi mgbe ha na-enyocha ubi anwansi ichota mkpuruokwu mbu.",
      yo: "Darapo mo awon akoni wa bi won se n wa awon leta akoko ninu ogba iyanu.",
    },
    topic: {
      en: "Alphabet & Phonics",
      ha: "Haruffa da Sauti",
      ig: "Mkpuruokwu na Uda",
      yo: "Alifabeeti ati Iro Leta",
    },
    thumbnail: "/assets/kids/episode_teaser.png",
    status: "available",
    badge: "Episode 1",
    youtubeId: "o5HukmvQD1w",
    questions: [
      {
        id: "q-1-1",
        question: {
          en: "Which letter comes first in the alphabet?",
          ha: "Wane harafi ne na farko a cikin jerin haruffa?",
          ig: "Olee mkpuruokwu bu nke mbu na mkpuruokwu?",
          yo: "Leta wo lo wa ni akoko ninu alifabeeti?",
        },
        options: {
          en: ["Letter B", "Letter A", "Letter C", "Letter Z"],
          ha: ["Haraf B", "Haraf A", "Haraf C", "Haraf Z"],
          ig: ["Mkpuruokwu B", "Mkpuruokwu A", "Mkpuruokwu C", "Mkpuruokwu Z"],
          yo: ["Leta B", "Leta A", "Leta D", "Leta Y"],
        },
        correctOptionIndex: 1,
        explanation: {
          en: "The letter 'A' is the very first letter of the alphabet!",
          ha: "Harafin 'A' shi ne harafi na farko a cikin jerin haruffa!",
          ig: "Mkpuruokwu 'A' bu mkpuruokwu mbu na mkpuruokwu nile!",
          yo: "Leta 'A' ni leta akoko ninu alifabeeti!",
        },
      },
      {
        id: "q-1-2",
        question: {
          en: "What sound does the letter 'B' make?",
          ha: "Wane sauti harafin 'B' yake yi?",
          ig: "Olee uda mkpuruokwu 'B' na-eme?",
          yo: "Iro wo ni leta 'B' n se?",
        },
        options: {
          en: ["/b/ like Ball", "/s/ like Sun", "/m/ like Moon", "/t/ like Tree"],
          ha: ["/b/ kamar Biredi", "/s/ kamar Rana", "/m/ kamar Wata", "/t/ kamar Bishiya"],
          ig: ["/b/ dika Boli", "/s/ dika Anwu", "/m/ dika Onwa", "/t/ dika Osisi"],
          yo: ["/b/ bi Boli", "/s/ bi Oorun", "/m/ bi Osupa", "/t/ bi Igi"],
        },
        correctOptionIndex: 0,
        explanation: {
          en: "'B' makes the bouncy /b/ sound, like in Ball and Bird!",
          ha: "'B' yana yin sautin /b/, kamar a Biredi!",
          ig: "'B' na-eme uda /b/, dika na Boli!",
          yo: "'B' n se iro /b/, bi ninu Boli!",
        },
      },
    ],
  },
  {
    id: 2,
    episodeNumber: 2,
    title: {
      en: "Shape Squad Heroics",
      ha: "Jarumtar Rundunar Siffofi",
      ig: "Okaibe Otu Udidi",
      yo: "Akoni Egbe Apere",
    },
    desc: {
      en: "A giant circle is blocking the square city gate! Use geometry powers to solve the puzzle.",
      ha: "Wani babban da'ira ya tare kofar birni! Yi amfani da dabarun siffofi don warware matsalar.",
      ig: "Okirikiri buru ibu gbochiri onu uzo obodo! Jiri ike udidi mepee ya.",
      yo: "Obirikiti nla kan dina enu bode ilu! Lo imo apere re lati yanju idanwo naa.",
    },
    topic: {
      en: "Shapes & Geometry",
      ha: "Siffofi da Dabarunsu",
      ig: "Udidi na Nhazi",
      yo: "Apere ati Isiro Apere",
    },
    thumbnail: "/assets/kids/episode_2.png",
    status: "available",
    badge: "Episode 2",
    youtubeId: "L_LUpnjgPso",
    questions: [
      {
        id: "q-2-1",
        question: {
          en: "How many sides does a triangle have?",
          ha: "Kusurwoyi ko gefuna nawa alwatika (triangle) yake da su?",
          ig: "Akuku ole ka triangle nwere?",
          yo: "Egbé melo ni onigun-meta (triangle) ni?",
        },
        options: {
          en: ["2 Sides", "3 Sides", "4 Sides", "5 Sides"],
          ha: ["Gefuna 2", "Gefuna 3", "Gefuna 4", "Gefuna 5"],
          ig: ["Akuku 2", "Akuku 3", "Akuku 4", "Akuku 5"],
          yo: ["Egbé 2", "Egbé 3", "Egbé 4", "Egbé 5"],
        },
        correctOptionIndex: 1,
        explanation: {
          en: "A triangle always has exactly 3 sides and 3 corners!",
          ha: "Alwatika ko da yaushe yana da gefuna 3 da kusurwoyi 3!",
          ig: "Triangle na-enwe akuku 3 na nkuku 3 mgbe nile!",
          yo: "Onigun-meta maa n ni egbé meta ati igun meta!",
        },
      },
    ],
  },
  {
    id: 3,
    episodeNumber: 3,
    title: {
      en: "Number Jungle Expedition",
      ha: "Kirga a Dajin Lissafi",
      ig: "Igu Onuogugu n'ime Ohia",
      yo: "Kika Awon Nomba ninu Igbo",
    },
    desc: {
      en: "Trek through the lush canopy and count playful monkeys, parrots, and coconuts from 1 to 20.",
      ha: "Yi tafiya cikin daji don kirga birrai, tsuntsaye, da kwakwar man ja daga 1 zuwa 20.",
      ig: "Gaa njem n'ime ohia ma guo enwe, nnunu, na aku oyibo site na 1 rue 20.",
      yo: "Rin irin ajo ninu igbo lati ka awon obo, eye, ati agbon lati 1 si 20.",
    },
    topic: {
      en: "Counting 1 to 20",
      ha: "Kirga 1 zuwa 20",
      ig: "Igu 1 rue 20",
      yo: "Kika 1 si 20",
    },
    thumbnail: "/assets/kids/episode_3.png",
    status: "available",
    badge: "Episode 3",
    youtubeId: "dQw4w9WgXcQ",
    questions: [
      {
        id: "q-3-1",
        question: {
          en: "How many fingers do you have on two hands?",
          ha: "Yatsun hannu nawa kake da su a hannaye biyu?",
          ig: "Mkpisi aka ole ka i nwere n'aka abuo gi?",
          yo: "Ika melo lo wa ni owo re mejeeji?",
        },
        options: {
          en: ["5 Fingers", "10 Fingers", "15 Fingers", "20 Fingers"],
          ha: ["Yatsu 5", "Yatsu 10", "Yatsu 15", "Yatsu 20"],
          ig: ["Mkpisi aka 5", "Mkpisi aka 10", "Mkpisi aka 15", "Mkpisi aka 20"],
          yo: ["Ika 5", "Ika 10", "Ika 15", "Ika 20"],
        },
        correctOptionIndex: 1,
        explanation: {
          en: "You have 5 fingers on each hand, making 10 fingers in total!",
          ha: "Kuna da yatsu 5 a kowane hannu, wanda ya zama yatsu 10 gaba daya!",
          ig: "I nwere mkpisi aka 5 n'aka nke o bula, na-eme mkpisi aka 10 na ngụkọta!",
          yo: "O ni ika 5 ni owo kookan, eyi ti o je ika 10 lapapo!",
        },
      },
    ],
  },
];

const LANGUAGES = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "ha", label: "Hausa", nativeName: "Harshen Hausa" },
  { code: "ig", label: "Igbo", nativeName: "Asusu Igbo" },
  { code: "yo", label: "Yoruba", nativeName: "Ede Yoruba" },
];

export default function KidsEpisodesPage() {
  const [activeLang, setActiveLang] = useState<KidLanguage>("en");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [activeStage, setActiveStage] = useState<"video" | "quiz" | "result">("video");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScores, setQuizScores] = useState<Record<number, number>>({ 1: 100 });
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>([1]);
  const [totalStars, setTotalStars] = useState(3);

  const handleOpenQuiz = (ep: Episode) => {
    setSelectedEpisode(ep);
    setActiveStage("video");
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (!selectedEpisode) return;
    const questions = selectedEpisode.questions;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setActiveStage("result");
      setCompletedEpisodes((prev) => Array.from(new Set([...prev, selectedEpisode.id])));
      setQuizScores((prev) => ({ ...prev, [selectedEpisode.id]: 100 }));
      setTotalStars((prev) => prev + 3);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header & Language Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                100% Free & Open Learning (No Paywall)
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {totalStars} Stars Earned
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 underline decoration-yellow-400 decoration-8 underline-offset-4">
              Watch & Learn
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Explore animated lessons in English, Hausa, Igbo, and Yoruba with interactive comprehension quizzes.
            </p>
          </div>

          {/* 4-Language Selector Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-2 rounded-2xl border border-gray-200">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setActiveLang(l.code as KidLanguage)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeLang === l.code
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {EPISODES.map((ep) => {
            const isCompleted = completedEpisodes.includes(ep.id);
            const score = quizScores[ep.id];
            return (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative rounded-3xl bg-white border-2 border-pink-100 hover:border-pink-300 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <Image
                      src={ep.thumbnail}
                      alt={ep.title[activeLang] || ep.title.en}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <div className="text-white">
                        <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-1.5 inline-block">
                          {ep.topic[activeLang] || ep.topic.en}
                        </span>
                        <h3 className="text-lg font-black">{ep.title[activeLang] || ep.title.en}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-bold text-pink-600">{ep.badge}</span>
                      {isCompleted && score && (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {score}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ep.desc[activeLang] || ep.desc.en}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenQuiz(ep)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isCompleted ? "Rewatch & Quiz" : "Watch & Take Quiz"}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lesson & Quiz Interactive Modal */}
        {selectedEpisode && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-200 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-pink-50/50">
                <div>
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                    Episode {selectedEpisode.episodeNumber} • {selectedEpisode.topic[activeLang] || selectedEpisode.topic.en}
                  </span>
                  <h3 className="text-lg font-black text-gray-900">
                    {selectedEpisode.title[activeLang] || selectedEpisode.title.en}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEpisode(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stage 1: Video Lesson Player */}
              {activeStage === "video" && (
                <div className="p-6 space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${selectedEpisode.youtubeId}`}
                      title={selectedEpisode.title.en}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedEpisode.desc[activeLang] || selectedEpisode.desc.en}
                  </p>

                  <button
                    onClick={() => setActiveStage("quiz")}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-base transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>I Finished Watching! Take Quiz</span>
                  </button>
                </div>
              )}

              {/* Stage 2: Post-Lesson Interactive Quiz */}
              {activeStage === "quiz" && (
                <div className="p-6 space-y-6">
                  {(() => {
                    const q = selectedEpisode.questions[currentQuestionIndex];
                    if (!q) return null;
                    const questionText = q.question[activeLang] || q.question.en;
                    const optionsList = q.options[activeLang] || q.options.en;
                    const explanation = q.explanation[activeLang] || q.explanation.en;

                    return (
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
                          <span>
                            Question {currentQuestionIndex + 1} of {selectedEpisode.questions.length}
                          </span>
                          <span className="text-emerald-600">{activeLang.toUpperCase()} Track</span>
                        </div>

                        <h4 className="text-xl font-black text-gray-900 mb-4">{questionText}</h4>

                        <div className="space-y-3 mb-6">
                          {optionsList.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === q.correctOptionIndex;
                            let btnClasses = "w-full p-4 rounded-2xl border-2 text-left font-bold text-sm transition flex items-center justify-between ";

                            if (selectedOption !== null) {
                              if (isCorrect) {
                                btnClasses += "border-green-500 bg-green-50 text-green-800";
                              } else if (isSelected && !isCorrect) {
                                btnClasses += "border-red-500 bg-red-50 text-red-800";
                              } else {
                                btnClasses += "border-gray-200 bg-gray-50 opacity-50";
                              }
                            } else {
                              btnClasses += "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-gray-800";
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectOption(idx)}
                                disabled={selectedOption !== null}
                                className={btnClasses}
                              >
                                <span>{opt}</span>
                                {selectedOption !== null && isCorrect && (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                )}
                                {selectedOption !== null && isSelected && !isCorrect && (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {selectedOption !== null && (
                          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                            <p className="text-xs font-bold text-blue-900">{explanation}</p>
                            <button
                              onClick={handleNextQuestion}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                            >
                              <span>
                                {currentQuestionIndex === selectedEpisode.questions.length - 1
                                  ? "See Quiz Results"
                                  : "Next Question"}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Stage 3: Quiz Result Celebration */}
              {activeStage === "result" && (
                <div className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Awesome Job, Explorer!</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    You completed the quiz for Episode {selectedEpisode.episodeNumber} in {activeLang.toUpperCase()} and earned 3 stars!
                  </p>
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} className="w-8 h-8 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedEpisode(null)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Collect Stars & Continue Adventure</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
