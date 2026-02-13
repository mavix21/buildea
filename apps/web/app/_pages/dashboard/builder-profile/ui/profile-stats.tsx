import {
  IconFlame,
  IconMedal,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@buildea/ui/components/avatar";
import { Card, CardContent, CardHeader } from "@buildea/ui/components/card";

interface ProfileStatsProps {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  badgesCount: number;
  dayStreak: number;
  level: number;
  totalXp: number;
  rank: string | null;
}

export function ProfileStats({
  name,
  username,
  avatarUrl,
  badgesCount,
  dayStreak,
  level,
  totalXp,
  rank,
}: ProfileStatsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{username ?? name}</p>
            <p className="text-muted-foreground text-xs">Nivel {level}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={<IconSparkles className="text-primary size-8" />}
            value={totalXp}
            label="XP Total"
          />
          <StatItem
            icon={<IconTrophy className="size-8 text-amber-600" />}
            value={rank ?? "Sin rango"}
            label="Rango"
          />
          <StatItem
            icon={<IconMedal className="size-8 text-blue-500" />}
            value={badgesCount}
            label="Insignias"
          />
          <StatItem
            icon={<IconFlame className="size-8 text-orange-500" />}
            value={dayStreak}
            label="Días seguidos"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="space-y-1">
        <p className="font-pixel text-xs font-semibold">{value}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
    </div>
  );
}
