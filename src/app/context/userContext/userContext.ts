'use client'

import { createContext } from "react"
import { USER_CONTEXT } from "./types"
import { defaultContext } from "./constants"

const UserContext = createContext<USER_CONTEXT | undefined>(defaultContext)
export default UserContext