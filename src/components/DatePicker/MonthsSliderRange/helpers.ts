import { addMonths, differenceInCalendarMonths, getDaysInMonth } from 'date-fns';

import { range } from '../../../utils/array';
import { DateLimitProps, DateRange, ValueProps } from '../DatePicker';

export const getMonths = ({ minDate, maxDate }: DateLimitProps): Date[] => {
  const monthAmount = differenceInCalendarMonths(maxDate, minDate) + 1;

  return range(monthAmount).map((i) => addMonths(minDate, i));
};

export const getBaseDate = (value?: DateRange) => {
  const [startDate, endDate] = value || [];

  return startDate || endDate;
};

export const getDateOffsetOnTimeline = ({
  date,
  minDate,
  tickWidth,
}: {
  date: Date;
  tickWidth: number;
} & Pick<DateLimitProps, 'minDate'>) => {
  const startDay = date.getDate();
  const monthsOffsetPx = differenceInCalendarMonths(date, minDate) * tickWidth;
  const daysOffsetPx = (tickWidth * startDay) / getDaysInMonth(date);

  return Math.round(monthsOffsetPx + daysOffsetPx);
};

export const getSelectedDayWidth = (date: Date, tickWidth: number) => {
  return Math.max(Math.round(tickWidth / getDaysInMonth(date)), 1);
};

export const getSelectedBlockStyles = ({
  value = [],
  minDate,
  tickWidth,
}: {
  tickWidth: number;
} & ValueProps<DateRange> &
  Pick<DateLimitProps, 'minDate'>) => {
  const baseDate = getBaseDate(value);

  if (!baseDate) {
    return {
      width: 0,
    };
  }

  const [startDate, endDate] = value;

  if (startDate && endDate) {
    const leftCorner = getDateOffsetOnTimeline({
      date: startDate,
      minDate,
      tickWidth,
    });
    const rightCorner = getDateOffsetOnTimeline({
      date: endDate,
      minDate,
      tickWidth,
    });

    return {
      left: leftCorner,
      width: Math.max(rightCorner - leftCorner, 1) + getSelectedDayWidth(endDate, tickWidth),
    };
  }

  return {
    left: getDateOffsetOnTimeline({
      date: baseDate,
      minDate,
      tickWidth,
    }),
    width: Math.max(getSelectedDayWidth(baseDate, tickWidth), 1),
  };
};
