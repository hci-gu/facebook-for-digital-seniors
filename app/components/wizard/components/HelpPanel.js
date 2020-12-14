import React, { useContext } from 'react'
import styled from 'styled-components'
import { SeeThrough } from 'react-see-through'

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

const Description = styled.p``

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

export default () => {
  const { help, steps, index, highlightFeature, dispatch } = useContext(
    StateContext
  )
  const step = steps[index]

  if (!step.showHelpPanel) return null

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
          <SeeThrough
            active={highlightFeature}
            onClick={() => dispatch({ payload: { highlightFeature: false } })}
            interactive
          >
            <Title>Hjälppanel</Title>
            <Description>
              Tryck på den här symbolen <HelpIcon /> för att få en förklaring av
              funktionaliteten.
            </Description>
          </SeeThrough>
        </>
      )}
    </Container>
  )
}
