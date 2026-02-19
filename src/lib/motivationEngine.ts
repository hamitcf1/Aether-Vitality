const QUOTES = [
    { text: "The only bad workout is the one that didn't happen.", author: 'Unknown' },
    { text: 'Take care of your body. It\'s the only place you have to live.', author: 'Jim Rohn' },
    { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
    { text: 'Your body hears everything your mind says. Stay positive.', author: 'Unknown' },
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    { text: 'The groundwork for all happiness is good health.', author: 'Leigh Hunt' },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: 'Confucius' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
    { text: "Don't stop when you're tired. Stop when you're done.", author: 'Unknown' },
    { text: 'Strive for progress, not perfection.', author: 'Unknown' },
    { text: 'A healthy outside starts from the inside.', author: 'Robert Urich' },
    { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Unknown' },
    { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
    { text: 'Your health is an investment, not an expense.', author: 'Unknown' },
    { text: 'You don\'t have to be extreme, just consistent.', author: 'Unknown' },
    { text: 'One workout at a time. One meal at a time. One day at a time.', author: 'Unknown' },
    { text: 'The greatest wealth is health.', author: 'Virgil' },
    { text: 'When you feel like quitting, remember why you started.', author: 'Unknown' },
    { text: 'Good things come to those who sweat.', author: 'Unknown' },
    { text: 'Make yourself a priority. You deserve it.', author: 'Unknown' },
    { text: 'Believe in yourself and all that you are.', author: 'Christian D. Larson' },
    { text: 'You are stronger than you think.', author: 'Unknown' },
    { text: 'Every step is progress, no matter how small.', author: 'Unknown' },
    { text: 'Eat clean. Stay lean. Live like a king.', author: 'Unknown' },
    { text: 'Hydrate. Motivate. Dominate.', author: 'Unknown' },
    { text: 'Your future self will thank you.', author: 'Unknown' },
    { text: 'Nothing tastes as good as healthy feels.', author: 'Unknown' },
    { text: 'Health is not about the weight you lose, but about the life you gain.', author: 'Unknown' },
    { text: 'Respect your body enough to fuel it properly.', author: 'Unknown' },
    { text: 'The best project you\'ll ever work on is you.', author: 'Unknown' },
    { text: 'Winners train, losers complain.', author: 'Unknown' },
    { text: 'Fall in love with taking care of yourself.', author: 'Unknown' },
    { text: 'Push harder than yesterday if you want a different tomorrow.', author: 'Unknown' },
    { text: 'Sweat is fat crying.', author: 'Unknown' },
    { text: 'The only limit is the one you set yourself.', author: 'Unknown' },
    { text: 'A champion is someone who gets up when they can\'t.', author: 'Jack Dempsey' },
    { text: 'Your only limit is you.', author: 'Unknown' },
    { text: 'Be patient with yourself. Transformation is not an event — it\'s a process.', author: 'Unknown' },
    { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
    { text: 'Every meal is a choice. Make it count.', author: 'Unknown' },
];

/**
 * Get the daily motivational quote based on the current date.
 * Rotates through all quotes deterministically.
 */
export function getDailyQuote(): { text: string; author: string } {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
}

/**
 * Get a random motivational quote.
 */
export function getRandomQuote(): { text: string; author: string } {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

/**
 * Get milestone celebration message.
 */
export function getMilestoneMessage(type: string, value: number): string {
    const messages: Record<string, Record<number, string>> = {
        streak: {
            3: '🔥 3-day streak! You\'re building momentum!',
            7: '💎 One whole week! Your dedication shines!',
            14: '🌟 Two weeks strong! Unstoppable!',
            30: '👑 One month of pure commitment! Legendary!',
            60: '⚡ 60 days! You\'re a force of nature!',
            100: '🏆 100 days! Absolute champion!',
        },
        water: {
            7: '💧 7 days fully hydrated! Your body thanks you!',
            30: '🌊 30 days of hydration mastery!',
        },
        weight: {
            1: '📉 First kg down! Great start!',
            5: '🎯 5 kg milestone! Keep pushing!',
            10: '🏅 10 kg lost! Incredible transformation!',
        },
        steps: {
            10000: '👟 10K steps in a day! Walking champion!',
            50000: '🚶 50K total steps logged!',
        },
    };

    const typeMessages = messages[type];
    if (!typeMessages) return `🎉 Amazing progress with ${type}!`;

    // Find the closest milestone at or below the current value
    const milestones = Object.keys(typeMessages).map(Number).sort((a, b) => b - a);
    const milestone = milestones.find((m) => value >= m);
    return milestone ? typeMessages[milestone] : `🎉 Great progress with ${type}!`;
}
