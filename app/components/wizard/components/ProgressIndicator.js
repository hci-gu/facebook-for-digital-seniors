import React from 'react'
import styled from 'styled-components'

const Ring = styled.div`
  margin-top: 25px;
  align-items: center;
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  filter: drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5));
  div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid #4469b0;
    border-radius: 50%;
    animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
  }
  div:nth-child(1) {
    animation-delay: -0.45s;
  }
  div:nth-child(2) {
    animation-delay: -0.3s;
  }
  div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const ProgressIndicator = () => {
  return (
    <Ring>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </Ring>
  )
}

export default ProgressIndicator
