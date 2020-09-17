import './DatePicker.css';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { classnames } from '@bem-react/classnames';
import { endOfDay, format, startOfDay } from 'date-fns';

import { IconWarning } from '../../icons/IconWarning/IconWarning';
import { cn } from '../../utils/bem';
import { Popover } from '../Popover/Popover';
import { Text } from '../Text/Text';
import { useTheme } from '../Theme/Theme';

import { ActionButtons } from './ActionButtons/ActionButtons';
import { Calendar } from './Calendar/Calendar';
import { InputDate } from './InputDate/InputDate';
import { MonthsSliderRange } from './MonthsSliderRange/MonthsSliderRange';
import { MonthsSliderSingle } from './MonthsSliderSingle/MonthsSliderSingle';
import { getCurrentVisibleDate, isDateFullyEntered, isDateIsInvalid, isDateRange } from './helpers';

export type DateRange = [Date?, Date?];

export const sizes = ['s', 'm', 'l'] as const;
export type Size = typeof sizes[number];

export type StyleProps = {
  size?: Size;
};

export type DateLimitProps = {
  minDate: Date;
  maxDate: Date;
};

export type ValueProps<V> = {
  value?: V;
};

type RenderControls<V> = (
  props: {
    onChange: (value?: V) => void;
    isInvalid: boolean;
    tooltipContent?: React.ReactNode;
    isCalendarOpened: boolean;
  } & ValueProps<V> &
    StyleProps,
) => React.ReactNode;

type SingleProps = {
  type: 'date';
  onChange: (value?: Date) => void;
  renderControls?: RenderControls<Date>;
} & ValueProps<Date>;

type RangeProps = {
  type: 'date-range';
  onChange: (value?: DateRange) => void;
  renderControls?: RenderControls<DateRange>;
} & ValueProps<DateRange>;

export type Data = DateLimitProps & (SingleProps | RangeProps);

type Props = DateLimitProps & StyleProps & (SingleProps | RangeProps);

const formatOutOfRangeDate = (date: Date) => format(date, 'dd.MM.yyyy');

export const cnDatePicker = cn('DatePicker');

const DateOutOfRangeTooptipContent: React.FC<DateLimitProps> = ({ minDate, maxDate }) => {
  return (
    <div className={cnDatePicker('WarningTooltip')}>
      <IconWarning size="xs" view="alert" className={cnDatePicker('IconWarning')} />
      <Text as="div" size="xs" view="primary" lineHeight="m">
        Укажите дату в промежутке {formatOutOfRangeDate(minDate)} - {formatOutOfRangeDate(maxDate)}
      </Text>
    </div>
  );
};

const defaultRenderSingleControl: RenderControls<Date> = (props) => {
  return <InputDate {...props} />;
};

const defaultRenderRangeControls: RenderControls<DateRange> = (props) => {
  const { value, onChange, tooltipContent, ...commonProps } = props;
  const [startDate, endDate] = value || [undefined, undefined];

  return (
    <>
      <InputDate
        {...commonProps}
        value={startDate}
        onChange={(date) => onChange([date, endDate])}
      />
      <Text as="span" view="primary" className={cnDatePicker('Delimiter')}>
        –
      </Text>
      <InputDate
        {...commonProps}
        value={endDate}
        onChange={(date) => onChange([startDate, date])}
        tooltipContent={tooltipContent}
      />
    </>
  );
};

