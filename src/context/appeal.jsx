import PropTypes from "prop-types"
import React, { createContext, useEffect, useReducer } from "react"

export const AppealContext = createContext(null)
export const AppealDispatchContext = createContext(null)

const getInitialAppeal = (city) => {
  const sessionAppeal = window.sessionStorage.getItem(`appeal-${city}`)
  let appeal = initialAppeal
  try {
    appeal = sessionAppeal ? JSON.parse(sessionAppeal) : initialAppeal
  } catch (e) {
    console.error(e)
  }
  return { ...appeal, city }
}

export function AppealProvider({ city, children }) {
  const [appeal, dispatch] = useReducer(appealReducer, getInitialAppeal(city))

  useEffect(() => {
    window.sessionStorage.setItem(`appeal-${city}`, JSON.stringify(appeal))
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
  city: PropTypes.string,
  children: PropTypes.any,
}

function appealReducer(appeal, action) {
  switch (action.type) {
    case "property-options": {
      return { ...appeal, propertyOptions: action.propertyOptions }
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
        eligibility: { residence: action.residence, owner: action.owner },
      }
    }
    case "set-homeowner-info": {
      const { user, comparables, headers, target, propertyInfo } = action
      return { ...appeal, user, comparables, headers, target, propertyInfo }
    }
    case "set-user-property": {
      return { ...appeal, userProperty: { ...action.userProperty } }
    }
    case "select-comparables": {
      return {
        ...appeal,
        selectedComparables: appeal.comparables.filter(({ pin }) =>
          action.pins.includes(pin)
        ),
      }
    }
    case "set-damage": {
      return { ...appeal, damage: action.damage }
    }
    case "set-files": {
      return { ...appeal, files: action.files }
    }
    case "complete": {
      return { ...initialAppeal }
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
  estimate: {},
  step: 1,
  selected: false,
  headers: [],
  comparables: [],
  selectedComparables: [],
  propertyOptions: null,
  user: null,
  userProperty: null,
  files: [],
}
