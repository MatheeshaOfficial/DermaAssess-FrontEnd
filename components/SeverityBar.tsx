import clsx from "clsx"

interface SeverityBarProps {
  score: number // 1 to 10
  label?: string
}

export default function SeverityBar({ score, label = "AI Severity Score" }: SeverityBarProps) {
  const clampedScore = Math.max(1, Math.min(10, score))
  const percentage = (clampedScore / 10) * 100

  let colorClass = "bg-green-500"
  let textColor = "text-green-600"
  let bgTrack = "bg-green-100"

  if (clampedScore >= 4 && clampedScore <= 6) {
    colorClass = "bg-amber-500"
    textColor = "text-amber-600"
    bgTrack = "bg-amber-100"
  } else if (clampedScore >= 7) {
    colorClass = "bg-red-500"
    textColor = "text-red-600"
    bgTrack = "bg-red-100"
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={clsx("text-2xl font-black leading-none", textColor)}>
          {clampedScore}
          <span className="text-sm text-gray-400 font-medium ml-1">/10</span>
        </span>
      </div>
      <div className={clsx("w-full h-3 rounded-full overflow-hidden", bgTrack)}>
        <div 
          className={clsx("h-full rounded-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
