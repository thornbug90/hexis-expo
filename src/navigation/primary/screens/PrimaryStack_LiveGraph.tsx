import {
  addHours,
  addMinutes,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMinute,
  roundToNearestMinutes,
  startOfDay,
  subHours,
  subMinutes,
} from "date-fns";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import React, { useEffect, useState } from "react";
import {
  Background,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryZoomContainer,
} from "victory-native";
import { Dimensions, SafeAreaView, View } from "react-native";
import Wrapper from "../../../components/shared/Wrapper";
import tw from "../../../lib/tw";
import {
  getLiteralDateString,
  getLiteralTime,
  parseTime,
  setLiteralDateTime,
} from "../../../utils/date";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { PrimaryStackParamsList } from "../PrimaryStack";
import useAppDate from "../../../hooks/useAppDate";
import useGraph from "../../../hooks/useGraph";
import Loading from "../../../components/shared/LoadingScreen";
import useDay from "../../../hooks/useDay";
import LiveGraphHeader from "../../../components/liveGraph/LiveGraphHeader";
import DayCarbCodes from "../../../components/liveGraph/DayCarbCodes";
import DayLargest from "../../../components/liveGraph/DayLargest";
import NoData from "../../../components/shared/NoData";
import { G } from "react-native-svg";
import activities from "../../../lib/activities";
import EndOfDay from "../../../components/liveGraph/EndOfDay";
import TargetIcon from "../../../components/icons/general/TargetIcon";
import Legend from "../../../components/liveGraph/Legend";
import { Meal_Type, Workout_Status } from "../../../generated/graphql";
import useInterval from "../../../hooks/useInterval";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const LabelComponent = (props: any) => {
  const Icon = activities[props.activityId as keyof typeof activities].icon;

  return (
    <G
      {...props}
      y={props.scale.y(props.biggest + 400)}
      x={props.scale.x(props.midpoint) - 10}
    >
      <Icon color={tw.color("activeblue-100")} height={35} width={35} />
    </G>
  );
};

const TheoreticalEndComponent = (props: any) => {
  return (
    <G {...props} y={props.y - 15}>
      <TargetIcon width={30} height={30} color="white" />
    </G>
  );
};

const { width } = Dimensions.get("screen");

type Props = MaterialTopTabScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_LiveGraphScreen"
>;

