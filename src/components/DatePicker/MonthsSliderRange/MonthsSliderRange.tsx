import './MonthsSliderRange.css';

import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  addMonths,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  endOfYear,
  isSameMonth,
  isSameYear,
  startOfYear,
} from 'date-fns';

import { groupBy } from '../../../utils/array';
import { Text } from '../../Text/Text';
import { cnDatePicker, DateLimitProps, DateRange, ValueProps } from '../DatePicker';
import { MonthsSliderWrapper } from '../MonthsSliderWrapper/MonthsSliderWrapper';

import { getBaseDate, getMonths, getSelectedBlockStyles } from './helpers';

type Props = {
  currentVisibleDate: Date;
  onChange: (date: Date) => void;
} & DateLimitProps &
  ValueProps<DateRange>;

const MOVE_STEP = 12;
const TICK_WIDTH = 32;
const MONTHS_AMOUNT_IN_RANGE = 2;
const DND_DATE_RANGE_TYPE = 'Date-range';

const TickSelector: React.FC<{
  offsetLeft: number;
}> = ({ offsetLeft }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [, dragRef] = useDrag({
    item: { type: DND_DATE_RANGE_TYPE },
  });

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={cnDatePicker('Selector', { dragging: isDragging })}
      style={{
        left: TICK_WIDTH * offsetLeft,
      }}
    />
  );
};

export const MonthsSliderRange: React.FC<Props> = ({
  value,
  onChange,
  currentVisibleDate,
  minDate: initialMinDate,
  maxDate: initialMaxDate,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetRatio, setOffsetRatio] = useState(0);

  const [, dropRef] = useDrop({
    accept: DND_DATE_RANGE_TYPE,
    drop: (_, monitor) => {
      const monitorCoords = monitor.getDifferenceFromInitialOffset();

      if (!monitorCoords || !monitorCoords.x) {
        return;
      }

      const { x } = monitorCoords;
      const monthsAmountToMove = Math.floor(x / TICK_WIDTH);

      if (!monthsAmountToMove) {
        return;
      }

      const newMonth = addMonths(currentVisibleDate, monthsAmountToMove);

      onChange(newMonth);
    },
  });

  const minDate = startOfYear(initialMinDate);
  const maxDate = addMonths(endOfYear(initialMaxDate), MONTHS_AMOUNT_IN_RANGE);
  const months = getMonths({ minDate, maxDate });
  const monthsGroupedByYear = groupBy(months, (month) => month.getFullYear());
  const maxOffsetRatio = isSameYear(minDate, maxDate)
    ? 0
    : differenceInCalendarYears(maxDate, minDate) - 1;
  const selectedBlockStyles = getSelectedBlockStyles({
    value,
    minDate,
    tickWidth: TICK_WIDTH,
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const tickIdx = months.findIndex((item) => isSameMonth(item, currentVisibleDate));

    setOffsetRatio(Math.floor(tickIdx / 12));

    /**
     * Отключаем проверку, так как положение расчитывается при первой отрисовке
     * и при смене текущей отображаемой даты, а отслеживание массива месяцев не
     * требуется потому что меняется на каждую отрисовку.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, currentVisibleDate]);

  const handleMovePrev = () => {
    offsetRatio > 0 && setOffsetRatio(offsetRatio - 1);
  };

  const handleMoveNext = () => {
    maxOffsetRatio > offsetRatio && setOffsetRatio(offsetRatio + 1);
  };

  return (
    <MonthsSliderWrapper
      onMovePrev={handleMovePrev}
      isMovePrevDisabled={offsetRatio === 0}
      onMoveNext={handleMoveNext}
      isMoveNextDisabled={offsetRatio === maxOffsetRatio}
    >
      <div
        ref={ref}
        className={cnDatePicker('Timeline')}
        style={{ ['--tick-width' as string]: `${TICK_WIDTH}px` }}
      >
        <div
          ref={dropRef}
          className={cnDatePicker('Ticks')}
          style={{ transform: `translateX(${-1 * offsetRatio * MOVE_STEP * TICK_WIDTH}px)` }}
        >
          <TickSelector
            offsetLeft={differenceInCalendarMonths(currentVisibleDate, startOfYear(minDate))}
          />
          {getBaseDate(value) && (
            <div className={cnDatePicker('Selected')} style={selectedBlockStyles} />
          )}
          {Object.entries(monthsGroupedByYear).map(([year, yearMonths], idxYear) => {
            const isYearActive = idxYear === offsetRatio;
            const yearNameView = isYearActive ? 'primary' : 'ghost';

            return (
              <div className={cnDatePicker('Year')} key={idxYear}>
                <Text
                  size="s"
                  as="div"
                  view={yearNameView}
                  weight="bold"
                  className={cnDatePicker('YearName', { active: isYearActive })}
                >
                  {year}
                </Text>
                {yearMonths.map((month, idxMonth) => {
                  const name = month.toLocaleDateString('ru', { month: 'short' }).replace('.', '');

                  return (
                    <div
                      key={idxMonth}
                      tabIndex={0}
                      className={cnDatePicker('Tick')}
                      role="button"
                      onClick={() => onChange(month)}
                      onKeyDown={() => onChange(month)}
                    >
                      <Text as="div" size="2xs" view="ghost">
                        {name}
                      </Text>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </MonthsSliderWrapper>
  );
};
