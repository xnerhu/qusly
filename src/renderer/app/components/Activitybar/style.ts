import styled, { css } from 'styled-components';

import { centerIcon, centerVertical } from '~/renderer/mixins';
import { transparency } from '~/renderer/constants';

const getIconOpacity = (selected: boolean, disabled: boolean) => {
  if (disabled) return transparency.icons.disabled;
  return selected ? 1 : transparency.icons.inactive;
}

export const StyledActivitybar = styled.div`
  width: 56px;
  height: 100%;
`;

interface ItemProps {
  icon: string;
  selected: boolean;
  disabled: boolean;
}

export const StyledItem = styled.div`
  width: 100%;
  height: 40px;
  cursor: pointer;
  position: relative;

  ${({ selected, disabled, icon }: ItemProps) => css`
    pointer-events: ${disabled ? 'none' : 'auto'};

    &::before {
      opacity: ${selected ? 1 : 0};
    }

    &::after {
      opacity: ${getIconOpacity(selected, disabled)};
      background-image: url(${icon});
    }
  `}

  &::before {
    content: "";
    position: absolute;
    left: 0px;
    width: 3px;
    height: 18px;
    background-color: #000;
    ${centerVertical()};
  }

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    ${centerIcon(24)};
  }

  &:hover::after {
    opacity: 1;
  }
`;
