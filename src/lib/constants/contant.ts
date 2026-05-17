export const AI_RESPONSES: Record<string, string[]> = {
  overwhelmed: [
    "That sounds like a lot to carry. What's been feeling the heaviest lately?",
    "Overwhelm usually means we're carrying more than we should alone. What's taking up the most space right now?",
  ],
  anxiety: [
    "Anxiety can feel so loud sometimes. Take a breath — what's it telling you right now?",
    "You're not your anxiety. It's just a feeling, and feelings pass. What's triggered it today?",
  ],
  sleep: [
    "Sleep struggles are exhausting in themselves. Is it your mind racing, or just restlessness?",
    "Rest is so important. What's keeping you up?",
  ],
  sad: [
    "It's okay to feel sad. You don't have to explain it or fix it right now. What's going on?",
    "Sadness deserves space, not suppression. I'm here. Tell me more.",
  ],
  lonely: [
    "Loneliness is heavy. But you reached out, and that matters. What's making you feel alone?",
    "You are not alone in this moment. I'm here. What's been making you feel disconnected?",
  ],
  motivation: [
    "Sometimes the smallest step forward is still a step. What's one tiny thing you could do right now?",
    "Motivation follows action — not the other way around. What's been holding you back?",
  ],
  default: [
    "I'm here with you. What's been on your mind today?",
    "This is a safe space — no judgment, no rush. What would you like to talk about?",
    "Sometimes just putting it into words helps. I'm listening.",
  ],
}


export const QUICK_PROMPTS = [
  "I feel overwhelmed", "I'm anxious today",
  "I can't sleep", "I feel sad",
  "I feel lonely", "I need motivation",
]


export const MEDITATE_STEPS = [
  { label: "Settle in", instruction: "Find a comfortable position. Let your hands rest gently in your lap.", duration: 8 },
  { label: "Breathe in", instruction: "Inhale slowly through your nose for 4 counts.", duration: 4 },
  { label: "Hold", instruction: "Hold gently at the top. Soft and easy.", duration: 4 },
  { label: "Breathe out", instruction: "Exhale slowly through your mouth for 6 counts. Let everything go.", duration: 6 },
  { label: "Rest", instruction: "Sit with the stillness for a moment. Notice how you feel.", duration: 4 },
]








