"use client";

import React from "react";
import { ClientChart } from "./ClientChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PriceTrendChart() {
    const options = {
        chart: {
            type: "area",
            toolbar: { show: false },
            background: "transparent",
            fontFamily: "Inter, sans-serif",
        },
        colors: ["#8b5cf6", "#06b6d4"], // Violet, Cyan
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#a1a1aa" } },
        },
        yaxis: {
            labels: { style: { colors: "#a1a1aa" } },
        },
        grid: {
            borderColor: "#27272a", // Zinc-800
            strokeDashArray: 4,
        },
        theme: { mode: "dark" },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        tooltip: {
            theme: 'dark',
            style: {
                fontSize: '12px',
            },
            x: {
                show: true,
            },
        }
    };

    const series = [
        {
            name: "平均單價(萬/坪)",
            data: [45, 52, 48, 55, 59, 62, 65],
        },
    ];

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>價格走勢</CardTitle>
                <CardDescription>近半年單價趨勢分析</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {/* @ts-ignore - options type mismatch often happens with apexcharts types */}
                <ClientChart options={options} series={series} type="area" height="100%" width="100%" />
            </CardContent>
        </Card>
    );
}
