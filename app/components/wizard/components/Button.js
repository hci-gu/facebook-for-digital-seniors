import React from 'react'
import styled from 'styled-components'

export default styled.button`
  width: 120px;
  height: 35px;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  transition: all 0.2s ease;

  border-radius: 3px;
  border: 2px solid #4469b0;
  background-color: #4469b0;
  font-size: 17px !important;
  color: #fff;

  :hover {
    opacity: 0.9;
  }

  :active {
    background-color: #324e83;
  }

  ${({ secondary }) =>
    secondary &&
    `
    background-color: #fff;
    color: #4469b0;

    :active {
      background-color: #fff;
      border-color: #324e83;
      color: #324e83;
    }
  `}
  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
`
