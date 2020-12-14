import React, { useContext } from 'react'
import styled from 'styled-components'
import Modal from './Modal'
import Step from './Step'
import QuestionnaireComments from './QuestionnaireComments'
import InstallationInfo from './InstallationInfo'
import { actions, StateContext } from '../state'

import Button from './Button'

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
      return (
        <TextContent>
          <h1>Hej!</h1>
          <br />
          <br />
          För 7 dagar sen installerade du Klara Facebook. som gav dig en enklare
          design av Facebook. Vi skulle nu vilja att du svarar på 7 korta frågor
          om hur du tycker att designen fungerar.
          <br />
          <br />
          Om du vill kan du hoppa över detta och svara senare.
          <br />
          <br />
          När du installerade Klara Facebook valde du också att delta i en
          studie från Göteborgs Universitet. Du kan när som helt välja att
          avbryta din medverkan. <a>Läs mer om studien och hantera samtycke.</a>
          <br />
          <br />
          Tack för din medverkan!
        </TextContent>
      )
    case 'comments':
      return <QuestionnaireComments />
    case 'finish':
      return (
        <TextContent>
          Tack!
          <br></br>
          <br></br>
          Dina synpunkter hjälper oss förstå vad som fungerar bra, och vad som
          behöver förbättras i designen.
          <br></br>
          <br></br>
          Du kan nu välja att gå tillbaka och redigera dina svar, eller skicka
          in svaren genom att klicka på Slutför.
          <br></br>
          <br></br>
          Du kan när som helst läsa mer om studien, stänga av tillägget, eller
          ändra utseendet på Facebook genom att köra tilllägget igen. Du ser
          dessa val om du klickar på uppe i högra hörnet.
          <br></br>
          <br></br>
          Tack igen för din medverkan!
        </TextContent>
      )
    default:
      return <Step />
  }
}

const buttonsForStep = (step, selectedValue, dispatch) => {
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
            onClick={() => dispatch({ action: actions.DONE })}
            style={{ marginLeft: 20 }}
          >
            Slutför
          </Button>
        </>
      )
    default:
      let disabled = selectedValue === null && step.title
      if (name === 'comments') {
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
    showInstalledInfo,
    steps,
    index,
    dispatch,
  } = useContext(StateContext)
  const selectedValue = selectedValues[index]
  const step = steps[index]
  if (completed && showInstalledInfo) {
    return <InstallationInfo />
  }
  if (completed) return null
  return (
    <Container>
      <Modal>
        <Content>
          {componentForStep(step)}
          <ButtonContainer>
            {buttonsForStep(step, selectedValue, dispatch)}
          </ButtonContainer>
        </Content>
      </Modal>
    </Container>
  )
}
