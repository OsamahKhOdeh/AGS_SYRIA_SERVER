//New with cents//////////////////////////////////////////////////////////////////////////////////

const ones = ["", "one ", "two ", "three ", "four ", "five ", "six ", "seven ", "eight ", "nine "];
const teen = [
  "ten ",
  "eleven ",
  "twelve ",
  "thirteen ",
  "fourteen ",
  "fifteen ",
  "sixteen ",
  "seventeen ",
  "eighteen ",
  "nineteen ",
];
const tens = ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const high = ["hundred ", "thousand ", "million ", "billion "];
const tensOnes = (t, o) =>
  +t == 0 ? ones[+o] : +t == 1 ? teen[+o] : +t > 1 && +o == 0 ? tens[+t - 2] : tens[+t - 2] + "-" + ones[+o];
const fltN = (float) => [...parseFloat(float)?.toFixed(2)];
const stepper = (array, currency_word, sub_currency_word) => {
  const D = array[0];
  const C = array[1];
  let size = D.length;
  let word;
  switch (size) {
    case 0:
      word = C;
      break;
    case 1:
      word = tensOnes(0, D[0]) + currency_word + C;
      break;
    case 2:
      word = tensOnes(D[1], D[0]) + currency_word + C;
      break;
    case 3:
      word = tensOnes(0, D[2]) + high[0] + tensOnes(D[1], D[0]) + currency_word + C;
      break;
    case 4:
      word = tensOnes(0, D[3]) + high[1] + tensOnes(0, D[2]) + high[0] + tensOnes(D[1], D[0]) + currency_word + C;
      break;
    case 5:
      word = tensOnes(D[4], D[3]) + high[1] + tensOnes(0, D[2]) + high[0] + tensOnes(D[1], D[0]) + currency_word + C;
      break;
    case 6:
      word =
        tensOnes(0, D[5]) +
        high[0] +
        tensOnes(D[4], D[3]) +
        high[1] +
        tensOnes(0, D[2]) +
        high[0] +
        tensOnes(D[1], D[0]) +
        currency_word +
        C;
      break;
    case 7:
      word =
        tensOnes(0, D[6]) +
        high[2] +
        tensOnes(0, D[5]) +
        high[0] +
        tensOnes(D[4], D[3]) +
        high[1] +
        tensOnes(0, D[2]) +
        high[0] +
        tensOnes(D[1], D[0]) +
        currency_word +
        C;
      break;
    case 8:
      word =
        tensOnes(D[7], D[6]) +
        high[2] +
        tensOnes(0, D[5]) +
        high[0] +
        tensOnes(D[4], D[3]) +
        high[1] +
        tensOnes(0, D[2]) +
        high[0] +
        tensOnes(D[1], D[0]) +
        currency_word +
        C;
      break;
    case 9:
      word =
        tensOnes(0, D[8]) +
        high[0] +
        tensOnes(D[7], D[6]) +
        high[2] +
        tensOnes(0, D[5]) +
        high[0] +
        tensOnes(D[4], D[3]) +
        high[1] +
        tensOnes(0, D[2]) +
        high[0] +
        tensOnes(D[1], D[0]) +
        currency_word +
        C;
      break;
    case 10:
      word =
        tensOnes(0, D[9]) +
        high[3] +
        tensOnes(0, D[8]) +
        high[0] +
        tensOnes(D[7], D[6]) +
        high[2] +
        tensOnes(0, D[5]) +
        high[0] +
        tensOnes(D[4], D[3]) +
        high[1] +
        tensOnes(0, D[2]) +
        high[0] +
        tensOnes(D[1], D[0]) +
        currency_word +
        C;
      break;
    default:
      break;
  }
  word = word.trim();
  word =
    word == "one " + currency_word
      ? "one " + currency_word
      : word == currency_word + "and one cent"
      ? "one " + sub_currency_word
      : word == "one " + currency_word + "and one " + sub_currency_word
      ? "one " + currency_word + "and one " + sub_currency_word
      : word == "and undefined-undefinedcents"
      ? ""
      : word;
  word = word
    .replace(/(thousand|million)\s(hundred)/g, "$1")
    .replace(/(million)\s(thousand)/g, "$1")
    .replace(/(tycents)/g, "ty " + sub_currency_word + "s")
    .replace(/(tydollars)/g, "ty " + currency_word);
  return word;
};
export const moneyToEng = (number, currency) => {
  let sub_currency_word = "";
  let currency_word = "";
  if (currency === "USD") {
    currency_word = "USD ";
    sub_currency_word = "cent";
  }
  if (currency === "AED") {
    currency_word = "Dirhams ";
    sub_currency_word = "fils";
  }
  let R = fltN(number);
  let dec, c, cents;
  dec = R.splice(-3, 3);
  c = tensOnes(dec[1], dec[2]);
  cents = c == "one " ? "and one " + sub_currency_word : c == "" ? "" : `and ${c}${sub_currency_word}s`;
  return stepper([R.reverse(), cents], currency_word, sub_currency_word);
};
//End cents/////////////////////////////////////////////////////////////////////////////////
