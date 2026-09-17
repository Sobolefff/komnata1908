export const reachGoal = (goal) => {
    if (typeof window.ym === 'function') {
        window.ym(90093500, 'reachGoal', goal);
    }
};