const PrimaryStack_LiveGraphScreen: React.FC<Props> = () => {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [appDate] = useAppDate();
  const [kcalDomain, setKcalDomain] = useState([-1000, 1000]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [tickValues, setTickValues] = useState<Date[]>([]);
  const [biggestSurplus, setBiggestSurplus] = useState({ data: 0 });
  const [biggestDeficit, setBiggestDeficit] = useState({ data: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  let appDateZ = new Date(`${appDate.toISOString().replace("Z", "")}`);

  // Data fetching
  const {
    data: liveGraphData,
    loading: liveGraphLoading,
    refetch: graphRefetch,
  } = useGraph();
  const { data: day, loading: dayLoading, refetch } = useDay();
  const liveGraph = liveGraphData?.graph;

  const isCurrentDay =
    format(new Date(), "yyyy-MM-dd") === format(appDateZ, "yyyy-MM-dd");

  // Update current time every 30 seconds to make it real-time
  // useInterval(
  //   function timer() {
  //     const currentLocalTime = dayjs()
  //       .hour(dayjs().hour())
  //       .minute(dayjs().minute())
  //       .toDate();

  //     setCurrentTime(currentLocalTime);
  //   },
  //   30 * 1000,
  //   appDate
  // );
  useEffect(() => {
    if (liveGraph) {
      const biggestSurplusValue = liveGraph?.reduce(
        // @ts-ignore
        (el, max) => (el?.data > max.data ? { data: el.data } : max),
        { data: 0 }
      );

      const biggestDeficitValue = liveGraph?.reduce(
        // @ts-ignore
        (el, max) => (el?.data < max.data ? { data: el.data } : max),
        { data: 0 }
      );

      setBiggestSurplus(biggestSurplusValue);
      setBiggestDeficit(biggestDeficitValue);

      const biggest = Math.max(
        Math.abs(biggestDeficitValue!.data),
        Math.abs(biggestSurplusValue!.data)
      );

      setKcalDomain([biggest * -1 - 500, biggest + 500]);
    }
  }, [liveGraph]);

  const biggest = Math.max(
    Math.abs(biggestSurplus?.data),
    Math.abs(biggestDeficit?.data)
  );

  useEffect(() => {
    appDateZ = new Date(`${appDate.toISOString().replace("Z", "")}`);
    const ticks = [];

    for (
      let i = startOfDay(appDateZ);
      isSameDay(i, appDateZ);
      i = addMinutes(i, 60)
    ) {
      ticks.push(i);
    }
    setTickValues(ticks);
  }, [appDate]);

  useEffect(() => {
    if (day && liveGraph) {
      const workoutLines: any[] = [];

      day.workouts
        .filter((workout) => workout?.status === Workout_Status.Active)
        .map((workout) => {
          const points = liveGraph.filter((i) => {
            const time = setLiteralDateTime(
              i?.time,
              getLiteralDateString(appDate)
            );
            const start = workout?.start;
            const end = workout?.end;

            return (
              dayjs(time).isSameOrAfter(start, "m") &&
              dayjs(time).isSameOrBefore(end, "m")
            );
          });

          workoutLines.push({
            workout,
            data: points,
          });
        });

      setWorkouts(workoutLines);
    }
    graphRefetch();
  }, [day, liveGraph]);

  // We hide the graph if it's in the future. You can only
  // See the graph today and previous dates
  //const isFutureDay = dayjs(appDate).utc().isAfter(new Date(), "date");
  const isFutureDay = isAfter(appDateZ, currentTime);

  if (liveGraphLoading || dayLoading) return <Loading />;

  const isFuture = dayjs(appDateZ).isAfter(currentTime, "date");
  const isPast = dayjs(appDateZ).isBefore(currentTime, "date");

  if (isFutureDay) return <NoData liveGraph />;

  // This is the solid line for the past (any date before "today" [present day])
  const pastLine = isPast && (
    <VictoryLine
      interpolation="natural"
      data={liveGraph ?? []}
      x={(d) => parseTime(d.time, appDateZ)}
      y="data"
      style={{
        data: {
          stroke: "white",
          strokeWidth: 3,
        },
      }}
    />
  );

  // This is the solid line for the past of the present day
  const currentDayPastLine = isCurrentDay && (
    <VictoryLine
      interpolation="natural"
      data={
        liveGraph
          ? isCurrentDay
            ? liveGraph.filter((i) =>
                isBefore(
                  parseTime(i?.time, dayjs(appDateZ).toDate()),
                  currentTime
                )
              )
            : liveGraph
          : []
      }
      x={(d) => parseTime(d.time, appDateZ)}
      y="data"
      style={{
        data: {
          stroke: "white",
          strokeWidth: 2,
        },
      }}
    />
  );

  // This is the solid line for the future (a date after present date)
  const futureLine = isFuture && (
    <VictoryLine
      interpolation="natural"
      data={liveGraph ?? []}
      x={(d) => parseTime(d.time, appDateZ)}
      y="data"
      style={{
        data: {
          stroke: "white",
          strokeWidth: 3,
          strokeDasharray: 10,
        },
      }}
    />
  );

  // This is the dashed line for the future of the present day
  const currentDayFutureLine = isCurrentDay && (
    <VictoryLine
      interpolation="natural"
      data={
        liveGraph
          ? isCurrentDay
            ? liveGraph.filter((i) =>
                isAfter(parseTime(i?.time, appDateZ), currentTime)
              )
            : liveGraph
          : []
      }
      x={(d) => parseTime(d.time, appDateZ)}
      y="data"
      style={{
        data: {
          stroke: "white",
          opacity: 0.6,
          strokeWidth: 2,
          strokeDasharray: 6,
        },
      }}
    />
  );

  const mealPoints = liveGraph && day && (
    <VictoryScatter
      size={12}
      style={{
        data: {
          strokeWidth: 2,
          fill: ({ datum }) => {
            return datum.verifiedCarbCode
              ? (tw.color(
                  `carbcode${datum.verifiedCarbCode.toLowerCase()}-100`
                ) as string)
              : (tw.color("background-500") as string);
          },
          stroke: ({ datum }) => {
            return tw.color(
              `carbcode${datum.carbCode.toLowerCase()}-100`
            ) as string;
          },
        },
      }}
      data={day.meals
        .filter((meal) => meal?.mealType !== Meal_Type.IntraFuelling)
        .map((meal) => ({
          carbCode: meal?.carbCode,
          verifiedCarbCode: meal?.mealVerification?.carbCode,
          x: meal?.mealVerification?.time
            ? parseTime(
                getLiteralTime(new Date(meal?.mealVerification?.time)),
                appDateZ
              )
            : parseTime(meal?.time, appDateZ),
          y: liveGraph[
            liveGraph.findIndex((i) =>
              isSameMinute(
                parseTime(i!.time, appDateZ),
                meal?.mealVerification?.time
                  ? parseTime(
                      getLiteralTime(new Date(meal?.mealVerification?.time)),
                      appDateZ
                    )
                  : parseTime(meal?.time, appDateZ)
              )
            )
          ]?.data,
        }))}
    />
  );

  const workoutPoints = workouts.map((workout, index) => {
    if (!workout) return null;

    const start = parseTime(
      getLiteralTime(new Date(workout.workout.start)),
      new Date(appDateZ)
    );
    const end = parseTime(
      getLiteralTime(new Date(workout.workout.end)),
      new Date(appDateZ)
    );

    return (
      <VictoryLine
        interpolation="natural"
        key={index}
        data={workout.data}
        x={(d) => {
          const timeZ = parseTime(d.time, appDateZ);
          //console.log({ timeZ });
          return timeZ;
        }}
        y="data"
        labels={[""]}
        labelComponent={
          <LabelComponent
            biggest={biggest}
            activityId={workout.workout.activity.id}
            midpoint={(start.getTime() + end.getTime()) / 2}
          />
        }
        style={{
          data: {
            stroke: tw.color("activeblue-100"),
            strokeWidth: 4,
          },
        }}
      />
    );
  });

  const getNearestDataPointIndex = liveGraph
    ? liveGraph!.findIndex((i) =>
        isSameMinute(
          parseTime(i?.time, appDateZ),
          roundToNearestMinutes(currentTime, { nearestTo: 15 })
        )
      )
    : 0;

  const currentTimePoint = liveGraph && isCurrentDay && (
    <VictoryScatter
      size={8}
      style={{
        data: {
          fill: tw.color("carbcodehigh-100"),
        },
      }}
      data={[
        {
          x: currentTime,
          y: liveGraph[
            liveGraph?.findIndex(
              (i) => i?.time === `${dayjs().format("HH:mm")}:00.000Z`
            )
          ]?.data,
        },
      ]}
    />
  );

  const endOfDayPoint = liveGraphData?.predictedEnd && (
    <VictoryScatter
      dataComponent={<TheoreticalEndComponent />}
      data={[
        {
          x: subMinutes(endOfDay(currentTime), 20),
          y: liveGraphData?.predictedEnd,
        },
      ]}
    />
  );

  const handleCurrentTime = () => currentTime;

  const currentTimeLine = liveGraph && isCurrentDay && (
    <VictoryLine
      interpolation="natural"
      style={{
        data: {
          strokeWidth: 3,
          stroke: tw.color("carbcodehigh-400"),
        },
      }}
      x={handleCurrentTime}
    />
  );

  return (
    <Wrapper
      scrollEnabled={true}
      refreshing={liveGraphLoading}
      onRefresh={() => {
        refetch();
        graphRefetch();
      }}
    >
      <SafeAreaView
        onTouchStart={() => {
          //setScrollEnabled(false);
        }}
        //onTouchEnd={() => setScrollEnabled(true)}
        style={tw`flex-1`}
      >
        <SafeAreaView>
          {isCurrentDay && (
            <LiveGraphHeader
              data={liveGraph?.[getNearestDataPointIndex]?.data}
            />
          )}
          <View style={tw`-mt-8 -ml-8`}>
            <VictoryChart
              domain={{
                y: kcalDomain as any,
                x: [startOfDay(appDateZ), endOfDay(appDateZ)],
              }}
              width={width + 60}
              backgroundComponent={<Background y={50} height={300} />}
              height={400}
              style={{
                background: { opacity: 0.5, fill: tw.color("background-300") },
              }}
              containerComponent={
                <VictoryZoomContainer
                  zoomDimension="x"
                  allowPan={true}
                  allowZoom={false}
                  zoomDomain={{
                    x: isCurrentDay
                      ? [subHours(currentTime, 4), addHours(currentTime, 4)]
                      : [
                          addHours(startOfDay(appDateZ), 8),
                          addHours(startOfDay(appDateZ), 16),
                        ],
                  }}
                />
              }
            >
              {/* Set time values on the X axis and draw the lines */}
              <VictoryAxis
                crossAxis
                offsetY={50}
                style={{
                  grid: {
                    stroke: tw.color("background-500"),
                    strokeWidth: 1,
                  },
                  axis: {
                    stroke: tw.color("background-500"),
                    strokeWidth: 1,
                  },
                  tickLabels: { fill: "white", fontSize: 10 },
                }}
                tickFormat={(d) => {
                  if (!d) return "00:00";
                  return format(d, "HH:mm");
                }}
                tickValues={tickValues}
              />

              {/* Set kcal values on the Y axis and draw the lines */}
              <VictoryAxis
                dependentAxis
                tickCount={10}
                offsetX={75}
                label="kcal"
                crossAxis={false}
                style={{
                  grid: {
                    stroke: tw.color("background-500"),
                    strokeWidth: 1,
                  },
                  axis: {
                    stroke: tw.color("background-500"),
                    strokeWidth: 3,
                    display: "none",
                  },
                  axisLabel: {
                    fill: "white",
                    fontSize: 12,
                  },
                  tickLabels: { fill: "white", fontSize: 10 },
                }}
              />

              {/* Set the X axis in the mid of the graph and draw the line */}
              <VictoryAxis
                crossAxis
                style={{
                  axis: {
                    stroke: tw.color("background-100"),
                    strokeWidth: 1,
                  },
                  tickLabels: { display: "none" },
                }}
              />

              {pastLine}
              {currentDayPastLine}

              {futureLine}
              {currentDayFutureLine}

              {/* Draw workouts  */}
              {workoutPoints}

              {/* Draw a vertical line for the current time */}
              {currentTimeLine}

              {/* Draw the ending of the day */}
              {endOfDayPoint}

              {/* Draw a dot for the current time */}
              {currentTimePoint}

              {mealPoints}
            </VictoryChart>
          </View>
        </SafeAreaView>
        <Wrapper livegraph={true}>
          <View style={tw`mx-4`}>
            <Legend />
            <EndOfDay
              target={liveGraphData?.predictedEnd ?? 0}
              predicted={liveGraph ? liveGraph[liveGraph.length - 1]?.data : 0}
            />
            <DayLargest
              surplus={biggestSurplus?.data}
              deficit={biggestDeficit?.data}
            />
            {/* <DayCarbCodes meals={day?.meals} /> */}
          </View>
        </Wrapper>
      </SafeAreaView>
    </Wrapper>
  );
};

export default PrimaryStack_LiveGraphScreen;
