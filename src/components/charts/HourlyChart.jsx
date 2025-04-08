import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { generateHourlyTempChartData } from '../../lib/utils';

export default function HourlyChart({ data, dayIndex = 0, unit }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || !data.forecastday) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const chartData = generateHourlyTempChartData(data, dayIndex);

    // Update labels based on unit
    if (unit === 'f' && chartData.datasets) {
      const hourlyData = data.forecastday[dayIndex].hour;
      chartData.datasets[0].data = hourlyData.map(hour => hour.temp_f);
      chartData.datasets[1].data = hourlyData.map(hour => hour.feelslike_f);
    }

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255,.8)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: 'rgba(0, 0, 0, .1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}°${unit.toUpperCase()}`;
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return `${value}°${unit.toUpperCase()}`;
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.15)',
            },
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: 8,
              callback: function(value, index) {
                // Show fewer ticks on mobile
                if (window.innerWidth < 768) {
                  return index % 3 === 0 ? this.getLabelForValue(value) : '';
                }
                return this.getLabelForValue(value);
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        animations: {
          y: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      }
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, dayIndex, unit]);

  return (
    <div className="w-full h-60 md:h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
