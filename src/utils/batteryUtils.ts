export const isLowBattery = (type: string, voltage: number): boolean => {
  switch (type) {
    case '1':
      return voltage < 3.3;
    case '2':
      return voltage < 1.4;
    default:
      return false;
  }
};

export const getBatteryStatus = (type: string, voltage: number): { color: string; text: string } => {
  const isLow = isLowBattery(type, voltage);
  return {
    color: isLow ? 'text-red-500' : 'text-green-500',
    text: `${voltage.toFixed(2)}V`
  };
};