export function ChartPanel({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / Math.max(max - min, 0.001)) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 140 }}>
      <defs>
        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.5)" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0.03)" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="rgba(56,189,248,0.95)" strokeWidth="2" points={points} />
      <polyline fill="url(#chartGradient)" stroke="none" points={`0,100 ${points} 100,100`} />
    </svg>
  );
}
