import React, { useEffect, useContext } from 'react'
import styled from 'styled-components'
import { actions, StateContext } from '../state'
import HelpIcon from './HelpIcon'
import descriptionForPanel from '../descriptionForPanel'

const Container = styled.div`
  height: 100%;
`

const Question = styled.h1`
  font-size: 24px !important;
`

const Selections = styled.div`
  padding: 42px;
`

const Selection = styled.div`
  cursor: pointer;
  margin-top: 15px;
  font-size: 18px !important;
  user-select: none;

  display: flex;

  > label {
    margin-left: 10px;
    color: #000 !important;
  }

  [type='checkbox'] {
    margin-top: 5px;
  }

  [type='radio']:checked,
  [type='radio']:not(:checked) {
    position: absolute;
    left: -9999px;
  }
  [type='radio']:checked + label,
  [type='radio']:not(:checked) + label {
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    line-height: 20px;
    display: inline-block;
  }
  [type='radio']:checked + label:before,
  [type='radio']:not(:checked) + label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    border: 1px solid #4469b0;
    border-radius: 100%;
    background: #fff;
  }
  [type='radio']:checked + label:after,
  [type='radio']:not(:checked) + label:after {
    content: '';
    width: 14px;
    height: 14px;
    background: #4469b0;
    position: absolute;
    top: 3px;
    left: 3px;
    border-radius: 100%;
    transition: all 0.2s ease;
  }
  [type='radio']:not(:checked) + label:after {
    opacity: 0;
    transition: none;
    transform: scale(0);
  }
  [type='radio']:checked + label:after {
    opacity: 1;
    transform: scale(1);
  }
`

const renderTextWithHighlights = (dispatch, index, id, text, keywords) => {
  if (!keywords.length) return <label htmlFor={id}>{text}</label>
  const parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'))
  return (
    <label htmlFor={id}>
      {' '}
      {parts.map((part, i) => {
        if (keywords.indexOf(part) === -1) return <span key={i}>{part}</span>
        return (
          <span
            key={i}
            onClick={e => {
              e.preventDefault()
              dispatch({
                action: actions.HELP_PANEL,
                payload: {
                  image: `${index - 2}-${cleanKeyword(part)}`,
                  title: `${part[0].toUpperCase()}${part.slice(1)}`,
                  description: descriptionForPanel(cleanKeyword(part)),
                },
              })
            }}
          >
            <a style={{ fontWeight: 'bold', color: 'black' }}>{part}</a>
            <HelpIcon />
          </span>
        )
      })}{' '}
    </label>
  )
}

const cleanKeyword = keyword => {
  if (keyword[0] === ' ' && keyword[keyword.length - 1] === ' ') {
    keyword = keyword.slice(1, keyword.length - 1)
  }
  return keyword
    .replace(/ /g, '-')
    .replace('/', '-')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
}

export default ({ step }) => {
  const { selectedValues, index, dispatch } = useContext(StateContext)
  const selectedValue = selectedValues[index]

  const onChange = (e) => {
    dispatch({
      action: actions.SELECTION,
      payload: {
        index,
        value: parseInt(e.target.value),
      },
    })
  }
  return (
    <Container>
      <Question>{step.question}</Question>
      <Selections>
        {step.selections &&
          step.selections.map((selection, i) => (
            <Selection key={`Selection_${i}`}>
              <input
                type="radio"
                id={`${step.name}_${i}`}
                name={step.name}
                value={i}
                checked={selectedValue === i}
                onChange={e => onChange(e, i)}
              />
              {renderTextWithHighlights(
                dispatch,
                index,
                `${step.name}_${i}`,
                selection.text,
                selection.keywords
              )}
              <br />
            </Selection>
          ))}
      </Selections> 
    </Container>
  )
}
