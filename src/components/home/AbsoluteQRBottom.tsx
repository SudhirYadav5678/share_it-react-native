import { View, Text, Touchable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { bottomTabStyles } from '../../styles/bottomTabStyle'
import { navigate } from '../../utils/NavigationUtil'
import Icon from '../global/Icon'
import QRScannerMdal from '../modals/QRScannerMdal'

const AbsoluteQRBottom = () => {
    const [isVisible, setVisible] = useState(false)
    return (
        <>
            <View style={bottomTabStyles.container}>
                <TouchableOpacity onPress={() => navigate('ReceivedFileScreen')}>
                    <Icon name='apps-sharp' iconFamily='Ionicons' color='#333' size={24} />
                </TouchableOpacity>

                <TouchableOpacity style={bottomTabStyles.qrCode} onPress={() => setVisible(true)}>
                    <Icon name='qrcode-scan' iconFamily='MaterialCommunityIcons' color='#333' size={24} />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Icon name='beer-sharp' iconFamily='Ionicons' color='#333' size={24} />
                </TouchableOpacity>
            </View>
            {isVisible && <QRScannerMdal visible={isVisible} onClose={() => setVisible(false)} />}
        </>
    )
}

export default AbsoluteQRBottom