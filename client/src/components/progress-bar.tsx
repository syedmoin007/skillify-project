import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  skill: {
    id: number;
    skillId: number;
    level: string;
  };
  progress: number;
}

export default function ProgressBar({ skill, progress }: ProgressBarProps) {
  const getProgressColor = () => {
    if (progress >= 75) return "bg-primary";
    if (progress >= 50) return "bg-secondary";
    if (progress >= 25) return "bg-accent";
    return "bg-gray-400";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">
          Skill #{skill.skillId}
        </span>
        <span className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
