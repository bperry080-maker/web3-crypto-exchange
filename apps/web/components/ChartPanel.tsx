export function ChartPanel({ data }: { data: number[] }) {
  const values = data.length ? data : [0, 1];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
    const y = 90 - ((value - min) / Math.max(max - min, 0.001)) * 80;
    return `${x},${y}`;
  }).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 140 }} aria-label="Price chart"><polyline fill="none" stroke="#38bdf8" strokeWidth="2" points={points} /></svg>;
}