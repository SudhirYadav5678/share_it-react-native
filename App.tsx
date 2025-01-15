import { View, Text, Platform } from 'react-native'
import React, { useEffect } from 'react'
import Navgation from './src/navigation/Navgation'
import { requestPhotoPermission } from './src/utils/Constants'
import { checkFilePermissions } from './src/utils/libraryHelpers'

const App = () => {
  useEffect(() => {
    requestPhotoPermission()
    checkFilePermissions(Platform.OS)
  }, [])

  return (
    <Navgation />
  )
}

export default App