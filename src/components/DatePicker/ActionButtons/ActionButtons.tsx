import './ActionButtons.css';

import React from 'react';

import { Button } from '../../Button/Button';
import { cnDatePicker, DateLimitProps, DateRange } from '../DatePicker';

import { getQuarters } from './helpers';

type Props = {
  currentVisibleDate: Date;
  showQuartersSelector: boolean;
  onSelect: (value: DateRange) => void;
  onApply: () => void;
} & DateLimitProps;

export const ActionButtons: React.FC<Props> = ({
  currentVisibleDate,
  showQuartersSelector,
  minDate,
  maxDate,
  onSelect,
  onApply,
}) => {
  const currentYear = currentVisibleDate.getFullYear();
  const quarters = getQuarters({ date: currentVisibleDate, minDate, maxDate });

  return (
    <div className={cnDatePicker('ActionButtons')}>
      <div className={cnDatePicker('Quarters')}>
        {showQuartersSelector &&
          quarters.map((quarter, idx) => (
            <Button
              key={idx}
              label={`${idx + 1} кв. ${currentYear}`}
              className={cnDatePicker('Quarter')}
              size="xs"
              view="ghost"
              disabled={!quarter.length}
              onClick={() => onSelect(quarter)}
            />
          ))}
      </div>
      <Button label="Выбрать" size="xs" view="primary" onClick={onApply} />
    </div>
  );
};
