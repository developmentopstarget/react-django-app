import { useState } from 'react';

const stackCards = [
    {
        title: 'Authentication',
        description: 'Use the existing login and registration flow to reach protected app pages.',
        accent: 'from-indigo-500 via-blue-500 to-cyan-500',
        surface: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
        title: 'User-owned items',
        description: 'Create, search, update, and delete records attached to the active account.',
        accent: 'from-emerald-500 via-teal-500 to-cyan-500',
        surface: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
        title: 'Real-time chat',
        description: 'Open authenticated WebSocket chat with account message history.',
        accent: 'from-violet-500 via-fuchsia-500 to-rose-500',
        surface: 'bg-violet-50 dark:bg-violet-950/40',
    },
    {
        title: 'Dashboard hub',
        description: 'Move between account, items, and chat from one signed-in workspace.',
        accent: 'from-sky-500 via-indigo-500 to-violet-500',
        surface: 'bg-sky-50 dark:bg-sky-950/40',
    },
    {
        title: 'Search and notifications',
        description: 'Find app routes from the navbar and review account notifications when signed in.',
        accent: 'from-amber-500 via-orange-500 to-red-500',
        surface: 'bg-amber-50 dark:bg-amber-950/40',
    },
];

const getStackPosition = (index, activeIndex) => {
    const total = stackCards.length;
    const rawOffset = (index - activeIndex + total) % total;

    return rawOffset > total / 2 ? rawOffset - total : rawOffset;
};

export default function HomeCardStack() {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeCard = stackCards[activeIndex];

    const showPrevious = () => {
        setActiveIndex((currentIndex) =>
            currentIndex === 0 ? stackCards.length - 1 : currentIndex - 1,
        );
    };

    const showNext = () => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % stackCards.length);
    };

    return (
        <section
            className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900"
            aria-labelledby="home-card-stack-title"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        App flow
                    </p>
                    <h2
                        id="home-card-stack-title"
                        className="mt-1 text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        {activeCard.title}
                    </h2>
                </div>

                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={showPrevious}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                        aria-label="Show previous card"
                    >
                        <span aria-hidden="true">&lt;</span>
                    </button>
                    <button
                        type="button"
                        onClick={showNext}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                        aria-label="Show next card"
                    >
                        <span aria-hidden="true">&gt;</span>
                    </button>
                </div>
            </div>

            <div className="relative mt-5 h-72 overflow-hidden sm:h-80">
                {stackCards.map((card, index) => {
                    const offset = getStackPosition(index, activeIndex);
                    const isActive = offset === 0;
                    const isVisible = Math.abs(offset) <= 2;
                    const rotate = offset * 7;
                    const translateX = offset * 32;
                    const translateY = Math.abs(offset) * 16;
                    const scale = 1 - Math.abs(offset) * 0.07;

                    return (
                        <article
                            key={card.title}
                            aria-hidden={!isActive}
                            className={[
                                'absolute left-1/2 top-2 h-60 w-[78%] max-w-[18rem] -translate-x-1/2 rounded-lg border border-white/70 p-5 shadow-lg transition-all duration-300 ease-out motion-reduce:transition-none dark:border-white/10 sm:top-4 sm:h-64',
                                card.surface,
                                isVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
                                isActive ? 'z-30' : 'z-10',
                            ].join(' ')}
                            style={{
                                transform: `translateX(calc(-50% + ${translateX}px)) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                            }}
                        >
                            <div className={`h-24 rounded-md bg-gradient-to-br ${card.accent}`}>
                                <div className="flex h-full items-end justify-between p-4">
                                    <span className="h-10 w-10 rounded-full bg-white/90 shadow-sm" />
                                    <span className="h-3 w-20 rounded-full bg-white/70" />
                                </div>
                            </div>

                            <div className="mt-5">
                                <h3 className="text-xl font-semibold text-gray-950 dark:text-white">
                                    {card.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                    {card.description}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2" aria-label="Choose carousel card">
                {stackCards.map((card, index) => (
                    <button
                        key={card.title}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={[
                            'h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 motion-reduce:transition-none dark:focus:ring-offset-gray-900',
                            index === activeIndex
                                ? 'w-7 bg-indigo-600 dark:bg-indigo-400'
                                : 'w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500',
                        ].join(' ')}
                        aria-label={`Show ${card.title} card`}
                        aria-current={index === activeIndex ? 'true' : undefined}
                    />
                ))}
            </div>
        </section>
    );
}