export const DatePicker: React.FC<Props> = (props) => {
  /**
   * Не деструктурируем value и type из объекта props, т.к. при их деструктуризации
   * TypeScript выводит общий тип из объединения в пересечение, пример:
   * ```
   * // Исходные типы:
   * value: Date | DateRange
   * type: 'date' | 'date-range'
   * // Типы после деструктуризации:
   * value: Date & DateRange
   * type: unknown // из-за того, что строка не может быть `date` и `date-range` одновременно
   * ```
   * Вместо деструктуризации в местах обработки value используем type guard isDateRange,
   * чтобы разделять обработку для Date и DateRange через условия, а type можно проверять напрямую
   * без type guard, т.к. без деструктуризации он сохраняет исходный тип date | date-range.
   */
  const { minDate: sourceMinDate, maxDate: sourceMaxDate, size } = props;
  const minDate = startOfDay(sourceMinDate);
  const maxDate = endOfDay(sourceMaxDate);

  const controlsRef = useRef<HTMLDivElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [currentVisibleDate, setCurrentVisibleDate] = useState<Date>(
    getCurrentVisibleDate({ value: props.value, minDate, maxDate }),
  );
  const { themeClassNames } = useTheme();

  const baseCommonProps = {
    currentVisibleDate,
    minDate,
    maxDate,
  };
  const monthsPanelCommonProps = {
    ...baseCommonProps,
    onChange: setCurrentVisibleDate,
  };

  const handleApplyDate = () => {
    setIsTooltipVisible(false);
  };

  const handleSelectDate = (value: Date | DateRange) => {
    if (!isDateRange(value) && props.type === 'date') {
      return props.onChange(value);
    }

    if (isDateRange(value) && props.type === 'date-range') {
      return props.onChange(value);
    }
  };

  const handleSelectQuarter = (value: DateRange) => {
    setCurrentVisibleDate(
      getCurrentVisibleDate({ value: [value[0], undefined], minDate, maxDate }),
    );

    return handleSelectDate(value);
  };

  useLayoutEffect(() => {
    if (!props.value || !isDateFullyEntered(props.value)) {
      return;
    }

    const newVisibleDate = getCurrentVisibleDate({ value: props.value, minDate, maxDate });

    if (currentVisibleDate !== newVisibleDate) {
      setCurrentVisibleDate(newVisibleDate);
    }
    // отключаем проверку, чтобы избежать неявных эффектов, вызванных изменением всех props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, props.type, props.minDate, props.maxDate, isTooltipVisible]);

  const renderControls = () => {
    const isInvalid =
      props.type === 'date'
        ? isDateIsInvalid({ date: props.value, minDate, maxDate })
        : !!props.value && props.value.some((date) => isDateIsInvalid({ date, minDate, maxDate }));
    const tooltipContent = isInvalid && !isTooltipVisible && (
      <DateOutOfRangeTooptipContent minDate={minDate} maxDate={maxDate} />
    );
    const commonProps = { size, isInvalid, tooltipContent };

    if (props.type === 'date') {
      const renderSingle = props.renderControls || defaultRenderSingleControl;

      return renderSingle({
        ...commonProps,
        isCalendarOpened: isTooltipVisible,
        value: props.value,
        onChange: props.onChange,
      });
    }

    const renderRange = props.renderControls || defaultRenderRangeControls;

    return renderRange({
      ...commonProps,
      isCalendarOpened: isTooltipVisible,
      value: props.value,
      onChange: props.onChange,
    });
  };

  return (
    <div>
      <div
        className={cnDatePicker('Controls')}
        role="button"
        tabIndex={0}
        ref={controlsRef}
        onClick={() => setIsTooltipVisible(!isTooltipVisible)}
        onKeyDown={() => setIsTooltipVisible(!isTooltipVisible)}
      >
        {renderControls()}
      </div>
      {isTooltipVisible && (
        <Popover
          anchorRef={controlsRef}
          offset={4}
          direction="downCenter"
          possibleDirections={['upCenter', 'leftCenter', 'rightCenter', 'downCenter']}
          onClickOutside={handleApplyDate}
        >
          <div className={classnames(themeClassNames.color.invert, cnDatePicker('Tooltip'))}>
            {props.type === 'date' ? (
              <MonthsSliderSingle {...monthsPanelCommonProps} />
            ) : (
              <DndProvider backend={HTML5Backend}>
                <MonthsSliderRange
                  {...monthsPanelCommonProps}
                  value={isDateRange(props.value) ? props.value : undefined}
                />
              </DndProvider>
            )}
            <Calendar {...baseCommonProps} value={props.value} onSelect={handleSelectDate} />
            <ActionButtons
              {...baseCommonProps}
              showQuartersSelector={props.type === 'date-range'}
              onApply={handleApplyDate}
              onSelect={handleSelectQuarter}
            />
          </div>
        </Popover>
      )}
    </div>
  );
};
