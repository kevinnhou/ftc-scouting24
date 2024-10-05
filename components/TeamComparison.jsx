"use client";

import { useState, useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewComparison from "@/components/OverviewComparison";
import AutonomousComparison from "@/components/AutonomousComparison";
import TeleopComparison from "@/components/TeleopComparison";
import EndgameComparison from "@/components/EndgameComparison";
import { calculateScores } from "@/lib/dashboardManager";

export default function TeamComparison({ teamData, currentTeam }) {
  const [comparisonTeam, setComparisonTeam] = useState("");

  const currentTeamData = useMemo(
    () => teamData.filter((team) => team.teamNumber.toString() === currentTeam),
    [teamData, currentTeam]
  );
  const comparisonTeamData = useMemo(
    () =>
      teamData.filter((team) => team.teamNumber.toString() === comparisonTeam),
    [teamData, comparisonTeam]
  );

  function getAverageMetrics(data) {
    if (data.length === 0) return {};
    const metrics = data.reduce((acc, match) => {
      const scores = calculateScores(match);
      Object.keys(scores).forEach((key) => {
        acc[key] = (acc[key] || 0) + scores[key];
      });
      return acc;
    }, {});

    Object.keys(metrics).forEach((key) => {
      metrics[key] = metrics[key] / data.length;
    });

    metrics.averageCycleTime =
      data.reduce((sum, match) => {
        const cycleTimes = match.teleopCycleTimes || [];
        return (
          sum + cycleTimes.reduce((a, b) => a + b, 0) / (cycleTimes.length || 1)
        );
      }, 0) / data.length;

    return metrics;
  }

  const currentTeamMetrics = useMemo(
    () => getAverageMetrics(currentTeamData),
    [currentTeamData]
  );
  const comparisonTeamMetrics = useMemo(
    () => getAverageMetrics(comparisonTeamData),
    [comparisonTeamData]
  );

  const chartConfig = useMemo(
    () => ({
      [currentTeam]: {
        label: `Team ${currentTeam}`,
        color: "hsl(var(--chart-1))",
      },
      [comparisonTeam]: {
        label: `Team ${comparisonTeam}`,
        color: "hsl(var(--chart-2))",
      },
    }),
    [currentTeam, comparisonTeam]
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6 pt-10">
        <h1 className="text-3xl font-bold">Team Comparison</h1>
        <div className="flex items-center space-x-2">
          <Select value={comparisonTeam} onValueChange={setComparisonTeam}>
            <SelectTrigger className="w-[100px] min-[425px]:w-[200px] sm:w-full ml-4">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              {teamData
                .filter((team) => team.teamNumber.toString() !== currentTeam)
                .map((team) => (
                  <SelectItem
                    key={team.teamNumber}
                    value={team.teamNumber.toString()}
                  >
                    Team {team.teamNumber} - {team.teamName || "Unknown"}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {comparisonTeam && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="auto">Auto</TabsTrigger>
            <TabsTrigger value="teleop">Teleop</TabsTrigger>
            <TabsTrigger value="endgame">Endgame</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewComparison
              currentTeam={currentTeam}
              comparisonTeam={comparisonTeam}
              currentTeamMetrics={currentTeamMetrics}
              comparisonTeamMetrics={comparisonTeamMetrics}
              chartConfig={chartConfig}
            />
          </TabsContent>
          <TabsContent value="auto">
            <AutonomousComparison
              currentTeamData={currentTeamData}
              comparisonTeamData={comparisonTeamData}
              currentTeam={currentTeam}
              comparisonTeam={comparisonTeam}
              chartConfig={chartConfig}
            />
          </TabsContent>
          <TabsContent value="teleop">
            <TeleopComparison
              currentTeamData={currentTeamData}
              comparisonTeamData={comparisonTeamData}
              currentTeam={currentTeam}
              comparisonTeam={comparisonTeam}
              currentTeamMetrics={currentTeamMetrics}
              comparisonTeamMetrics={comparisonTeamMetrics}
              chartConfig={chartConfig}
            />
          </TabsContent>
          <TabsContent value="endgame">
            <EndgameComparison
              currentTeamData={currentTeamData}
              comparisonTeamData={comparisonTeamData}
              currentTeam={currentTeam}
              comparisonTeam={comparisonTeam}
              chartConfig={chartConfig}
            />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
