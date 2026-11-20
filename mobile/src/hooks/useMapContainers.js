import { useEffect, useState } from 'react';
import { useRegion } from '../context/RegionContext';
import { getAllContainers, getContainersByRegion } from '../api/containerService';

/** Bins to show on the map: the selected district, or the whole city. Shared by native and web maps. */
export default function useMapContainers() {
  const { selectedRegion } = useRegion();
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (selectedRegion ? getContainersByRegion(selectedRegion.id) : getAllContainers())
      .then((data) => { if (!cancelled) { setContainers(data); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedRegion]);

  return { containers, isLoading, failed, selectedRegion };
}
