interface SignalStatus {
  color: string;
  iconColor: string;
  text: string;
}

export const getSignalStatus = (rssi: string | null): SignalStatus => {
  if (!rssi) {
    return {
      color: 'text-gray-500 dark:text-gray-400',
      iconColor: 'text-gray-400',
      text: 'N/A'
    };
  }

  const rssiValue = parseInt(rssi);
  
  if (rssiValue >= -70) {
    return {
      color: 'text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      text: `${rssi}dBm`
    };
  }
  
  if (rssiValue >= -90) {
    return {
      color: 'text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500 dark:text-amber-400',
      text: `${rssi}dBm`
    };
  }
  
  return {
    color: 'text-red-600 dark:text-red-400',
    iconColor: 'text-red-500 dark:text-red-400',
    text: `${rssi}dBm`
  };
};