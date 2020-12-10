import React, { useContext } from 'react'
import styled from 'styled-components'
import { actions, StateContext } from '../state'

const ContactInfo = styled.div`
  font-size: 18px !important;
  height: 100%;
`

const Text = styled.span``

const Input = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;

  > span {
    width: 75px;
  }
  > textarea {
    width: 100%;
    height: 300px;
    resize: none;
  }
`

export default () => {
  const { freeform, dispatch } = useContext(StateContext)

  const onChange = e => {
    dispatch({
      action: actions.FREEFORM_EDIT,
      payload: {
        value: e.target.value,
      },
    })
  }

  return (
    <ContactInfo>
      <Text>Dela gärna med dig av övriga synpunkter på designen.</Text>
      <Input>
        <textarea
          placeholder="Dina kommentarer"
          onChange={e => onChange(e)}
          value={freeform}
        ></textarea>
      </Input>
    </ContactInfo>
  )
}
