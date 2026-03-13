/**
 * DIBA FBC - Public Stats Feature
 */
import { supabase } from '../../core/supabase.js';

export async function initStatsCounter() {
    const statsSection = document.querySelector('.max-w-7xl');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            fetchAndAnimate();
            observer.disconnect();
        }
    }, { threshold: 0.1 });
    observer.observe(statsSection);
}

async function fetchAndAnimate() {
    const startYear = 2012;
    const currentYear = new Date().getFullYear();
    const yearsOfHistory = currentYear - startYear;
    const totalTrophies = 18; // Constant or fetched

    let totalPlayers = 0;
    try {
        const { count } = await supabase
            .from('identificacion')
            .select('*', { count: 'exact', head: true });
        totalPlayers = count || 0;
    } catch (e) {
        console.error("Stats fetch error:", e);
    }

    const map = {
        'stats-years': yearsOfHistory,
        'stats-trophies': totalTrophies,
        'stats-players': totalPlayers,
        'stats-commitment': 100
    };

    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) animateValue(el, 0, val, 2000);
    });
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}
