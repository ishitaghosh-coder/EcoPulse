import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MOCK_RESPONSES = {
  en: [
    "Stadium systems are operating at 94% efficiency. North Concourse HVAC has been optimized for the current 68,000 fan capacity.",
    "Current sustainability score: 87/100. Solar panels are generating 42% of stadium power. Excellent conditions today!",
    "I'm monitoring 5 sectors in real time. The Pitch Zone temperature is 22°C — ideal for play. No safety alerts active.",
  ],
  es: [
    "Los sistemas del estadio funcionan al 94% de eficiencia. El sistema HVAC del Concourse Norte ha sido optimizado.",
    "Puntuación de sostenibilidad actual: 87/100. Los paneles solares generan el 42% de la energía del estadio.",
    "Monitoreo 5 sectores en tiempo real. La temperatura en la Zona del Campo es de 22°C — ideal para el juego.",
  ],
  fr: [
    "Les systèmes du stade fonctionnent à 94% d'efficacité. La CVC du Concourse Nord a été optimisée.",
    "Score de durabilité actuel: 87/100. Les panneaux solaires génèrent 42% de l'énergie du stade.",
    "Je surveille 5 secteurs en temps réel. La température en Zone Terrain est de 22°C — idéale pour jouer.",
  ],
  pt: [
    "Os sistemas do estádio operam com 94% de eficiência. O HVAC do Concourse Norte foi otimizado.",
    "Pontuação de sustentabilidade atual: 87/100. Os painéis solares geram 42% da energia do estádio.",
    "Monitoro 5 setores em tempo real. A temperatura na Zona do Campo é de 22°C — ideal para o jogo.",
  ],
  ar: [
    "تعمل أنظمة الاستاد بكفاءة 94٪. تم تحسين نظام التكييف لشعبة الشمال.",
    "نقاط الاستدامة الحالية: 87/100. تولد الألواح الشمسية 42٪ من طاقة الاستاد.",
    "أراقب 5 قطاعات في الوقت الفعلي. درجة الحرارة في منطقة الملعب 22 درجة مئوية — مثالية للعب.",
  ],
};

export async function POST(req) {
  try {
    const { message, language = 'en', context = '' } = await req.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_')) {
      // Mock mode
      const replies = MOCK_RESPONSES[language] || MOCK_RESPONSES.en;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      return NextResponse.json({ reply });
    }

    const langNames = { en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese', ar: 'Arabic' };
    const langName = langNames[language] || 'English';

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are EcoPulse AI, the intelligent assistant for the FIFA World Cup stadium operations system. 
You help stadium staff, organizers, and officials with: sustainability metrics, crowd management, HVAC controls, 
safety alerts, energy optimization, and operational queries. You have access to live telemetry from 5 stadium sectors:
North Concourse, South Concourse, East Concourse, West Concourse, and Pitch Zone.
IMPORTANT: Always respond in ${langName}. Be concise, professional, and helpful.
Current context: ${context || 'Stadium operational, match in progress.'}`;

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser question: ${message}`);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ reply: 'EcoPulse AI is momentarily offline. Please try again shortly.' }, { status: 200 });
  }
}
