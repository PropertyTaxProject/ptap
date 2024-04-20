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
    case "property-options": {
      return {
        ...appeal,
        propertyOptions: action.propertyOptions,
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
      const { user, comparables, headers, target, propertyInfo } = action
      user.name = `${user.first_name || ``} ${user.last_name || ``}`
      return { ...appeal, user, comparables, headers, target, propertyInfo }
    }
    case "set-user-property": {
      return { ...appeal, userProperty: { ...action.userProperty } }
    }
    case "select-comparables": {
      return {
        ...appeal,
        selectedComparables: appeal.comparables.filter(
          ({ pin }) =>
            action.pins.includes(pin) || appeal.selected_primary === pin
        ),
      }
    }
    case "select-primary-comparable": {
      const selectedPins = appeal.selectedComparables.map(({ pin }) => pin)
      return {
        ...appeal,
        selected_primary: action.pin,
        selectedComparables: appeal.comparables.filter(
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
  eligibility: {},
  eligible: null,
  target: null,
  propertyInfo: null,
  agreement: true, // TODO: Remove from multiple places
  agreement_name: null,
  terms_name: null,
  agreement_date: null, // only populated by resume
  estimate: {},
  step: 1,
  selected: false,
  headers: [],
  comparables: [],
  selected_primary: null,
  selectedComparables: [],
  propertyOptions: null,
  user: null,
  userProperty: null,
  damage: null,
  damage_level: null,
  files: [],
  economic_obsolescence: false,
  resumed: false,
}
