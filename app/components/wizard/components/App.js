import React, { useContext } from 'react'
import { SeeThroughController } from 'react-see-through'

import styled from 'styled-components'
import Modal from './Modal'
import Step from './Step'
import ProgressIndicator from './ProgressIndicator'
import ContactInfo from './ContactInfo'
import Intro from './Intro'
import { actions, StateContext } from '../state'

import Button from './Button'
import InstallationInfo from './InstallationInfo'
import Tabbed from './Tabbed'

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
  padding: 36px;
  height: 100%;
  font-size: 18px !important;

  > ul {
    list-style: disc;
  }

  ${({ lessPadding }) => lessPadding && `padding-top: 0; padding-bottom: 10px;`}
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Removing = styled.div`
  padding: 36px;
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

const componentForStep = (step, skipped) => {
  let name = step.name
  if (step.subSteps) {
    name = step.subSteps[step.subStepIndex].name
  }
  switch (name) {
    case 'intro':
      return <Intro />
    case '':
      return (
        <TextContent>
          Svara på några frågor för att få en enklare design på Facebook.
          <br />
          <br />
          Du kan hoppa över detta och göra det senare genom inställningarna.
        </TextContent>
      )
    case 'share-data-info':
      return (
        <TextContent lessPadding>
          Kul att du vill dela med dig av data! Följande är den data vi samlar
          på samt vad syftet är med datat. Du kan när som helst välja att ta
          tillbaka ditt data genom att klicka på ikonen högst upp.
          <br />
          <br />
          <ul>
            <li>Varje gång du öppnar facebook och tidpunkten</li>
            <li>
              Varje gång du ändrar inställningar för vad som ska visas av
              facebook genom detta tillägg
            </li>
            <li>Svar på enkät varje vecka</li>
          </ul>
          <br />
          Syftet med datainsamlingen är att ta reda på hur det upplevs när
          gränssnittet för en tjänst man använder sig av ändras.
          <br />
          <br />
          Varje vecka visas några frågor som du svarar på som har att göra med
          din upplevelse av tillägget.
        </TextContent>
      )
    case 'share-contact-info':
      return <ContactInfo />
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
      return <Step />
  }
}

const buttonsForStep = (step, selectedValue, dispatch, skipped, contact) => {
  let name = step.name
  if (step.subSteps) {
    name = step.subSteps[step.subStepIndex].name
    selectedValue = step.selectedValues[step.subStepIndex]
  }
  switch (name) {
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
              setTimeout(() => dispatch({ action: actions.EXIT }), 3000)
            }}
            style={{ marginLeft: 20 }}
          >
            Slutför
          </Button>
        </>
      )
    default:
      let disabled = selectedValue === null && step.title
      if (name === 'share-contact-info') {
        disabled = !contact.age || !contact.sex
      }
      if (name === 'share-data-info') {
        disabled = false
      }

      return (
        <>
          <Button
            onClick={() => dispatch({ action: actions.BACKWARD })}
            secondary
          >
            Föregående
          </Button>
          <Button
            disabled={disabled}
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
    selectedValues,
    completed,
    steps,
    index,
    removing,
    contact,
    showInstalledInfo,
    tabbed,
    dispatch,
  } = useContext(StateContext)
  const selectedValue = selectedValues[index]
  const step = steps[index]
  const skippedQuestions = selectedValues[1] === 0
  if (completed && showInstalledInfo) {
    return <InstallationInfo />
  }
  if (tabbed) {
    return <Tabbed />
  }
  if (completed) return null
  return (
    <SeeThroughController maskColor="rgba(0, 0, 0, 0.4)">
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
                  contact
                )}
              </ButtonContainer>
            </Content>
          </Modal>
        )}
      </Container>
    </SeeThroughController>
  )
}
