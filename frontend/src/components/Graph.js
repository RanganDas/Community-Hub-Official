import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./Graph.css";

// Register Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const getDayWithSuffix = (day) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod10 = day % 10;
  const mod100 = day % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${day}st`;
  } else if (mod10 === 2 && mod100 !== 12) {
    return `${day}nd`;
  } else if (mod10 === 3 && mod100 !== 13) {
    return `${day}rd`;
  } else {
    return `${day}th`;
  }
};

// Example dates for the graph (last 7 days with gaps for staircase effect)
const dates = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i * 2); // Skip one day to create gaps
  return getDayWithSuffix(date.getDate()); // Format as "9th", "11th", etc.
}).reverse();

const Graph = ({ stats }) => {
  const { totalLikes, totalFavorites, totalFollowing, totalFollowers } = stats;

  // Get the current month's name
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Calculate staircase-like integer data for all metrics
  const likesData = Array.from({ length: dates.length }, (_, i) =>
    Math.floor((totalLikes / dates.length) * (i + 1))
  );
  const favoritesData = Array.from({ length: dates.length }, (_, i) =>
    Math.floor((totalFavorites / dates.length) * (i + 1))
  );
  const followingData = Array.from({ length: dates.length }, (_, i) =>
    Math.floor((totalFollowing / dates.length) * (i + 1))
  );
  const followersData = Array.from({ length: dates.length }, (_, i) =>
    Math.floor((totalFollowers / dates.length) * (i + 1))
  );

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: "Likes",
        data: likesData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        stepped: true,
        fill: true,
      },
      {
        label: "Favorites",
        data: favoritesData,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(153, 102, 255, 1)",
        pointBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        stepped: true,
        fill: true,
      },
      {
        label: "Supporting",
        data: followingData,
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(255, 159, 64, 1)",
        pointBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        stepped: true,
        fill: true,
      },
      {
        label: "Supporters",
        data: followersData,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        stepped: true,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow dynamic height
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 13,
            family: "Arial, sans-serif",
          },
          usePointStyle: true, // Use point styles instead of rectangles
          pointStyle: "circle", // Set the point style to 'circle'
          boxWidth: 15, // Width of the legend marker
          boxHeight: 10, // Optional: Adjust the height for a smaller marker
          textAlign: "start", // Align the text for better spacing
          padding: 30, // Space between the marker and the text
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        usePointStyle: true, // Use point styles instead of rectangles
        pointStyle: "circle", // Set the point style to 'circle'
        boxWidth: 15, // Width of the legend marker
        boxHeight: 10, // Optional: Adjust the height for a smaller marker
        textAlign: "start", // Align the text for better spacing
        padding: 30, 
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#666",
          font: {
            size: window.innerWidth <= 400 ? 10 : 12, // Smaller font for mobile
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          beginAtZero: true,
          color: "#666",
          stepSize: Math.ceil(
            Math.max(totalLikes, totalFavorites, totalFollowing, totalFollowers) / 10
          ),
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
        },
      },
    },
  };

  return (
    <div className="graph-wrapper">
      <h3 className="graph-title">Interaction Analytics (Last 7 Days)</h3>
      
      <Line data={chartData} options={chartOptions} />
      <p className="current-month">{currentMonth}</p>
    </div>
  );
};

export default Graph;
