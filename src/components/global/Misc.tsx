import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import CustomText from './CustomText'

const Misc = () => {
    return (
        <View style={styles.continer}>
            <CustomText fontSize={13} fontFamily='Okra-Bold'>
                Explore
            </CustomText>
            <Image source={require("../../assets/icons/wild_robot.jpg")} />
        </View >
    )
}
const styles = StyleSheet.create({
    continer: {
        paddingVertical: 20
    },
    adBanner: {
        width: '100%',
        height: 120,
        resizeMode: "cover",
        borderRadius: 20,
        marginVertical: 25,

    }
})
export default Misc