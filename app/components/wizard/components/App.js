import React, { useContext } from 'react'
import styled from 'styled-components'
import Modal from './Modal'
import Step from './Step'
import ProgressIndicator from './ProgressIndicator'
import { actions, StateContext } from '../state'

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1000;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const TextContent = styled.p`
  padding: 42px;
  height: 100%;
  font-size: 18px !important;
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Removing = styled.div`
  padding: 42px;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h1 {
    font-weight: bold !important;
    font-size: 28px !important;
    color: #fff !important;
    text-shadow: 0px 3px 6px #000;
  }
`

const ButtonContainer = styled.div`
  width: 100%;
  align-self: flex-end;
  display: flex;
  justify-content: flex-end;
`

const Button = styled.button`
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

const componentForStep = (step, skipped) => {
  switch (step.name) {
    case 'intro':
      return (
        <TextContent>
          Svara på några frågor för att få en enklare design på Facebook.
          <br />
          <br />
          Du kan hoppa över detta och göra det senare genom inställningarna.
        </TextContent>
      )
    case 'finish':
      return (
        <TextContent>
          {skipped
            ? 'Klicka på slutför för att behålla Facebooks nuvarande utseende.'
            : 'Klicka på slutför för att få en enklare design på Facebook.'}
          <br />
          <br />
          {skipped
            ? 'Du kan alltid förenkla Facebook senare genom inställningarna.'
            : 'Du kan alltid återställa Facebook eller göra om frågorna genom inställningarna.'}
        </TextContent>
      )
    default:
      return <Step step={step} />
      break
  }
}

const buttonsForStep = (step, selectedValue, dispatch, skipped, altMode) => {
  switch (step.name) {
    case 'intro':
      return (
        <>
          <Button onClick={() => dispatch({ action: actions.EXIT })} secondary>
            Hoppa över
          </Button>
          <Button
            onClick={() => dispatch({ action: actions.FORWARD })}
            style={{ marginLeft: 20 }}
          >
            Starta
          </Button>
        </>
      )
    case 'finish':
      return (
        <>
          <Button
            onClick={() => dispatch({ action: actions.BACKWARD })}
            secondary
          >
            Föregående
          </Button>
          <Button
            onClick={() => {
              if (skipped) {
                dispatch({ action: actions.EXIT })
                return
              }
              dispatch({ action: actions.DONE })
              setTimeout(() => dispatch({ action: actions.EXIT }), 500)
            }}
            style={{ marginLeft: 20 }}
          >
            Slutför
          </Button>
        </>
      )
    default:
      return (
        <>
          <Button
            onClick={() => dispatch({ action: actions.BACKWARD })}
            secondary
          >
            Föregående
          </Button>
          <Button
            disabled={selectedValue === null && !altMode}
            onClick={() => dispatch({ action: actions.FORWARD })}
            style={{ marginLeft: 20 }}
          >
            Nästa
          </Button>
        </>
      )
  }
}

export default () => {
  const {
    altMode,
    selectedValues,
    completed,
    steps,
    index,
    removing,
    dispatch,
  } = useContext(StateContext)
  const selectedValue = selectedValues[index]
  const step = steps[index]
  const skippedQuestions = selectedValues[1] === 0
  const displayAltMode = altMode && index !== 1
  if (completed) return null
  return (
    <Container>
      {removing ? (
        <Removing>
          <h1>Uppdaterar Facebook efter dina önskemål</h1>
          <ProgressIndicator />
        </Removing>
      ) : (
        <Modal>
          <Content>
            {componentForStep(step, skippedQuestions)}
            <ButtonContainer>
              {buttonsForStep(
                step,
                selectedValue,
                dispatch,
                skippedQuestions,
                displayAltMode
              )}
            </ButtonContainer>
          </Content>
        </Modal>
      )}
    </Container>
  )
}
