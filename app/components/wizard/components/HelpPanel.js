import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import Tooltip from 'react-power-tooltip'

import { StateContext } from '../state'

import HelpIcon from './HelpIcon'

const Container = styled.div`
  width: 329px;
  padding: 20px;
`

const Title = styled.h1`
  font-weight: bold !important;
  font-size: 18px !important;
`

const Description = styled.p`
  position: relative;
`

const Image = styled.img`
  max-width: 100%;
`

const getImage = image => {
  let imagePath
  try {
    imagePath = chrome.runtime.getURL(`images/tooltip/${image}.png`)
  } catch (e) {
    imagePath = `./app/images/tooltip/${image}.png`
  }
  return imagePath
}

const TooltipContent = styled.span`
  display: inline-block;
  width: '250px';
  height: '60px';
  background-color: 'white';
  font-size: 13px !important;
`

export default () => {
  const { help, steps, index, highlightFeature, dispatch } = useContext(
    StateContext
  )
  const step = steps[index]

  if (!step.showHelpPanel) return null

  useEffect(() => {
    const handleClick = () => {
      if (highlightFeature) {
        dispatch({ payload: { highlightFeature: false } })
      }
    }
    window.addEventListener('mousedown', handleClick)

    return () => window.removeEventListener('mousedown', handleClick)
  }, [highlightFeature])

  return (
    <Container>
      {help ? (
        <>
          <Title>{help.title}</Title>
          <Description>
            {help.description.split('\n').map(text => {
              return (
                <span key={text}>
                  {text}
                  <br></br>
                </span>
              )
            })}
          </Description>
          <Image src={getImage(help.image)} />
        </>
      ) : (
        <>
          <Title>Hjälppanel</Title>
          <Description
            onClick={() => dispatch({ payload: { highlightFeature: false } })}
          >
            Tryck på den här symbolen <HelpIcon /> för att få en förklaring av
            funktionaliteten.
            <Tooltip
              show={highlightFeature}
              arrowAlign="start"
              position="left top"
              textBoxWidth="250px"
              fontWeight="300"
            >
              <TooltipContent>
                Hjälppanelen finns tillgänglig för att hjälpa till att förklara
                funktionalitet i Facebook under introduktionen.
              </TooltipContent>
            </Tooltip>
          </Description>
        </>
      )}
    </Container>
  )
}
