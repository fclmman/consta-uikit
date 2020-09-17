import './MonthsSliderWrapper.css';

import React from 'react';

import { IconBackward } from '../../../icons/IconBackward/IconBackward';
import { IconForward } from '../../../icons/IconForward/IconForward';
import { Button } from '../../Button/Button';
import { cnDatePicker } from '../DatePicker';

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
      className={cnDatePicker('SliderButton')}
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

export const MonthsSliderWrapper: React.FC<MonthsPanelProps> = ({
  children,
  onMovePrev,
  isMovePrevDisabled,
  onMoveNext,
  isMoveNextDisabled,
}) => {
  return (
    <div className={cnDatePicker('Slider')}>
      <MovePeriodButton direction="backward" onClick={onMovePrev} disabled={isMovePrevDisabled} />
      {children}
      <MovePeriodButton direction="forward" onClick={onMoveNext} disabled={isMoveNextDisabled} />
    </div>
  );
};
