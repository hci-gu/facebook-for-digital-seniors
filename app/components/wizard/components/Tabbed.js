import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import Tooltip from 'react-power-tooltip'
import { StateContext } from '../state'

const Container = styled.div`
  position: fixed;
  width: 100%;
`

const TabbedModal = styled.div`
  position: fixed;
  cursor: pointer;
  background-color: #4469b0;
  top: 75px;
  right: 0px;
  width: 32px;
  height: 145px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;

  color: white;

  > span {
    position: absolute;
    top: 137px;
    left: 3px;

    width: 150px;
    font-size: 16px !important;
    transform-origin: 0 0;
    transform: rotate(270deg);

    > img {
      width: 20px;
      height: 20px;
      padding: 2px;
      padding-right: 4px;
      margin-top: 2px;
      margin-right: 5px;
    }
  }
`

const TooltipContent = styled.div`
  font-size: 18px !important;
  font-weight: 300;
  color: #1c1e21 !important;
`

export default () => {
  const { dispatch } = useContext(StateContext)
  const [showTooltip, setShowTooltip] = useState(true)
  const listener = () => setShowTooltip(false)
  useEffect(() => {
    setTimeout(() => {
      window.addEventListener('click', listener)
    }, 100)

    return () => window.removeEventListener('click', listener)
  }, [listener])

  return (
    <TabbedModal onClick={() => dispatch({ payload: { tabbed: false } })}>
      <span>
        <img src={chrome.runtime.getURL(`images/icons/fb.png`)}></img>Fortsätt
        svara
      </span>
      <Tooltip
        show={showTooltip}
        arrowAlign="end"
        position="left center"
        textBoxWidth="350px"
        fontWeight="300"
      >
        <TooltipContent>
          Du kan fortsätta svara när det passar dig. Klicka på "Fortsätt svara"
          så börjar du igen där du slutade sist.
        </TooltipContent>
      </Tooltip>
    </TabbedModal>
  )
}
