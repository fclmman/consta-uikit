import './MonthsSliderSingle.css';

import React from 'react';
import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns';

import { Text } from '../../Text/Text';
import { cnDatePicker, DateLimitProps } from '../DatePicker';
import { getMonthTitle } from '../helpers';
import { MonthsSliderWrapper } from '../MonthsSliderWrapper/MonthsSliderWrapper';

type Props = {
  currentVisibleDate: Date;
  onChange: (date: Date) => void;
} & DateLimitProps;

const getIsGoToPrevMonthAllowed = (currentDate: Date, minDate: DateLimitProps['minDate']) => {
  return endOfMonth(subMonths(currentDate, 1)) >= minDate;
};

const getIsGoToNextMonthAllowed = (currentDate: Date, maxDate: DateLimitProps['maxDate']) => {
  return startOfMonth(addMonths(currentDate, 1)) <= maxDate;
};

const getTitle = (date: Date) => {
  return `${getMonthTitle(date)} ${date.getFullYear()}`;
};

export const MonthsSliderSingle: React.FC<Props> = ({
  currentVisibleDate,
  minDate,
  maxDate,
  onChange,
}) => {
  const isMovePrevAllowed = getIsGoToPrevMonthAllowed(currentVisibleDate, minDate);
  const isMoveNextAllowed = getIsGoToNextMonthAllowed(currentVisibleDate, maxDate);

  const handleMovePrev = () => {
    isMovePrevAllowed && onChange(subMonths(currentVisibleDate, 1));
  };

  const handleMoveNext = () => {
    isMoveNextAllowed && onChange(addMonths(currentVisibleDate, 1));
  };

  return (
    <MonthsSliderWrapper
      onMovePrev={handleMovePrev}
      isMovePrevDisabled={!isMovePrevAllowed}
      onMoveNext={handleMoveNext}
      isMoveNextDisabled={!isMoveNextAllowed}
    >
      <Text
        className={cnDatePicker('SliderTitle')}
        as="div"
        size="m"
        transform="uppercase"
        weight="bold"
        view="primary"
        spacing="xs"
      >
        {getTitle(currentVisibleDate)}
      </Text>
    </MonthsSliderWrapper>
  );
};