export const randFrom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export const QUOTES = [
  { text: "The only way out is through.", author: "Robert Frost", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", feeling: { symbol: "💙", label: "Seen" } },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Rock bottom became the solid foundation on which I rebuilt my life.", author: "J.K. Rowling", feeling: { symbol: "💙", label: "Seen" } },
  { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "C.S. Lewis", feeling: { symbol: "💙", label: "Seen" } },
  { text: "It's okay to not be okay — as long as you don't give up.", author: "Unknown", feeling: { symbol: "💙", label: "Seen" } },
  { text: "One day at a time. One step at a time.", author: "Unknown", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Every storm runs out of rain.", author: "Maya Angelou", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Life is not about waiting for the storm to pass, but learning to dance in the rain.", author: "Vivian Greene", feeling: { symbol: "💙", label: "Seen" } },
  { text: "This too shall pass.", author: "Persian Proverb", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Owning our story can be hard, but not nearly as difficult as spending our lives running from it.", author: "Brené Brown", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Your journey has molded you for your greater good, and it was exactly what it needed to be.", author: "Asha Tyson", feeling: { symbol: "💙", label: "Seen" } },
  { text: "What doesn't kill me makes me stronger.", author: "Friedrich Nietzsche", feeling: { symbol: "💙", label: "Seen" } },
  { text: "The human spirit is stronger than anything that can happen to it.", author: "C.C. Scott", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller", feeling: { symbol: "💙", label: "Seen" } },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Every day may not be good, but there is something good in every day.", author: "Alice Morse Earle", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Out of difficulties grow miracles.", author: "Jean de La Bruyère", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Stars can't shine without darkness.", author: "Unknown", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Even a tiny star shines in the darkness.", author: "Finnish Proverb", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "The most beautiful thing you can do is bloom where you are planted.", author: "Unknown", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Tomorrow is a new day with no mistakes in it yet.", author: "L.M. Montgomery", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "Hope is the thing with feathers that perches in the soul.", author: "Emily Dickinson", feeling: { symbol: "✨", label: "Hopeful" } },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "You have survived 100% of your worst days so far.", author: "Unknown", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.", author: "Unknown", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "The comeback is always stronger than the setback.", author: "Unknown", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "I can be changed by what happens to me, but I refuse to be reduced by it.", author: "Maya Angelou", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "Be proud of yourself for how far you have come and never stop pushing to achieve even more.", author: "Unknown", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "Challenges are what make life interesting; overcoming them is what makes life meaningful.", author: "Joshua J. Marine", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "The human capacity for burden is like bamboo — far more flexible than you'd ever believe at first glance.", author: "Jodi Picoult", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "You never know how strong you are until being strong is your only choice.", author: "Bob Marley", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "Strength grows in the moments when you think you can't go on but you keep going anyway.", author: "Unknown", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt", feeling: { symbol: "🔥", label: "Strong" } },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "You are not what happened to you. You are who you choose to become.", author: "Carl Jung", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "Small steps still move you forward.", author: "Unknown", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "Progress, not perfection.", author: "Unknown", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "You grow through what you go through.", author: "Unknown", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "We delight in the beauty of the butterfly, but rarely admit the changes it has gone through to achieve that beauty.", author: "Maya Angelou", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "Every flower must grow through dirt.", author: "Laurie Jean Sennott", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "What you are is what you have been. What you'll be is what you do now.", author: "Buddha", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "Each day provides its own gifts.", author: "Marcus Aurelius", feeling: { symbol: "🌱", label: "Growing" } },
  { text: "Courage doesn't always roar. Sometimes it's the quiet voice at the end of the day saying, 'I will try again tomorrow.'", author: "Mary Anne Radmacher", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr.", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "The bravest thing I ever did was continuing my life when I wanted to die.", author: "Juliette Lewis", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "Sometimes the bravest and most important thing you can do is just show up.", author: "Brené Brown", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "Vulnerability is not winning or losing; it's having the courage to show up when you can't control the outcome.", author: "Brené Brown", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "Breathe. It's just a bad day, not a bad life.", author: "Unknown", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "It takes courage to grow up and become who you really are.", author: "E.E. Cummings", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt", feeling: { symbol: "🦋", label: "Brave" } },
  { text: "You are enough, just as you are.", author: "Meghan Markle", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You are worthy of love and belonging.", author: "Brené Brown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "Be gentle with yourself — you are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You matter. Your story matters. Your voice matters.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "Your value doesn't decrease based on someone's inability to see your worth.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You deserve the love you keep trying to give everyone else.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You are worthy of taking up space.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "Speak kindly to yourself. You are always listening.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You are not a burden. You are a human being worthy of support.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "What makes you different or weird — that's your strength.", author: "Meryl Streep", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You are more than enough, more than worthy, and more than deserving.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "You are enough. You have always been enough.", author: "Unknown", feeling: { symbol: "💛", label: "Worthy" } },
  { text: "Healing is not linear. Every step forward counts, no matter how small.", author: "Unknown", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "The wound is the place where the light enters you.", author: "Rumi", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr.", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.", author: "Unknown", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "You are not alone in this.", author: "Unknown", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "It's okay to take things one minute at a time.", author: "Unknown", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "You are not broken. You are breaking through.", author: "Alex Myles", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "It's okay to ask for help. Strength isn't always silence.", author: "Unknown", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "Nothing in nature blooms all year. Be patient with yourself.", author: "Unknown", feeling: { symbol: "🌿", label: "Healing" } },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated. Having feelings doesn't make you a negative person — it makes you human.", author: "Lori Deschene", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "There is no shame in asking for help. It is one of the bravest things you can do.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Just because no one else can heal or do your inner work for you doesn't mean you can, should, or need to do it alone.", author: "Lisa Olivera", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Your feelings are valid. Your pain is real. And you deserve support.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "It's okay to not have it all figured out. None of us do.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Mental health is not a luxury — it's a necessity.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Caring for your mental health is an act of radical self-love.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "You are allowed to be a work in progress and still be worthy of love and belonging.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Be patient with yourself. Self-growth is tender; it's holy ground. There's no greater investment.", author: "Stephen Covey", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.", author: "Etty Hillesum", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Give yourself the same compassion you would give a good friend.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "You owe yourself the love that you so freely give to other people.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
  { text: "Seeking help is a sign of strength, not weakness. Your mental health matters.", author: "Unknown", feeling: { symbol: "💭", label: "Thinking" } },
];

export const FEELING_OPTIONS = [
  { symbol: "💙", label: "Seen" },
  { symbol: "✨", label: "Hopeful" },
  { symbol: "🔥", label: "Strong" },
  { symbol: "🌱", label: "Growing" },
  { symbol: "🦋", label: "Brave" },
  { symbol: "💛", label: "Worthy" },
  { symbol: "🌿", label: "Healing" },
  { symbol: "💭", label: "Thinking" },
];

export const AFFIRMATIONS = [
  "I am worthy of love and care, especially from myself.",
  "This moment is hard, but I have survived hard moments before.",
  "My feelings are valid, and I am allowed to feel them.",
  "I am doing the best I can, and that is enough.",
]