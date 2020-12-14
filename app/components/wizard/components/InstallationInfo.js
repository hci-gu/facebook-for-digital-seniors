import React, { useContext } from 'react'
import styled from 'styled-components'
import Tooltip from 'react-power-tooltip'
import { StateContext } from '../state'

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`

const Positioned = styled.div`
  position: absolute;
  top: -25px;
  right: 70px;
  width: 25px;
  height: 25px;

  color: white;
`

const TooltipContent = styled.div`
  font-size: 18px !important;
  font-weight: 300;
  color: #1c1e21 !important;

  > img {
    width: 20px;
    height: 20px;
    padding: 2px;
    padding-right: 4px;
    margin-top: 2px;
  }
`

export default () => {
  const { dispatch } = useContext(StateContext)

  return (
    <Container
      onClick={() => dispatch({ payload: { showInstalledInfo: false } })}
    >
      <Positioned>
        <Tooltip
          show={true}
          alert="rgb(255, 0, 0)"
          arrowAlign="end"
          position="bottom center"
          textBoxWidth="350px"
          fontWeight="300"
        >
          <TooltipContent>
            Du kan när som helst läsa mer om studien, stänga av tillägget, eller
            ändra utseendet på Facebook genom att köra tilllägget igen.
            <br></br>
            <br></br>
            Det gör du genom att klicka på{' '}
            <img src={chrome.runtime.getURL(`images/icons/puzzle.png`)}></img>
            och sen välja{' '}
            <img src={chrome.runtime.getURL(`images/icons/fb.png`)}></img>Klara
            Facebook i menyn.
          </TooltipContent>
        </Tooltip>
      </Positioned>
    </Container>
  )
}
