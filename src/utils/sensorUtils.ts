export const formatSensorSerial = (serialNo: number, type: string): string => {
  if (type === '2') { // Hanwell IceSpy
    return serialNo.toString().padStart(8, '0');
  }
  return serialNo.toString();
};