'use client'

import { createContext } from "react"
import { defaultContext } from "./constants"
import { DASHBOARD_CONTEXT } from "./types"

const DashboardContext = createContext<DASHBOARD_CONTEXT | undefined>(defaultContext)
export default DashboardContext