import './DatePickerMonthsSliderWrapper.css';

import React from 'react';

import { IconBackward } from '../../../icons/IconBackward/IconBackward';
import { IconForward } from '../../../icons/IconForward/IconForward';
import { cn } from '../../../utils/bem';
import { Button } from '../../Button/Button';

const cnDatePickerMonthsSliderWrapper = cn('DatePickerMonthsSliderWrapper');

type MonthsPanelProps = {
  children: React.ReactNode;
  onMovePrev: () => void;
  isMovePrevDisabled: boolean;
  onMoveNext: () => void;
  isMoveNextDisabled: boolean;
};

const MovePeriodButton: React.FC<{
  direction: 'backward' | 'forward';
  onClick: () => void;
  disabled: boolean;
}> = ({ direction, onClick, disabled }) => {
  return (
    <Button
      className={cnDatePickerMonthsSliderWrapper('SliderButton')}
      size="m"
      view="clear"
      onlyIcon
      iconLeft={direction === 'backward' ? IconBackward : IconForward}
      iconSize="m"
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export const DatePickerMonthsSliderWrapper: React.FC<MonthsPanelProps> = ({
  children,
  onMovePrev,
  isMovePrevDisabled,
  onMoveNext,
  isMoveNextDisabled,
}) => {
  return (
    <div className={cnDatePickerMonthsSliderWrapper('Slider')}>
      <MovePeriodButton direction="backward" onClick={onMovePrev} disabled={isMovePrevDisabled} />
      {children}
      <MovePeriodButton direction="forward" onClick={onMoveNext} disabled={isMoveNextDisabled} />
    </div>
  );
};
