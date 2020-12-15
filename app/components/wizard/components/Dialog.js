import React, { useContext } from 'react'
import styled from 'styled-components'
import { StateContext, actions } from '../state'
import Navbar from './Navbar'
import Button from './Button'

const Container = styled.div`
  z-index: 1000 !important;
  position: absolute;
  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);
`

const Dialog = styled.div`
  z-index: 1001 !important;
  position: absolute;
  width: 400px;
  height: 350px;
  top: calc(50% - 175px);
  left: calc(50% - 200px);

  background-color: white;
  border-radius: 5px;
  overflow: hidden;

  ${({ isQuestionnaire }) =>
    isQuestionnaire &&
    `
    width: 340px;
    height: 225px;
    top: calc(50% - 125px);
    left: calc(50% - 150px);
    
    > div > div > h1 {
      text-align: center;
    }
  `}
`

const Content = styled.div`
  height: calc(100% - 35px);
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  > div {
    > h1 {
      font-size: 18px !important;
    }
    > p {
      margin-top: 26px;
    }
  }
`

const Buttons = styled.div``

export default ({ onClose }) => {
  const { dispatch, isQuestionnaire } = useContext(StateContext)

  return (
    <Container>
      <Dialog isQuestionnaire>
        <Navbar onClick={onClose} />
        <Content>
          <div>
            <h1>
              Vill du verkligen avsluta{' '}
              {isQuestionnaire ? 'formuläret' : 'introduktionen'}?
            </h1>
            <p>
              {isQuestionnaire
                ? ''
                : 'Om du avslutar nu behöver du göra om introduktionen för att kunna använda tillägget.'}
              {!isQuestionnaire && <br></br>}
              {!isQuestionnaire && <br></br>}
              {!isQuestionnaire &&
                'Nästa gång du besöker Facebook kommer introduktionen visas igen.'}
            </p>
          </div>
          <Buttons>
            <Button onClick={onClose} secondary>
              Avbryt
            </Button>
            <Button
              onClick={() => dispatch({ action: actions.ABORT })}
              style={{ marginLeft: 20 }}
            >
              Avsluta
            </Button>
          </Buttons>
        </Content>
      </Dialog>
    </Container>
  )
}
