import React, { useEffect, useState } from 'react';

const ForecastHeatmaps = ({ selectedYear }: { selectedYear: number }) => {
  const [renewableData, setRenewableData] = useState<Record<string, number> | null>(null);
  const [nonRenewableData, setNonRenewableData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const renewableRes = await fetch(`/data/heatmap_percent_renewable_${selectedYear}.json`);
        const renewableJson = await renewableRes.json();
        setRenewableData(renewableJson);

        const nonRenewableRes = await fetch(`/data/heatmap_percent_nonrenewable_${selectedYear}.json`);
        const nonRenewableJson = await nonRenewableRes.json();
        setNonRenewableData(nonRenewableJson);
      } catch (error) {
        console.error('Failed to fetch heatmap data', error);
      }
    };

    fetchData();
  }, [selectedYear]);

  // TODO: Render your maps here using renewableData and nonRenewableData
  // e.g. pass data to Leaflet heatmap or choropleth components

  return <div>Heatmaps will render here</div>;
};

export default ForecastHeatmaps;
