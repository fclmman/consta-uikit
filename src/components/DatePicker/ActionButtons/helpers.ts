import {
  addQuarters,
  differenceInQuarters,
  endOfDay,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfYear,
} from 'date-fns';

import { range } from '../../../utils/array';
import { DateLimitProps, DateRange } from '../DatePicker';

export const getQuarters = ({
  date,
  minDate,
  maxDate,
}: {
  date: Date;
} & DateLimitProps): DateRange[] => {
  const startDate = startOfYear(date);
  const endDate = endOfYear(date);
  const quarterAmount = differenceInQuarters(endDate, startDate) + 1;

  return range(quarterAmount).map((index) => {
    const start = startOfDay(addQuarters(startDate, index));
    const end = endOfDay(endOfQuarter(start));

    if (start > maxDate || end < minDate) {
      return [];
    }

    return [start > minDate ? start : minDate, end < maxDate ? end : maxDate];
  });
};
