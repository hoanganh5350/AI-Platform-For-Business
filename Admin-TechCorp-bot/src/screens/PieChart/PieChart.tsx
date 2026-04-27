// import styles from "./PieChart.module.scss";
import { useEffect, useRef, useState } from "react";
// import * as echarts from "echarts";
import { useDebounce } from "../../hook/useDebounce";
import ReactECharts from "echarts-for-react";

export const PieChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [size, setSize] = useState({
    width: chartRef.current?.clientWidth,
    height: chartRef.current?.clientHeight,
  });

  const sizeChart = useDebounce(size, 300);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
          { value: 484, name: "Union Ads" },
          { value: 300, name: "Video Ads" },
        ],
      },
    ],
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactECharts
        option={option}
        style={{
          height: `${sizeChart.height ?? "100%"}`,
          width: `${sizeChart.width ?? "100%"}`,
        }}
      />
    </div>
  );
};
