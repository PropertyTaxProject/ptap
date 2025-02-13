import PropTypes from "prop-types"
import React, { createContext, useEffect, useReducer } from "react"

export const AppealContext = createContext(null)
export const AppealDispatchContext = createContext(null)

const getInitialAppeal = (region) => {
  const sessionAppeal = window.sessionStorage.getItem(`appeal-${region}`)
  let appeal = initialAppeal
  try {
    appeal = sessionAppeal ? JSON.parse(sessionAppeal) : initialAppeal
  } catch (e) {
    console.error(e)
  }
  return { ...appeal, region }
}

export function AppealProvider({ region, children }) {
  const [appeal, dispatch] = useReducer(appealReducer, getInitialAppeal(region))

  useEffect(() => {
    window.sessionStorage.setItem(`appeal-${region}`, JSON.stringify(appeal))
  }, [appeal])

  return (
    <AppealContext.Provider value={appeal}>
      <AppealDispatchContext.Provider value={dispatch}>
        {children}
      </AppealDispatchContext.Provider>
    </AppealContext.Provider>
  )
}

AppealProvider.propTypes = {
  region: PropTypes.string,
  children: PropTypes.any,
}

function appealReducer(appeal, action) {
  switch (action.type) {
    case "search-properties": {
      return {
        ...appeal,
        search_properties: action.search_properties,
        uuid: action.uuid,
      }
    }
    case "set-target": {
      return {
        ...appeal,
        pin: action.pin,
        target: action.target,
        eligible: action.eligible,
      }
    }
    case "set-eligibility": {
      return {
        ...appeal,
        eligibility: {
          residence: action.residence,
          owner: action.owner,
          hope: action.hope,
        },
      }
    }
    case "set-agreement-name": {
      return {
        ...appeal,
        agreement_name: action.agreement_name,
      }
    }
    case "set-terms-name": {
      return { ...appeal, terms_name: action.terms_name }
    }
    case "set-homeowner-info": {
      const { user, comparables, target } = action
      return { ...appeal, user, comparables, target }
    }
    case "set-user-property": {
      return { ...appeal, property: { ...action.property } }
    }
    case "select-comparables": {
      return {
        ...appeal,
        selected_comparables: appeal.comparables.filter(
          ({ pin }) =>
            action.pins.includes(pin) || appeal.selected_primary === pin
        ),
      }
    }
    case "select-primary-comparable": {
      const selectedPins = appeal.selected_comparables.map(({ pin }) => pin)
      return {
        ...appeal,
        selected_primary: action.pin,
        selected_comparables: appeal.comparables.filter(
          ({ pin }) =>
            selectedPins.includes(pin) || appeal.selected_primary === pin
        ),
      }
    }
    case "set-damage-level": {
      return { ...appeal, damage_level: action.damage_level }
    }
    case "set-damage": {
      return { ...appeal, damage: action.damage }
    }
    case "set-files": {
      return { ...appeal, files: action.files }
    }
    case "set-economic-obsolescence": {
      return { ...appeal, economic_obsolescence: action.economic_obsolescence }
    }
    case "complete": {
      return { ...initialAppeal }
    }
    case "resume": {
      return { ...action.appeal, resumed: true }
    }
    default: {
      throw Error("Unknown action: " + action.type)
    }
  }
}

const initialAppeal = {
  pin: null,
  uuid: null,
  step: 1,
  target: null,
  eligibility: {},
  eligible: null,
  resumed: false,
  search_properties: null,
  selected_comparables: [],
  selected_primary: null,
  agreement: true,
  agreement_name: null,
  agreement_date: null,
  terms_name: null,
  comparables: [],
  user: null,
  property: null,
  damage: null,
  damage_level: null,
  economic_obsolescence: false,
  files: [],
}
