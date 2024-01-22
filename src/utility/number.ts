export const toFixedNumber = (
  number: number,
  digits: number,
  base = 10) => {
  const pow = Math.pow(base ?? 10, digits);
  return Math.round(number * pow) / pow;
};

const gcd = (a: number, b: number): number => {
  if (b <= 0.0000001) {
    return a;
  } else {
    return gcd(b, a % b);
  }
};

const formatDecimalToFraction = (decimal: number) => {
  // 特殊情况处理：0.33 和 0.66
  if (Math.abs(decimal - 0.33) < 0.011) {
    return '1/3';
  } else if (Math.abs(decimal - 0.66) <= 0.011) {
    return '2/3';
  } else {
    // 通用情况
    const length = decimal.toString().length - 2;

    let denominator = Math.pow(10, length);
    let numerator = Math.round(decimal * denominator);
    
    const divisor = gcd(numerator, denominator);
  
    numerator /= divisor;
    denominator /= divisor;
  
    return `${Math.floor(numerator)}/${Math.floor(denominator)}`;
  }
};

export const formatNumberToFraction = (number: number) => {
  const decimal = (1 - number % 1) > 0.01
    ? Math.round((number % 1) * 100) / 100  // 直接将小数转为整数以提高精度
    : 0;
  const integer = Math.round(Math.abs(number - decimal));
  const fraction = decimal !== 0
    ? formatDecimalToFraction(Math.abs(decimal))
    : '';
  const sign = number > 0 ? '+' : '-';
  const whole = integer > 0
    ? fraction ? `${integer} ` : integer
    : '';
  return `${sign}${whole}${fraction}`;
};
