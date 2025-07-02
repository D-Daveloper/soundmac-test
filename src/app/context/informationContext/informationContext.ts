'use client'

import { createContext } from "react"
import { INFORMATION_CONTEXT } from "./types"
import { defaultContext } from "./constants"

const InformationContext = createContext<INFORMATION_CONTEXT | undefined>(defaultContext)
export default InformationContext