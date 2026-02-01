"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ApexCharts with no SSR to avoid window is not defined error
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const ClientChart = (props: any) => {
    return <Chart {...props} />;
};
