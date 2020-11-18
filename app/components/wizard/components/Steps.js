import React, { useContext } from 'react'
import styled from 'styled-components'
import { StateContext } from '../state'

const Container = styled.div`
  width: 250px;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Steps = styled.div`
  height: 100%;
  ${({ numSteps }) => `padding-top: calc(100% / ${numSteps});`}

  display: flex;
  flex-direction: column;
  align-items: center;
`

const Step = styled.div`
  display: flex;
  height: 100%;
`

const Indicator = styled.div`
  z-index: 2;
  position: relative;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 3px solid #d2d5da;
  background-color: #d2d5da;
  transition: all 0.25s ease;

  ${({ active }) =>
    active &&
    `
    border-color: #4469b0;
  `}

  ${({ completed }) =>
    completed &&
    `
    border: 3px solid #4469b0;
    background-color: #4469b0;
  `}
`

const Title = styled.span`
  padding-left: 10px;
  margin-top: 5px;
  width: 120px;
  font-size: 14px !important;

  ${({ active }) =>
    active &&
    `
    font-weight: bold !important;
  `}
`

const Separator = styled.div`
  z-index: -1;
  position: absolute;
  left: 5px;
  top: 21px;
  width: 8px;
  height: calc(100% + 30px);
  background-color: #d2d5da;
  transition: all 0.25s ease;

  ${({ completed }) =>
    completed &&
    `
    top: 20px;
    background-color: #4469b0;
  `}
`

export default () => {
  const { steps, index } = useContext(StateContext)
  const displaySteps = steps.filter(s => s.title && !s.dontShowInProgress)

  return (
    <Container>
      <Steps numSteps={displaySteps.length}>
        {steps.map((s, i) => {
          if (!s.title || s.dontShowInProgress) return
          return (
            <Step key={`Step_${s.title}`}>
              <Indicator active={i === index} completed={i < index}>
                {i < steps.length - 1 && <Separator completed={i < index} />}
              </Indicator>
              <Title active={i === index}>{s.title}</Title>
            </Step>
          )
        })}
      </Steps>
    </Container>
  )
}
