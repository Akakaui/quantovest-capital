export default function SkeletonRows({ rows = 3, height = 'h-24' }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`rounded-2xl bg-[#151E23] border border-[#2B393F] ${height} animate-pulse`} />
      ))}
    </div>
  );
}